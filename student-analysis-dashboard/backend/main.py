import os
from fastapi import FastAPI, Query, UploadFile, File, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from auth_db import (
    init_db, create_user, authenticate_user, create_access_token,
    decode_access_token, get_user_by_email, get_user_by_id
)

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

from report_builder_service import (
    get_student_report_dataset,
    get_department_report_dataset,
    generate_factual_ai_insight,
    chat_with_report_ai
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

# Auto-create SQLite database and ensure tables exist
print("Initializing SQLite database for authentication...")
init_db()

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


# ==========================================
# Report Builder Module Endpoints
# ==========================================

class ReportInsightRequest(BaseModel):
    scope: str = Field(default="student", example="student")
    data: Dict[str, Any] = Field(default_factory=dict)
    insight_type: str = Field(default="summary", example="summary")

class ReportChatRequest(BaseModel):
    question: str = Field(..., example="What are the student's strongest subjects?")
    scope: str = Field(default="student", example="student")
    entity_data: Dict[str, Any] = Field(default_factory=dict)
    available_components: List[Dict[str, Any]] = Field(default_factory=list)
    history: Optional[List[Dict[str, Any]]] = None


@app.get("/api/report-builder/student/{register_number}")
def get_report_builder_student(register_number: str):
    """
    Fetches real academic records across all semesters for a student and
    returns structured metadata, summary stats, and available chart configurations.
    """
    dataset = get_student_report_dataset(STUDENT_DATA, register_number)
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail=f"Student with register number '{register_number}' not found in academic database."
        )
    return dataset


@app.get("/api/report-builder/department")
def get_report_builder_department(
    department: str = Query("All"),
    semester: str = Query("All")
):
    """
    Fetches cohort statistics for the specified department and semester,
    returning structured KPI data, distributions, and available chart components.
    """
    return get_department_report_dataset(STUDENT_DATA, department, semester)


@app.post("/api/report-builder/ai-insight")
def get_report_builder_ai_insight(payload: ReportInsightRequest):
    """
    Generates a factual, non-hallucinated academic diagnosis summary for a student or cohort.
    """
    try:
        insight = generate_factual_ai_insight(
            scope=payload.scope,
            data=payload.data,
            insight_type=payload.insight_type
        )
        return {
            "status": "success",
            "insight": insight
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insight: {str(e)}")


@app.post("/api/report-builder/chat")
def get_report_builder_chat(payload: ReportChatRequest):
    """
    Factual conversational assistant for the Report Builder canvas.
    Answers natural language questions strictly grounded in the loaded student/department dataset,
    and returns relevant component recommendations.
    """
    try:
        res = chat_with_report_ai(
            question=payload.question,
            scope=payload.scope,
            entity_data=payload.entity_data,
            available_components=payload.available_components,
            history=payload.history,
            student_data=STUDENT_DATA
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")


# ==========================================
# Authentication & User Management Endpoints (SQLite)
# ==========================================

class RegisterRequest(BaseModel):
    email: str = Field(..., example="faculty@bit.edu")
    full_name: str = Field(..., example="Dr. Ramesh")
    department: str = Field(..., example="Computer Science & Engineering")
    role: str = Field(default="Faculty", example="Faculty")
    password: str = Field(..., min_length=6, example="Secret123")

class LoginRequest(BaseModel):
    email: str = Field(..., example="admin@bit.edu")
    password: str = Field(..., example="Admin@1234")


@app.post("/api/auth/register")
def register_user(payload: RegisterRequest):
    """Registers a new faculty/staff user into SQLite with bcrypt hashed password."""
    try:
        user = create_user(
            email=payload.email,
            full_name=payload.full_name,
            department=payload.department,
            role=payload.role,
            password=payload.password
        )
        token = create_access_token({"sub": user["email"], "id": user["id"], "role": user["role"]})
        return {
            "status": "success",
            "message": "Account created successfully.",
            "token": token,
            "user": user
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/auth/login")
def login_user(payload: LoginRequest, request: Request):
    """Authenticates against SQLite database and returns signed JWT token."""
    client_ip = request.client.host if request.client else None
    user = authenticate_user(payload.email, payload.password, ip_address=client_ip)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    token = create_access_token({"sub": user["email"], "id": user["id"], "role": user["role"]})
    return {
        "status": "success",
        "message": "Authentication successful.",
        "token": token,
        "user": user
    }


@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """Verifies bearer token and returns current active profile."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")
        
    user = get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    return {
        "status": "success",
        "user": user
    }


@app.get("/api/auth/demo-accounts")
def get_demo_accounts():
    """Provides seed accounts for rapid 1-click evaluation and testing."""
    return [
        {
            "role": "Dean / Administrator",
            "email": "admin@bit.edu",
            "password": "Admin@1234",
            "department": "Academic Administration",
            "name": "Dr. Ramesh Sakthivel"
        },
        {
            "role": "Head of Department (HOD)",
            "email": "hod.cs@bit.edu",
            "password": "Hod@1234",
            "department": "Computer Science & Engineering",
            "name": "Dr. S. K. Sharma"
        },
        {
            "role": "Assistant Professor",
            "email": "faculty@bit.edu",
            "password": "Faculty@1234",
            "department": "Information Technology",
            "name": "Prof. A. Priya"
        },
        {
            "role": "Academic Advisor",
            "email": "advisor.ad@bit.edu",
            "password": "Advisor@1234",
            "department": "Artificial Intelligence & Data Science",
            "name": "Dr. K. Balaji"
        }
    ]


@app.post("/api/auth/logout")
def logout_user():
    """Logs out user session."""
    return {"status": "success", "message": "Successfully logged out."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

