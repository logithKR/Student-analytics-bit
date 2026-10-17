import os
from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from data_service import (
    load_data, get_dashboard_summary, get_subject_analytics,
    get_top_performers, get_class_division, get_grade_distribution,
    get_batch_comparison, get_at_risk_students
)

from model_service import (
    verify_model_loaded, predict_single, parse_and_predict_excel
)

from ai_service import (
    process_ai_query, execute_query_plan, get_schema_summary,
    AIQueryRequest, AIQueryResponse, QueryPlan
)

from logger_service import (
    get_ai_logs, get_ai_log_by_id, clear_ai_logs, get_ai_logs_stats
)

app = FastAPI(title="Academic Intelligence Platform API", version="1.0.0")

# Configure CORS cleanly from environment
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
allowed_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

# If wildcard is requested, credentials must be False per CORS specification
allow_creds = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load existing student data into memory at startup
print("Loading data from Excel files...")
STUDENT_DATA = load_data()
print(f"Loaded {len(STUDENT_DATA)} student records.")


class SubjectMark(BaseModel):
    name: str
    mark: float
    max_score: float = 50.0

class SinglePredictionRequest(BaseModel):
    student_id: str = Field(..., example="7376221CS101")
    student_name: str = Field(..., example="John Doe")
    subjects: Optional[List[SubjectMark]] = Field(None, example=[{"name": "Data Structures", "mark": 35.0, "max_score": 50.0}])
    internal_marks: Optional[List[float]] = Field(None, example=[35.0, 42.0, 18.0, 30.0, 22.0])

# ==========================================
# Prediction Engine Endpoints
# ==========================================

@app.get("/api/health")
def health_check():
    """Verifies API health, loaded student count, and model file availability."""
    model_status = verify_model_loaded()
    return {
        "status": "ok",
        "loaded_students_count": len(STUDENT_DATA),
        "model_status": model_status
    }


@app.post("/api/predict/single")
def predict_single_student(payload: SinglePredictionRequest):
    """Predicts pass/fail probabilities and risk status for a single student."""
    try:
        subjects_list = None
        if payload.subjects:
            subjects_list = [s.model_dump() if hasattr(s, 'model_dump') else dict(s) for s in payload.subjects]
            
        res = predict_single(
            student_id=payload.student_id,
            student_name=payload.student_name,
            subjects=subjects_list,
            internal_marks=payload.internal_marks
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/predict/bulk")
async def predict_bulk_excel(file: UploadFile = File(...)):
    """Accepts multipart file upload (.xlsx / .xls) and runs batch predictions."""
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file (.xlsx or .xls).")
    
    # 20MB file size ceiling to prevent memory exhaustion DoS
    MAX_FILE_SIZE = 20 * 1024 * 1024
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum supported size is 20MB.")
        
        res = parse_and_predict_excel(content)
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process Excel file: {str(e)}")


# ==========================================
# Dashboard Analytics Endpoints
# ==========================================

@app.get("/api/departments")
def get_departments():
    departments = sorted(list(set([s.get("department") for s in STUDENT_DATA if s.get("department")])))
    return {"departments": departments}


@app.get("/api/dashboard/summary")
def dashboard_summary(department: str = Query("All"), semester: str = Query("All")):
    return get_dashboard_summary(STUDENT_DATA, department, semester)


@app.get("/api/students")
def list_students(department: str = Query("All"), semester: str = Query("All"), search: str = Query("")):
    data = STUDENT_DATA
    if department and department != "All":
        data = [s for s in data if s.get("department") == department]
    if semester and semester != "All":
        data = [s for s in data if s["semester"] == semester]
        
    if search:
        search = search.lower()
        data = [s for s in data if search in s["registerNumber"].lower() or search in s["name"].lower()]
        
    return [{
        "registerNumber": s["registerNumber"],
        "name": s["name"],
        "semester": s["semester"],
        "gpa": s["gpa"],
        "result": s["result"],
        "failCount": s["failCount"]
    } for s in data]


@app.get("/api/students/{register_number}")
def student_details(register_number: str):
    records = [s for s in STUDENT_DATA if s["registerNumber"] == register_number]
    if not records:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "registerNumber": records[0]["registerNumber"],
        "name": records[0]["name"],
        "records": records
    }


