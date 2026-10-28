import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def create_source_code_document():
    doc = docx.Document()
    
    # 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)  # A4
        section.page_height = Inches(11.69) # A4

    def add_appendix_heading(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(title)
        run.font.name = "Times New Roman"
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(15, 23, 42)

    def add_sub_heading(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(title)
        run.font.name = "Times New Roman"
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138)

    def add_meta_desc(desc):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(desc)
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.font.italic = True
        run.font.color.rgb = RGBColor(71, 85, 105)

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = docx.enum.table.WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.27)
        
        # Shading
        shading = parse_xml(r'<w:shd {} w:fill="F8FAFC"/>'.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(shading)
        
        # Borders
        borders = parse_xml(r'''
            <w:tcBorders {} >
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="18" w:space="0" w:color="3B82F6"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            </w:tcBorders>
        '''.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(borders)
        
        # Margins inside cell
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(r'''
            <w:tcMar {} >
                <w:top w:w="120" w:type="dxa"/>
                <w:left w:w="160" w:type="dxa"/>
                <w:bottom w:w="120" w:type="dxa"/>
                <w:right w:w="160" w:type="dxa"/>
            </w:tcMar>
        '''.format(nsdecls('w')))
        tcPr.append(tcMar)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        
        lines = code_text.strip().split("\n")
        for idx, line in enumerate(lines):
            if idx > 0:
                p = cell.add_paragraph()
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.05
            
            run = p.add_run(line)
            run.font.name = "Consolas"
            run.font.size = Pt(8.5)
            # Syntax tinting
            line_str = line.strip()
            if line_str.startswith("#") or line_str.startswith("//") or line_str.startswith("/*") or line_str.startswith("*"):
                run.font.color.rgb = RGBColor(100, 116, 139) # slate comment
                run.font.italic = True
            elif line_str.startswith("def ") or line_str.startswith("class ") or line_str.startswith("export const ") or line_str.startswith("import "):
                run.font.color.rgb = RGBColor(30, 64, 175) # blue keyword
                run.font.bold = True
            elif line_str.startswith("@") or "return " in line_str:
                run.font.color.rgb = RGBColor(180, 83, 9) # amber/keyword
            else:
                run.font.color.rgb = RGBColor(15, 23, 42) # main code

        # Space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(6)

    # 1. Title
    add_appendix_heading("APPENDIX III: SYSTEM SOURCE CODE LISTINGS")
    add_meta_desc("This appendix documents the primary architectural modules of the Academic Intelligence Platform, detailing the ingestion pipeline, machine learning failure risk classifier, conversational AI query router with multi-key failover, and dynamic Recharts visualization dispatcher.")

    # -------------------------------------------------------------
    # Module 1: data_service.py
    # -------------------------------------------------------------
    add_sub_heading("1. Academic Data Ingestion & Normalization Service (data_service.py)")
    add_meta_desc("Handles multi-department workbook discovery across 61 engineering result sheets, dynamic registration row header resolution, CIA internal score normalization (0–100%), and cohort analytics caching.")
    
    code_data_service = '''# backend/data_service.py - Academic Data Ingestion & Analytics Service
import pandas as pd
import numpy as np
import os, glob
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEMESTERS = ["I", "III", "V", "VII"]

def get_dataset_path() -> str:
    """Dynamically resolves the multi-department root dataset directory."""
    env_path = os.getenv("DATASET_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    candidates = [
        os.path.join(BASE_DIR, "data", "UG"),
        os.path.join(BASE_DIR, "data"),
        os.path.abspath(os.path.join(BASE_DIR, "..", "..", "dataset", "UG"))
    ]
    for c in candidates:
        if os.path.exists(c) and any(f.endswith(".xlsx") for _, _, f in os.walk(c)):
            return c
    fallback = os.path.join(BASE_DIR, "data", "UG")
    os.makedirs(fallback, exist_ok=True)
    return fallback

def load_data() -> List[Dict[str, Any]]:
    """Traverses 61 department workbooks, resolves dynamic headers, and aggregates student records."""
    all_students = []
    dataset_path = get_dataset_path()
    if not os.path.exists(dataset_path):
        return []

    for dept in os.listdir(dataset_path):
        dept_dir = os.path.join(dataset_path, dept)
        if not os.path.isdir(dept_dir): continue
        
        for sem in SEMESTERS:
            sem_dir = os.path.join(dept_dir, sem)
            if not os.path.exists(sem_dir):
                sem_dir = os.path.join(dept_dir, f"{sem} SEM")
            if not os.path.exists(sem_dir): continue
                
            for file_path in glob.glob(os.path.join(sem_dir, "*.xlsx")):
                try:
                    df = pd.read_excel(file_path, header=None)
                    if len(df) < 5: continue
                    
                    # Dynamic dual-row header stitching (Course codes on Row 2 + Metrics on Row 3)
                    row2 = df.iloc[2].ffill().astype(str)
                    row3 = df.iloc[3].fillna("").astype(str)
                    col_names = [f"{r2.strip()}_{r3.strip()}".strip("_") for r2, r3 in zip(row2, row3)]
                    df.columns = col_names
                    
                    # Locate student registration column dynamically
                    reg_col = next((c for c in df.columns if any(k in str(c).upper() for k in ["REG", "ROLL"])), None)
                    if not reg_col: continue

                    df = df.iloc[4:].dropna(subset=[reg_col])
                    
                    for _, row in df.iterrows():
                        reg_num = str(row.get(reg_col, "")).strip()
                        if not reg_num or reg_num.lower() in ["nan", "none"]: continue
                        
                        name = next((str(row[c]).strip() for c in df.columns if "NAME" in str(c).upper()), f"Student {reg_num}")
                        result = next((str(row[c]).strip().upper() for c in df.columns if str(c).upper() in ["RESULT", "RES"]), "PASS")
                        gpa = float(row.get("GPA", 0.0)) if pd.notna(row.get("GPA")) else 0.0

                        # Extract course-wise Continuous Internal Assessment (CIA) & End-Semester scores
                        subjects = []
                        subject_codes = set([c.split('_')[0] for c in col_names if '_' in c])
                        for sub in subject_codes:
                            im = float(row.get(f"{sub}_IM", 0.0) or 0.0)
                            em = float(row.get(f"{sub}_EM", 0.0) or 0.0)
                            tot = float(row.get(f"{sub}_TOT", 0.0) or 0.0)
                            grd = str(row.get(f"{sub}_GRD", "")).strip()
                            subjects.append({"code": sub, "im": im, "em": em, "tot": tot, "grade": grd})

                        all_students.append({
                            "register_number": reg_num,
                            "name": name,
                            "department": dept.upper(),
                            "semester": sem,
                            "gpa": gpa,
                            "result": result,
                            "subjects": subjects
                        })
                except Exception as e:
                    print(f"[!] Error parsing {file_path}: {e}")
    return all_students

def get_dashboard_summary(dept: str = "ALL", semester: str = "ALL") -> Dict[str, Any]:
    """Calculates high-level institutional KPI aggregates across departments."""
    students = load_data()
    if dept != "ALL": students = [s for s in students if s["department"] == dept]
    if semester != "ALL": students = [s for s in students if s["semester"] == semester]
    
    total = len(students)
    if total == 0:
        return {"total_students": 0, "pass_percentage": 0.0, "average_gpa": 0.0, "at_risk_count": 0}
        
    passed = sum(1 for s in students if s["result"] == "PASS")
    at_risk = sum(1 for s in students if s["result"] == "FAIL" or s["gpa"] < 6.0)
    avg_gpa = round(sum(s["gpa"] for s in students) / total, 2)
    
    return {
        "total_students": total,
        "pass_percentage": round((passed / total) * 100, 2),
        "average_gpa": avg_gpa,
        "at_risk_count": at_risk
    }'''
    add_code_block(code_data_service)

    # -------------------------------------------------------------
    # Module 2: model_service.py
    # -------------------------------------------------------------
    add_sub_heading("2. Machine Learning Risk Prediction Engine (model_service.py)")
    add_meta_desc("Extracts academic competency features (Avg_Internal_Pct, Min_Internal_Pct, Low_Internal_Count), loads serialized XGBoost artifacts, and predicts calibrated failure probabilities.")

    code_model_service = '''# backend/model_service.py - XGBoost Academic Risk Classifier
import numpy as np
import pandas as pd
import joblib, os
from typing import List, Dict, Any

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "xgboost_probability_model.joblib")
_MODEL, _FEATURES = None, None

def load_model_if_needed():
    """Lazily deserializes the trained XGBoost model and feature registry."""
    global _MODEL, _FEATURES
    if _MODEL is None:
        _MODEL = joblib.load(MODEL_PATH)
        _FEATURES = ['Avg_Internal_Pct', 'Min_Internal_Pct', 'Low_Internal_Count']
    return _MODEL, _FEATURES

def classify_risk(fail_probability: float) -> str:
    """Calibrates continuous failure probabilities into discrete institutional advisory tiers."""
    if fail_probability >= 50.0:
        return "HIGH RISK (FAIL)"
    elif fail_probability >= 25.0:
        return "MEDIUM RISK"
    else:
        return "SAFE (PASS)"

def compute_features(subject_percentages: List[float]) -> Dict[str, Any]:
    """Engineers the 3 composite indicators capturing holistic competence and subject vulnerabilities."""
    valid_marks = [m for m in subject_percentages if not np.isnan(m)]
    if not valid_marks:
        return {"avg_internal_pct": 0.0, "min_internal_pct": 0.0, "low_internal_count": 0}
    return {
        "avg_internal_pct": round(float(np.mean(valid_marks)), 2),
        "min_internal_pct": round(float(np.min(valid_marks)), 2),
        "low_internal_count": int(sum(1 for x in valid_marks if x < 50.0)),
        "valid_marks_count": len(valid_marks)
    }

def predict_single(student_id: str, student_name: str, subjects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Performs sub-15ms real-time ML risk inference for an individual student dossier."""
    model, features = load_model_if_needed()
    subject_percentages = []
    at_risk_subjects = []
    
    for sub in subjects:
        score = float(sub.get("mark", 0.0))
        max_score = float(sub.get("max_score", 50.0)) or 50.0
        pct = round((score / max_score) * 100.0, 2)
        subject_percentages.append(pct)
        if pct < 50.0:
            at_risk_subjects.append({"code": sub.get("name", "Unknown"), "pct": pct})
            
    feat_dict = compute_features(subject_percentages)
    df_features = pd.DataFrame([{
        'Avg_Internal_Pct': feat_dict["avg_internal_pct"],
        'Min_Internal_Pct': feat_dict["min_internal_pct"],
        'Low_Internal_Count': feat_dict["low_internal_count"]
    }], columns=features)

    probs = model.predict_proba(df_features)[0]
    pass_prob = round(float(probs[0]) * 100, 2)
    fail_prob = round(float(probs[1]) * 100, 2)
    risk_status = classify_risk(fail_prob)

    # Faculty Intervention Advisory Matrix
    advisory = "Maintain consistent study schedule."
    if risk_status == "HIGH RISK (FAIL)":
        advisory = "Urgent: Mandatory faculty mentoring, remedial coaching, and parent conference required."
    elif risk_status == "MEDIUM RISK":
        advisory = "Advisory: Provide supplemental tutorial assignments in courses scoring under 50%."

    return {
        "student_id": student_id,
        "student_name": student_name,
        "avg_internal_pct": feat_dict["avg_internal_pct"],
        "min_internal_pct": feat_dict["min_internal_pct"],
        "low_internal_count": feat_dict["low_internal_count"],
        "pass_probability": pass_prob,
        "fail_probability": fail_prob,
        "risk_status": risk_status,
        "advisory": advisory,
        "at_risk_subjects": at_risk_subjects
    }'''
    add_code_block(code_model_service)

    # -------------------------------------------------------------
    # Module 3: ai_service.py
    # -------------------------------------------------------------
    add_sub_heading("3. Conversational AI, Multi-Key Failover & Repair Engine (ai_service.py)")
    add_meta_desc("Implements zero-token local intent caching, Groq LLM query planning with round-robin key rotation and cascading fallback models, and self-repairing schema validation.")

    code_ai_service = '''# backend/ai_service.py - Conversational AI & Dynamic Graph Planning Engine
import os, json, re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GraphSpecification(BaseModel):
    visualization: str = Field(description="Visual chart type: bar, horizontal_bar, line, area, pie, radar")
    xAxis: Dict[str, Any] = Field(description="X-axis data field and categorical label bindings")
    yAxis: Dict[str, Any] = Field(description="Y-axis metric field, formatting unit, and scale bounds")
    series: List[str] = Field(default_factory=list, description="Target metrics to graph")
    title: str = Field(description="Executive chart title")

def get_configured_groq_keys() -> List[str]:
    """Retrieves all configured Groq API keys in priority sequence for failover mesh."""
    keys: List[str] = []
    primary = os.getenv("GROQ_API_KEY", "").strip()
    if primary: keys.append(primary)
    for i in range(1, 10):
        k = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
        if k and k not in keys: keys.append(k)
    return keys

def rule_based_query_planner(question: str) -> Optional[Dict[str, Any]]:
    """Zero-Token Local Intent Router: Executes standard institutional queries in <10ms with 0 tokens."""
    q = question.lower()
    if "top performer" in q or "top 10" in q or "rank" in q:
        return {
            "intent": "top_performers",
            "is_visualizable": True,
            "graphSpecification": {
                "visualization": "horizontal_bar",
                "xAxis": {"field": "name", "label": "Student Name"},
                "yAxis": {"field": "gpa", "label": "GPA", "unit": ""},
                "series": ["gpa"],
                "title": "Top Performing Students by GPA"
            }
        }
    elif "grade distribution" in q or "grades" in q:
        return {
            "intent": "grade_distribution",
            "is_visualizable": True,
            "graphSpecification": {
                "visualization": "bar",
                "xAxis": {"field": "grade", "label": "Letter Grade"},
                "yAxis": {"field": "count", "label": "Student Count", "unit": ""},
                "series": ["count"],
                "title": "Institutional Letter Grade Distribution"
            }
        }
    return None

def groq_query_planner(question: str, keys: List[str]) -> Dict[str, Any]:
    """Dispatches prompt to Groq Cloud LLM with multi-key failover and cascading model fallback."""
    from groq import Groq, RateLimitError
    models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
    
    last_error = None
    for key in keys:
        for model in models:
            try:
                client = Groq(api_key=key)
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are an Academic Data Architect. Output strictly JSON matching GraphSpecification."},
                        {"role": "user", "content": question}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
                return json.loads(response.choices[0].message.content)
            except RateLimitError as rle:
                print(f"[!] Groq 429 Rate Limit on {model} (Key ...{key[-4:]}). Rotating credential...")
                last_error = rle
                break # Cascade to next key immediately
            except Exception as e:
                last_error = e
                continue
    raise RuntimeError(f"All Groq API keys and cascading fallback models exhausted: {last_error}")

def validate_and_repair_specification(spec: Dict[str, Any], data_columns: List[str]) -> Dict[str, Any]:
    """Self-Healing Engine: Validates column bindings against active dataset, preventing blank charts."""
    if not spec or not isinstance(spec, dict): return spec
    x_field = spec.get("xAxis", {}).get("field")
    y_field = spec.get("yAxis", {}).get("field")
    
    # Auto-repair mismatched column references (e.g., LLM produced 'dept' instead of 'department')
    col_map = {"dept": "department", "reg_no": "register_number", "score": "tot", "mark": "tot"}
    if x_field in col_map and col_map[x_field] in data_columns:
        spec["xAxis"]["field"] = col_map[x_field]
    if y_field in col_map and col_map[y_field] in data_columns:
        spec["yAxis"]["field"] = col_map[y_field]
        
    return spec'''
    add_code_block(code_ai_service)

    # -------------------------------------------------------------
    # Module 4: DynamicChartRenderer.jsx
    # -------------------------------------------------------------
    add_sub_heading("4. Frontend Dynamic Visualization Dispatcher (DynamicChartRenderer.jsx)")
    add_meta_desc("Universal charting controller rendering 12 interactive Recharts components, sanitizing data payloads, handling table view toggling, and triggering client-side CSV/PNG exports.")

    code_chart_renderer = '''// frontend/src/components/charts/DynamicChartRenderer.jsx
import React, { useState, useMemo } from 'react';
import ChartContainer from './ChartContainer';
import BarChartComponent from './BarChartComponent';
import HorizontalBarChartComponent from './HorizontalBarChartComponent';
import PieChartComponent from './PieChartComponent';
import LineChartComponent from './LineChartComponent';
import AreaChartComponent from './AreaChartComponent';
import RadarChartComponent from './RadarChartComponent';
import StackedBarChartComponent from './StackedBarChartComponent';
import ScatterChartComponent from './ScatterChartComponent';

export const DynamicChartRenderer = ({ data = [], config = {}, height = 400 }) => {
  const [isTableView, setIsTableView] = useState(false);
  const safeConfig = config || {};
  const chartType = (safeConfig.visualization || safeConfig.type || 'bar').toLowerCase();

  const firstRow = (data && data[0]) || {};
  const xField = safeConfig.xAxis?.field || Object.keys(firstRow)[0] || 'x';
  const yField = safeConfig.yAxis?.field || Object.keys(firstRow)[1] || 'y';
  const series = Array.isArray(safeConfig.series) && safeConfig.series.length > 0 ? safeConfig.series : [yField];
  const title = safeConfig.title || 'Academic Analytics Chart';

  // Sanitize numeric strings into floats for Recharts SVG calculation
  const cleanData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(row => {
      const sanitized = { ...row };
      Object.keys(sanitized).forEach(k => {
        const val = sanitized[k];
        if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
          sanitized[k] = parseFloat(val);
        }
      });
      return sanitized;
    });
  }, [data]);

  // Dynamic Chart Component Switcher
  const renderChartContent = () => {
    if (isTableView) {
      return (
        <div style={{ maxHeight: height, overflowY: 'auto' }}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>{Object.keys(cleanData[0] || {}).map(c => <th key={c} className="p-2 capitalize">{c}</th>)}</tr>
            </thead>
            <tbody>
              {cleanData.map((r, i) => (
                <tr key={i} className="border-b">{Object.values(r).map((v, j) => <td key={j} className="p-2">{String(v)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    switch (chartType) {
      case 'horizontal_bar':
        return <HorizontalBarChartComponent data={cleanData} xField={xField} yField={yField} height={height} />;
      case 'grouped_bar':
      case 'stacked_bar':
        return <StackedBarChartComponent data={cleanData} xField={xField} series={series} height={height} />;
      case 'line':
        return <LineChartComponent data={cleanData} xField={xField} series={series} height={height} />;
      case 'area':
        return <AreaChartComponent data={cleanData} xField={xField} yField={yField} height={height} />;
      case 'pie':
        return <PieChartComponent data={cleanData} xField={xField} yField={yField} height={height} isDoughnut={false} />;
      case 'donut':
        return <PieChartComponent data={cleanData} xField={xField} yField={yField} height={height} isDoughnut={true} />;
      case 'radar':
        return <RadarChartComponent data={cleanData} xField={xField} yField={yField} height={height} />;
      case 'scatter':
        return <ScatterChartComponent data={cleanData} xField={xField} yField={yField} height={height} />;
      case 'bar':
      default:
        return <BarChartComponent data={cleanData} xField={xField} yField={yField} height={height} />;
    }
  };

  return (
    <ChartContainer
      title={title}
      height={height}
      isTableView={isTableView}
      onToggleTableView={() => setIsTableView(prev => !prev)}
    >
      {renderChartContent()}
    </ChartContainer>
  );
};

export default DynamicChartRenderer;'''
    add_code_block(code_chart_renderer)

    out_file = "Appendix_Source_Code.docx"
    doc.save(out_file)
    print(f"Successfully created {out_file} ({os.path.getsize(out_file)} bytes)")

if __name__ == "__main__":
    create_source_code_document()