@app.get("/api/dashboard/subject-analytics")
def subject_analytics(department: str = Query("All"), semester: str = Query("All")):
    return get_subject_analytics(STUDENT_DATA, department, semester)


@app.get("/api/dashboard/semester-trends")
def semester_trends(department: str = Query("All")):
    from data_service import get_semester_trends
    return get_semester_trends(STUDENT_DATA, department)


@app.get("/api/dashboard/top-performers")
def top_performers(department: str = Query("All"), semester: str = Query("All"), limit: int = Query(5)):
    return get_top_performers(STUDENT_DATA, department, semester, limit)


@app.get("/api/dashboard/class-division")
def class_division(department: str = Query("All"), semester: str = Query("All")):
    return get_class_division(STUDENT_DATA, department, semester)


@app.get("/api/dashboard/grade-distribution")
def grade_distribution(department: str = Query("All"), semester: str = Query("All")):
    return get_grade_distribution(STUDENT_DATA, department, semester)


@app.get("/api/dashboard/batch-comparison")
def batch_comparison(department: str = Query("All")):
    return get_batch_comparison(STUDENT_DATA, department)


@app.get("/api/dashboard/at-risk")
def at_risk_students(department: str = Query("All"), semester: str = Query("All")):
    return get_at_risk_students(STUDENT_DATA, department, semester)


@app.post("/api/dashboard/reload")
def reload_dashboard_data():
    """Hot-reloads data from the dataset folder without restarting the server."""
    global STUDENT_DATA
    STUDENT_DATA = load_data()
    return {
        "status": "success",
        "message": f"Successfully reloaded {len(STUDENT_DATA)} student records.",
        "count": len(STUDENT_DATA)
    }


# ==========================================
# AI Analytics & Dynamic Visualization Endpoints
# ==========================================

@app.post("/api/ai/query", response_model=AIQueryResponse)
def handle_ai_query(payload: AIQueryRequest):
    """
    Translates a natural language question into a validated query plan,
    executes read-only aggregation over the student database,
    and returns real results bound to a structured chart configuration.
    """
    try:
        return process_ai_query(
            question=payload.question,
            student_data=STUDENT_DATA,
            mode=payload.mode,
            history=payload.history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process AI query: {str(e)}")


@app.get("/api/ai/schema")
def handle_ai_schema():
    """Returns the database catalog and field definitions for schema discovery."""
    return get_schema_summary()


@app.post("/api/ai/execute-plan")
def handle_execute_plan(plan: QueryPlan):
    """Directly executes a validated read-only QueryPlan against the dataset."""
    try:
        res = execute_query_plan(plan, STUDENT_DATA)
        return {
            "status": "success",
            "data": res["rows"],
            "columns": [c.model_dump() if hasattr(c, 'model_dump') else dict(c) for c in res["columns"]],
            "totalRows": res["totalRows"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute query plan: {str(e)}")


# ==========================================
# AI Audit Logs Endpoints
# ==========================================

@app.get("/api/ai/logs")
def handle_get_ai_logs(
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    mode: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Returns the list of AI query audit logs with optional filters."""
    return get_ai_logs(limit=limit, status=status, mode=mode, search=search)


@app.get("/api/ai/logs/stats")
def handle_get_ai_logs_stats():
    """Returns summary metrics about logged AI queries (counts, success rate, latency)."""
    return get_ai_logs_stats()


@app.get("/api/ai/logs/{log_id}")
def handle_get_ai_log_by_id(log_id: str):
    """Returns full details of a specific AI interaction log by ID."""
    entry = get_ai_log_by_id(log_id)
    if not entry:
        raise HTTPException(status_code=404, detail="AI log entry not found")
    return entry


@app.delete("/api/ai/logs")
def handle_clear_ai_logs():
    """Clears all logged AI queries."""
    clear_ai_logs()
    return {"status": "success", "message": "All AI interaction logs cleared."}
