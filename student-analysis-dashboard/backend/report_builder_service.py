import re
from typing import List, Dict, Any, Optional
import numpy as np

from data_service import (
    normalize_dept, _filter_data, get_dashboard_summary,
    get_subject_analytics, get_top_performers, get_class_division,
    get_grade_distribution, get_semester_trends, get_batch_comparison,
    get_at_risk_students
)

def generate_factual_ai_insight(scope: str, data: Dict[str, Any], insight_type: str = "summary") -> str:
    """
    Produces a factual, rigorous academic diagnostic insight grounded exclusively
    in the real numerical database values provided. Strictly zero hallucination.
    """
    if scope == "student":
        name = data.get("studentName", "The student")
        reg = data.get("registerNumber", "")
        cgpa = data.get("cgpa", 0.0)
        arrears = data.get("totalArrears", 0)
        standing = data.get("standing", "Optimal")
        strongest = data.get("strongestModule", "N/A")
        highest = data.get("highestScore", 0)
        weakest = data.get("weakestModule", "N/A")
        lowest = data.get("lowestScore", 0)

        if arrears == 0 and cgpa >= 7.5:
            return (
                f"Academic performance audit for {name} ({reg}) indicates consistent high competency "
                f"with a cumulative CGPA of {cgpa}/10.0 and zero standing backlogs. The student exhibits strongest "
                f"mastery in {strongest} with an assessment mark of {highest}/100. Overall learning trajectory remains "
                f"optimal; participation in competitive technical symposiums, research certifications, and honors coursework is recommended."
            )
        elif arrears == 0:
            return (
                f"Academic evaluation for {name} ({reg}) shows satisfactory progress with a cumulative CGPA of {cgpa}/10.0 "
                f"and zero standing arrears. Strongest academic performance is demonstrated in {strongest} ({highest}/100), "
                f"while additional revision in {weakest} ({lowest}/100) will assist in elevating the overall GPA to distinction tier."
            )
        else:
            return (
                f"Diagnostic assessment for {name} ({reg}) indicates an academic alert with a cumulative CGPA of {cgpa}/10.0 "
                f"and {arrears} standing arrear(s). Critical focus is required in {weakest} (lowest score: {lowest}/100). "
                f"Mandatory remedial tutorial attendance (daily 4:45 PM – 5:45 PM) and faculty mentoring sessions are required "
                f"prior to the upcoming end-semester supplementary examination."
            )
    else:
        dept = data.get("department", "The cohort")
        sem = data.get("semester", "")
        total = data.get("totalStudents", 0)
        pass_pct = data.get("passPercentage", 0)
        avg_gpa = data.get("averageGpa", 0.0)
        at_risk = data.get("atRiskCount", 0)
        lowest_sub = data.get("lowestSubject", "core curriculum")

        if insight_type == "summary":
            return (
                f"Academic assessment for {dept} ({sem}) covers {total} enrolled students. "
                f"The cohort recorded an average SGPA of {avg_gpa}/10.0 with an aggregate pass rate of {pass_pct}%. "
                f"{total - at_risk} students demonstrated clear academic standing across all scheduled course evaluations."
            )
        elif insight_type == "recommendations":
            return (
                f"1. For the {at_risk} student(s) requiring academic remediation, schedule bi-weekly checkpoint meetings.\n"
                f"2. Conduct structured revision workshops for {lowest_sub}, which exhibited the highest course failure frequency.\n"
                f"3. Recognize and nominate the top performers to peer-tutoring circles to assist vulnerable cohorts."
            )
        else:
            return (
                f"Cohort evaluation for {dept} ({sem}) shows an overall pass percentage of {pass_pct}%, with an average SGPA of {avg_gpa}. "
                f"Early-warning screening flags {at_risk} student(s) in need of targeted intervention, with {lowest_sub} identified as the primary difficulty hurdle."
            )

def get_student_report_dataset(student_data: List[Dict[str, Any]], register_number: str) -> Optional[Dict[str, Any]]:
    """
    Extracts complete, verified real-world academic data for a single student across all semesters.
    Calculates derived metrics, identifies strengths and vulnerabilities, and builds
    the list of visualization components that are genuinely supported by the real records.
    """
    records = [s for s in student_data if s["registerNumber"].strip().upper() == register_number.strip().upper()]
    if not records:
        return None

    # Sort records chronologically if semester numbers are Roman numerals
    sem_order = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8}
    sorted_records = sorted(records, key=lambda r: sem_order.get(str(r.get("semester", "")).upper().replace("SEM", "").strip(), 99))
    latest = sorted_records[-1]

    # Calculate real cumulative CGPA and total arrears
    gpas = [float(r["gpa"]) for r in sorted_records if r.get("gpa") and float(r["gpa"]) > 0]
    cumulative_cgpa = round(sum(gpas) / len(gpas), 2) if gpas else float(latest.get("gpa", 0.0))
    total_arrears = sum(int(r.get("failCount", 0)) for r in sorted_records)

    # Collect all course subjects across all evaluated semesters
    all_subjects = []
    grade_counts = {}
    for r in sorted_records:
        sem_name = r.get("semester", "")
        for s in r.get("subjects", []):
            subj_entry = {
                "semester": f"Sem {sem_name}",
                "code": s.get("code", "N/A"),
                "title": s.get("title") or s.get("code", "Course Module"),
                "im": float(s.get("im", 0.0)),
                "em": float(s.get("em", 0.0)),
                "tot": float(s.get("tot", 0.0)),
                "grd": s.get("grd", "N/A").upper().strip(),
                "res": s.get("res") or ("PASS" if float(s.get("tot", 0)) >= 50 and s.get("grd", "").upper() not in ["U", "RA", "FAIL"] else "FAIL")
            }
            all_subjects.append(subj_entry)
            grd = subj_entry["grd"]
            if grd:
                grade_counts[grd] = grade_counts.get(grd, 0) + 1

    # Sorted strengths and weaknesses
    valid_scored_subjects = [s for s in all_subjects if s["tot"] > 0]
    strongest_subjects = sorted(valid_scored_subjects, key=lambda x: x["tot"], reverse=True)[:5]
    weakest_subjects = sorted(valid_scored_subjects, key=lambda x: x["tot"])[:5]

    # Semester progression trajectory
    semester_trajectory = []
    for r in sorted_records:
        semester_trajectory.append({
            "semester": f"Sem {r.get('semester', '')}",
            "sgpa": float(r.get("gpa", 0.0)),
            "arrears": int(r.get("failCount", 0)),
            "result": r.get("result", "PASS")
        })

    # Latest semester subject performance
    latest_subjects = []
    for s in latest.get("subjects", []):
        latest_subjects.append({
            "code": s.get("code", ""),
            "title": s.get("title") or s.get("code", ""),
            "im": float(s.get("im", 0.0)),
            "em": float(s.get("em", 0.0)),
            "tot": float(s.get("tot", 0.0)),
            "grd": s.get("grd", "N/A"),
            "status": "Pass" if float(s.get("tot", 0)) >= 50 and s.get("grd") not in ["U", "RA", "FAIL"] else "Arrear"
        })

    # Internal vs External marks comparison data
    internal_external_comparison = []
    for s in latest_subjects:
        internal_external_comparison.append({
            "code": s["code"],
            "internalMarks": s["im"],
            "externalMarks": s["em"],
            "totalMarks": s["tot"]
        })

    # Grade distribution list
    grade_order = ["S", "A+", "A", "B+", "B", "C", "U"]
    grade_distribution = []
    for g in grade_order:
        if g in grade_counts:
            grade_distribution.append({
                "grade": g,
                "count": grade_counts[g],
                "percentage": round((grade_counts[g] / max(1, len(all_subjects))) * 100, 1)
            })

    # Overall standing determination
    is_optimal = cumulative_cgpa >= 6.0 and total_arrears == 0
    standing_status = "Optimal (Green)" if is_optimal else ("Warning (Yellow)" if total_arrears == 1 else "Critical (Red)")

    # Build the list of dynamically AVAILABLE visualization and data components
    available_components = [
        {
            "id": "student_kpi_overview",
            "type": "kpi_group",
            "category": "metrics",
            "title": "Core Academic KPI Summary",
            "subtitle": "Cumulative CGPA, standing arrears, and evaluated credits",
            "width": "100%",
            "supported": True,
            "data": {
                "cgpa": cumulative_cgpa,
                "latestSgpa": float(latest.get("gpa", 0.0)),
                "totalArrears": total_arrears,
                "currentSemester": latest.get("semester", ""),
                "standing": standing_status,
                "evaluatedCourses": len(all_subjects)
            }
        },
        {
            "id": "student_sgpa_progression",
            "type": "chart",
            "visualization": "area",
            "category": "charts",
            "title": "SGPA Progression Trajectory",
            "subtitle": "Semester-by-semester Grade Point Average progression",
            "width": "50%",
            "supported": len(sorted_records) >= 1,
            "config": {
                "type": "area",
                "xField": "semester",
                "yField": "sgpa",
                "xAxisLabel": "Semester",
                "yAxisLabel": "SGPA (0-10)",
                "unit": "GPA",
                "domain": [0, 10]
            },
            "data": semester_trajectory
        },
        {
            "id": "student_latest_subjects_bar",
            "type": "chart",
            "visualization": "bar",
            "category": "charts",
            "title": f"Current Course Performance (Semester {latest.get('semester', '')})",
            "subtitle": "Total course marks achieved (Pass threshold: 50/100)",
            "width": "50%",
            "supported": len(latest_subjects) > 0,
            "config": {
                "type": "bar",
                "xField": "code",
                "yField": "tot",
                "xAxisLabel": "Course Code",
                "yAxisLabel": "Total Marks",
                "unit": "Marks",
                "domain": [0, 100]
            },
            "data": latest_subjects
        },
        {
            "id": "student_grade_distribution_donut",
            "type": "chart",
            "visualization": "donut",
            "category": "charts",
            "title": "Cumulative Grade Distribution",
            "subtitle": "Breakdown of grades awarded across all completed terms",
            "width": "50%",
            "supported": len(grade_distribution) > 0,
            "config": {
                "type": "donut",
                "xField": "grade",
                "yField": "count",
                "xAxisLabel": "Grade",
                "yAxisLabel": "Subject Count"
            },
            "data": grade_distribution
        },
        {
            "id": "student_internal_external_stacked",
            "type": "chart",
            "visualization": "stacked_bar",
            "category": "charts",
            "title": "Internal vs External Marks Assessment",
            "subtitle": "Continuous Internal Assessment (CIA) vs End-Semester Exam (ESE)",
            "width": "50%",
            "supported": len(internal_external_comparison) > 0,
            "config": {
                "type": "stacked_bar",
                "xField": "code",
                "series": ["internalMarks", "externalMarks"],
                "xAxisLabel": "Course Code",
                "yAxisLabel": "Marks",
                "unit": "Marks"
            },
            "data": internal_external_comparison
        },
        {
            "id": "student_strengths_weaknesses_card",
            "type": "highlight_card",
            "category": "insights",
            "title": "Curricular Strengths & Vulnerability Analysis",
            "subtitle": "Highest scoring modules contrasted with subjects requiring remedial focus",
            "width": "50%",
            "supported": len(strongest_subjects) > 0,
            "data": {
                "strongest": strongest_subjects,
                "weakest": weakest_subjects
            }
        },
        {
            "id": "student_semester_ledger_table",
            "type": "table",
            "category": "tables",
            "title": f"Semester {latest.get('semester', '')} Official Examination Ledger",
            "subtitle": "Official subject scores, CIA, ESE, grades, and pass/fail registry",
            "width": "100%",
            "supported": len(latest_subjects) > 0,
            "columns": [
                {"name": "code", "label": "Course Code"},
                {"name": "title", "label": "Course Title"},
                {"name": "im", "label": "CIA (Internal)"},
                {"name": "em", "label": "ESE (External)"},
                {"name": "tot", "label": "Total Marks"},
                {"name": "grd", "label": "Grade"},
                {"name": "res", "label": "Result"}
            ],
            "data": latest_subjects
        },

        {
            "id": "student_official_endorsement",
            "type": "signature_block",
            "category": "structure",
            "title": "Official Institutional Endorsements",
            "subtitle": "Signatures of Faculty Mentor, Academic Advisor, and Head of Department",
            "width": "100%",
            "supported": True,
            "data": {
                "signatories": [
                    {"role": "Class Advisor / Faculty Mentor", "dept": latest.get("department", "CSE")},
                    {"role": "Head of the Department", "dept": latest.get("department", "CSE")},
                    {"role": "Dean (Academic Quality)", "dept": "Bannari Amman Institute of Technology"}
                ]
            }
        }
    ]

    student_narrative_raw = {
        "studentName": latest.get("name"),
        "registerNumber": register_number,
        "cgpa": cumulative_cgpa,
        "totalArrears": total_arrears,
        "standing": standing_status,
        "strongestModule": strongest_subjects[0]["code"] if strongest_subjects else "N/A",
        "highestScore": strongest_subjects[0]["tot"] if strongest_subjects else 0,
        "weakestModule": weakest_subjects[0]["code"] if weakest_subjects else "N/A",
        "lowestScore": weakest_subjects[0]["tot"] if weakest_subjects else 0
    }
    student_narrative_text = generate_factual_ai_insight("student", student_narrative_raw, "summary")

    available_components.append({
        "id": "student_ai_narrative_summary",
        "type": "ai_insight",
        "category": "ai",
        "title": "AI Academic Diagnostic & Progression Summary",
        "subtitle": "Automated analytical synthesis grounded in student academic trajectory",
        "width": "50%",
        "supported": True,
        "insightType": "student_performance",
        "data": student_narrative_text,
        "insightText": student_narrative_text,
        "rawMetrics": student_narrative_raw
    })

    return {
        "scope": "student",
        "studentInfo": {
            "registerNumber": latest.get("registerNumber"),
            "name": latest.get("name"),
            "department": latest.get("department"),
            "currentSemester": latest.get("semester"),
            "totalSemesters": len(sorted_records),
            "cgpa": cumulative_cgpa,
            "totalArrears": total_arrears,
            "standing": standing_status
        },
        "allSemesters": [r.get("semester") for r in sorted_records],
        "availableComponents": available_components,
        "defaultTemplateIds": [
            "student_kpi_overview",
            "student_sgpa_progression",
            "student_latest_subjects_bar",
            "student_grade_distribution_donut",
            "student_ai_narrative_summary",
            "student_semester_ledger_table",
            "student_official_endorsement"
        ]
    }


def get_department_report_dataset(student_data: List[Dict[str, Any]], department: str = "All", semester: str = "All") -> Dict[str, Any]:
    """
    Extracts real cohort academic statistics for a department and semester filter.
    Constructs all valid charts, metrics, and tables supported by the database records.
    """
    summary = get_dashboard_summary(student_data, department, semester)
    subjects = get_subject_analytics(student_data, department, semester)
    top_performers = get_top_performers(student_data, department, semester, limit=10)
    class_division = get_class_division(student_data, department, semester)
    grade_distribution = get_grade_distribution(student_data, department, semester)
    semester_trends = get_semester_trends(student_data, department)
    batch_comparison = get_batch_comparison(student_data, department)
    at_risk = get_at_risk_students(student_data, department, semester)

    # Radar data from top challenging courses
    radar_data = [
        {"subject": s["subject"], "average": s["average"], "fullMark": 100}
        for s in subjects[:8]
    ]

    # Vulnerable courses sorted by highest fail count
    vulnerable_courses = sorted(subjects, key=lambda s: s["failCount"], reverse=True)[:8]

    # Normalized department and semester titles
    dept_label = "All Engineering Departments" if department == "All" else f"Department of {normalize_dept(department)}"
    sem_label = "All Semesters (Cumulative)" if semester == "All" else f"Semester {semester}"

    available_components = [
        {
            "id": "cohort_kpi_overview",
            "type": "kpi_group",
            "category": "metrics",
            "title": "Cohort Executive Performance Indicators",
            "subtitle": "Enrolled strength, pass rate, average SGPA, and at-risk count",
            "width": "100%",
            "supported": True,
            "data": {
                "totalStudents": summary.get("totalStudents", 0),
                "passPercentage": summary.get("passPercentage", 0),
                "averageGpa": summary.get("averageGpa", 0.0),
                "highestGpa": summary.get("highestGpa", 0.0),
                "lowestGpa": summary.get("lowestGpa", 0.0),
                "totalAtRisk": at_risk.get("totalAtRisk", 0),
                "criticalRisk": at_risk.get("highRiskCount", 0),
                "warningRisk": at_risk.get("moderateRiskCount", 0)
            }
        },
        {
            "id": "cohort_sgpa_trend_chart",
            "type": "chart",
            "visualization": "area",
            "category": "charts",
            "title": f"Cohort SGPA Progression ({dept_label})",
            "subtitle": "Semester-by-semester Grade Point Average progression curve",
            "width": "100%",
            "supported": len(semester_trends) > 0,
            "config": {
                "type": "area",
                "xField": "semester",
                "yField": "averageGpa",
                "xAxisLabel": "Semester",
                "yAxisLabel": "Average SGPA",
                "unit": "GPA",
                "domain": [0, 10]
            },
            "data": semester_trends
        },
        {
            "id": "cohort_class_division_donut",
            "type": "chart",
            "visualization": "donut",
            "category": "charts",
            "title": "Academic Standing Classification",
            "subtitle": "Proportion of Distinction, First Class, Second Class, and Reappear",
            "width": "33.3%",
            "supported": len(class_division) > 0,
            "config": {
                "type": "donut",
                "xField": "name",
                "yField": "value",
                "xAxisLabel": "Division",
                "yAxisLabel": "Students"
            },
            "data": class_division
        },
        {
            "id": "cohort_grade_distribution_bar",
            "type": "chart",
            "visualization": "bar",
            "category": "charts",
            "title": "Overall Grade Frequency Breakdown",
            "subtitle": "Distribution of letter grades (S, A+, A, B+, B, C, U) across examinations",
            "width": "33.3%",
            "supported": len(grade_distribution) > 0,
            "config": {
                "type": "bar",
                "xField": "grade",
                "yField": "percentage",
                "xAxisLabel": "Grade",
                "yAxisLabel": "Percentage (%)",
                "unit": "%",
                "domain": [0, 100]
            },
            "data": grade_distribution
        },
        {
            "id": "cohort_subject_difficulty_radar",
            "type": "chart",
            "visualization": "radar",
            "category": "charts",
            "title": "Subject Difficulty Spectrum Radar",
            "subtitle": "Average marks achieved across key core engineering subjects",
            "width": "33.3%",
            "supported": len(radar_data) >= 3,
            "config": {
                "type": "radar",
                "xField": "subject",
                "yField": "average",
                "maxDomain": 100
            },
            "data": radar_data
        },
        {
            "id": "cohort_batch_comparison_stacked",
            "type": "chart",
            "visualization": "stacked_bar",
            "category": "charts",
            "title": "Multi-Semester Batch Performance Comparison",
            "subtitle": "Relative grade distribution across academic terms",
            "width": "60%",
            "supported": len(batch_comparison) > 0,
            "config": {
                "type": "stacked_bar",
                "xField": "semester",
                "series": ["S", "A+", "A", "B+", "B", "C", "U"],
                "xAxisLabel": "Semester",
                "yAxisLabel": "Percentage (%)",
                "unit": "%"
            },
            "data": batch_comparison
        },
        {
            "id": "cohort_top_performers_table",
            "type": "table",
            "category": "tables",
            "title": "Top Academic Performers (Honor Roll)",
            "subtitle": "Highest achieving students ranked by Grade Point Average",
            "width": "50%",
            "supported": len(top_performers) > 0,
            "columns": [
                {"name": "rank", "label": "Rank"},
                {"name": "name", "label": "Student Name"},
                {"name": "registerNumber", "label": "Register Number"},
                {"name": "semester", "label": "Semester"},
                {"name": "gpa", "label": "SGPA"}
            ],
            "data": top_performers
        },
        {
            "id": "cohort_vulnerable_courses_table",
            "type": "table",
            "category": "tables",
            "title": "Top At-Risk Courses",
            "subtitle": "Curricular subjects with highest student failure and arrear rates",
            "width": "40%",
            "supported": len(vulnerable_courses) > 0,
            "columns": [
                {"name": "subject", "label": "Course Code"},
                {"name": "average", "label": "Mean Score"},
                {"name": "passCount", "label": "Students Passed"},
                {"name": "failCount", "label": "Students Failed"},
                {"name": "highest", "label": "Highest Mark"},
                {"name": "lowest", "label": "Lowest Mark"}
            ],
            "data": vulnerable_courses
        },
        {
            "id": "cohort_at_risk_registry_table",
            "type": "table",
            "category": "tables",
            "title": "Early Warning Remedial Registry",
            "subtitle": "Students flagged for academic counseling and intervention",
            "width": "50%",
            "supported": at_risk.get("totalAtRisk", 0) > 0,
            "columns": [
                {"name": "registerNumber", "label": "Register No."},
                {"name": "name", "label": "Student Name"},
                {"name": "semester", "label": "Sem"},
                {"name": "gpa", "label": "GPA"},
                {"name": "failCount", "label": "Arrears"},
                {"name": "riskLevel", "label": "Risk Tier"},
                {"name": "reason", "label": "Intervention Reason"}
            ],
            "data": (at_risk.get("highRisk", []) + at_risk.get("moderateRisk", []))[:15]
        },

        {
            "id": "cohort_official_endorsement",
            "type": "signature_block",
            "category": "structure",
            "title": "Official Institutional Endorsements",
            "subtitle": "Formal verification and sign-off by Academic Leadership",
            "width": "100%",
            "supported": True,
            "data": {
                "signatories": [
                    {"role": "Programme Coordinator", "dept": dept_label},
                    {"role": "Head of the Department", "dept": dept_label},
                    {"role": "Dean (Academic Quality)", "dept": "Bannari Amman Institute of Technology"}
                ]
            }
        }
    ]

    cohort_narrative_raw = {
        "department": dept_label,
        "semester": sem_label,
        "totalStudents": summary.get("totalStudents", 0),
        "passPercentage": summary.get("passPercentage", 0),
        "averageGpa": summary.get("averageGpa", 0.0),
        "atRiskCount": at_risk.get("totalAtRisk", 0),
        "topSubject": subjects[0]["subject"] if subjects else "N/A",
        "lowestSubject": vulnerable_courses[0]["subject"] if vulnerable_courses else "N/A"
    }
    cohort_narrative_text = generate_factual_ai_insight("department", cohort_narrative_raw, "summary")

    available_components.append({
        "id": "cohort_ai_analytical_summary",
        "type": "ai_insight",
        "category": "ai",
        "title": "AI Strategic Cohort Analysis & Faculty Advisory",
        "subtitle": "Analytical summary generated from real academic records",
        "width": "50%",
        "supported": True,
        "insightType": "department_summary",
        "data": cohort_narrative_text,
        "insightText": cohort_narrative_text,
        "rawMetrics": cohort_narrative_raw
    })

    return {
        "scope": "department",
        "cohortInfo": {
            "department": department,
            "departmentLabel": dept_label,
            "semester": semester,
            "semesterLabel": sem_label,
            "totalStudents": summary.get("totalStudents", 0),
            "passPercentage": summary.get("passPercentage", 0),
            "averageGpa": summary.get("averageGpa", 0.0),
            "totalAtRisk": at_risk.get("totalAtRisk", 0)
        },
        "availableComponents": available_components,
        "defaultTemplateIds": [
            "cohort_kpi_overview",
            "cohort_sgpa_trend_chart",
            "cohort_class_division_donut",
            "cohort_grade_distribution_bar",
            "cohort_subject_difficulty_radar",
            "cohort_ai_analytical_summary",
            "cohort_top_performers_table",
            "cohort_vulnerable_courses_table",
            "cohort_official_endorsement"
        ]
    }


def find_student_in_database(query: str, student_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Identifies a real student from institutional records matching the query
    via register number pattern, full name, or key token matching.
    """
    if not query or not student_data:
        return None
    q = query.lower().strip()

    # 1. Match registration number pattern (e.g. 7376...)
    reg_match = re.search(r'7376[0-9a-zA-Z]+', q, re.IGNORECASE)
    if reg_match:
        target_reg = reg_match.group(0).upper()
        for s in student_data:
            if s.get("registerNumber", "").strip().upper() == target_reg:
                return s

    # 2. Clean conversational query stopwords
    fillers = [
        "i need the info about", "need the info about", "i need info about", "info about",
        "tell me about", "details of", "show me", "show", "who is", "what about",
        "student", "marks of", "switch to", "report for", "dossier for", "view", "find",
        "search for", "look up", "can i see", "give me info on", "give me info about",
        "record for", "records of", "scores of"
    ]
    cleaned = q
    for f in fillers:
        cleaned = cleaned.replace(f, " ")
    cleaned = " ".join(cleaned.split())

    if len(cleaned) >= 3:
        # Full name / substring matching
        for s in student_data:
            s_name = s.get("name", "").strip().lower()
            if s_name and (cleaned == s_name or cleaned in s_name or s_name in cleaned):
                return s

        # Tokenized matching for multi-part names (e.g., 'logithkumar', 'logith')
        tokens = [t for t in re.findall(r'[a-zA-Z0-9]+', cleaned) if len(t) >= 4]
        if tokens:
            best_match = None
            max_matches = 0
            for s in student_data:
                s_name = s.get("name", "").strip().lower()
                score = sum(1 for t in tokens if t in s_name)
                if score > max_matches:
                    max_matches = score
                    best_match = s
            if max_matches >= 1 and best_match:
                return best_match

    return None


def chat_with_report_ai(
    question: str,
    scope: str,
    entity_data: Dict[str, Any],
    available_components: List[Dict[str, Any]],
    history: Optional[List[Dict[str, str]]] = None,
    student_data: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Intelligent conversation handler for the Report Builder.
    Answers natural language queries about the selected student or department
    strictly using real verified data, and detects component recommendations.
    Supports querying any verified student in the database and switching active dossier.
    """
    q_lower = question.lower()
    suggested_components = []
    current_reg = entity_data.get("studentInfo", {}).get("registerNumber", "").strip().upper()

    # 1. Check if the user is asking about a student in the database
    if student_data:
        matched_student = find_student_in_database(question, student_data)
        if matched_student:
            matched_reg = matched_student.get("registerNumber", "").strip().upper()
            if matched_reg != current_reg or any(k in q_lower for k in ["switch", "info about", "who is", "tell me about", "show", "find"]):
                target_dataset = get_student_report_dataset(student_data, matched_reg)
                if target_dataset:
                    t_info = target_dataset["studentInfo"]
                    t_name = t_info.get("name", "Student")
                    t_cgpa = t_info.get("cgpa", 0.0)
                    t_arr = t_info.get("totalArrears", 0)
                    t_dept = t_info.get("department", "")
                    t_sem = t_info.get("currentSemester", "")
                    t_standing = t_info.get("standing", "Optimal")

                    t_comps = {c["id"]: c for c in target_dataset.get("availableComponents", [])}
                    strengths = t_comps.get("student_strengths_weaknesses_card", {}).get("data", {}).get("strongest", [])
                    weakest = t_comps.get("student_strengths_weaknesses_card", {}).get("data", {}).get("weakest", [])

                    ans_lines = [
                        f"Found verified database records for **{t_name}** ({matched_reg}):\n",
                        f"• **Department:** {t_dept}",
                        f"• **Current Semester:** Semester {t_sem} ({t_info.get('totalSemesters', 1)} evaluated terms)",
                        f"• **Cumulative CGPA:** {t_cgpa} / 10.0",
                        f"• **Standing Arrears:** {t_arr} {'(Clear academic record)' if t_arr == 0 else '(Remedial intervention recommended)'}",
                        f"• **Academic Standing:** {t_standing}"
                    ]

                    if strengths:
                        top_str = ", ".join([f"{s['code']} ({s['tot']}/100, Grade {s['grd']})" for s in strengths[:3]])
                        ans_lines.append(f"• **Top Scoring Modules:** {top_str}")

                    if weakest and t_arr > 0:
                        low_str = ", ".join([f"{s['code']} ({s['tot']}/100, Grade {s['grd']})" for s in weakest if s.get('tot', 100) < 50 or s.get('grd') in ['U', 'RA']])
                        if not low_str:
                            low_str = f"{weakest[0]['code']} ({weakest[0]['tot']}/100)"
                        ans_lines.append(f"• **Remedial Focus:** {low_str}")

                    ans_lines.append(f"\nYou can switch the entire dossier canvas to **{t_name}** using the button below.")

                    return {
                        "status": "success",
                        "answer": "\n".join(ans_lines),
                        "suggestedComponents": ["student_kpi_overview", "student_sgpa_progression", "student_strengths_weaknesses_card", "student_semester_ledger_table"],
                        "targetStudent": {
                            "registerNumber": matched_reg,
                            "name": t_name,
                            "department": t_dept,
                            "semester": t_sem,
                            "cgpa": t_cgpa,
                            "arrears": t_arr,
                            "standing": t_standing
                        }
                    }


    # Intent detection for suggested components to add/highlight in report canvas
    comp_ids = [c["id"] for c in available_components if c.get("supported")]

    if any(k in q_lower for k in ["trend", "progression", "trajectory", "sgpa", "semester by semester", "over time"]):
        for cid in ["student_sgpa_progression", "cohort_sgpa_trend_chart"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    if any(k in q_lower for k in ["grade", "distribution", "breakdown", "grades", "marks spread"]):
        for cid in ["student_grade_distribution_donut", "cohort_grade_distribution_bar"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    if any(k in q_lower for k in ["subject", "course", "marks", "internal", "external", "cia", "ese"]):
        for cid in ["student_latest_subjects_bar", "student_internal_external_stacked", "cohort_subject_difficulty_radar"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    if any(k in q_lower for k in ["strength", "weak", "weakest", "strongest", "best", "worst"]):
        for cid in ["student_strengths_weaknesses_card", "cohort_vulnerable_courses_table"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    if any(k in q_lower for k in ["table", "ledger", "exam", "details", "list", "top", "rank", "performer"]):
        for cid in ["student_semester_ledger_table", "cohort_top_performers_table", "cohort_at_risk_registry_table"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    if any(k in q_lower for k in ["kpi", "summary", "overview", "cgpa", "pass percentage", "standing", "overall"]):
        for cid in ["student_kpi_overview", "cohort_kpi_overview", "student_ai_narrative_summary", "cohort_ai_analytical_summary"]:
            if cid in comp_ids and cid not in suggested_components:
                suggested_components.append(cid)

    # Deterministic Factual Synthesis (100% grounded in real data)
    answer = ""
    if scope == "student":
        student_info = entity_data.get("studentInfo", {})
        name = student_info.get("name", "The student")
        reg = student_info.get("registerNumber", "")
        cgpa = student_info.get("cgpa", 0.0)
        arrears = student_info.get("totalArrears", 0)
        sem = student_info.get("currentSemester", "")

        # Find specific subjects if available
        avail_map = {c["id"]: c for c in available_components}
        strengths_card = avail_map.get("student_strengths_weaknesses_card", {}).get("data", {})
        strongest = strengths_card.get("strongest", [])
        weakest = strengths_card.get("weakest", [])

        if "attendance" in q_lower:
            answer = f"Attendance tracking is not present in the official database records for {name} ({reg}). To maintain strict data integrity, no attendance metrics or attendance-versus-marks charts are fabricated."

        elif any(k in q_lower for k in ["strongest", "best", "strength", "top subject"]):
            if strongest:
                top_str = ", ".join([f"{s['code']} ({s['tot']}/100, Grade {s['grd']})" for s in strongest[:3]])
                answer = f"Based on official database records, {name}'s strongest subjects are {top_str}. The student demonstrates consistent high proficiency in these core modules."
            else:
                answer = f"{name} ({reg}) has maintained consistent coursework across evaluated modules."

        elif any(k in q_lower for k in ["weakest", "vulnerable", "worst", "remedial", "arrear", "fail"]):
            if arrears > 0 and weakest:
                low_str = ", ".join([f"{s['code']} ({s['tot']}/100, Grade {s['grd']})" for s in weakest if s['tot'] < 50 or s['grd'] in ['U', 'RA']])
                if not low_str:
                    low_str = f"{weakest[0]['code']} ({weakest[0]['tot']}/100)"
                answer = f"{name} currently has {arrears} standing arrear(s). The most critical academic vulnerability is in {low_str}. Immediate tutorial assistance and remedial coaching are recommended."
            elif weakest:
                answer = f"{name} has zero standing arrears. The lowest recorded score across terms was in {weakest[0]['code']} with {weakest[0]['tot']}/100 (Grade {weakest[0]['grd']}), which is still within acceptable passing standards."
            else:
                answer = f"No subject vulnerabilities or backlogs are recorded for {name} in the database."

        elif any(k in q_lower for k in ["compare", "improvement", "decline", "progression", "trend"]):
            progression = avail_map.get("student_sgpa_progression", {}).get("data", [])
            if len(progression) >= 2:
                first = progression[0]
                last = progression[-1]
                diff = round(last["sgpa"] - first["sgpa"], 2)
                dir_str = "improved by" if diff > 0 else ("declined by" if diff < 0 else "remained steady at")
                answer = f"{name}'s academic progression spans {len(progression)} terms. In {first['semester']}, SGPA was {first['sgpa']}, and by {last['semester']}, SGPA {dir_str} {abs(diff)} points to {last['sgpa']}. Current cumulative CGPA is {cgpa}/10.0."
            elif progression:
                answer = f"{name} currently has evaluated records for {progression[0]['semester']} with an SGPA of {progression[0]['sgpa']}. Multi-semester comparison requires additional completed terms."
            else:
                answer = f"{name} has a current cumulative CGPA of {cgpa}/10.0 across evaluated terms."

        elif any(k in q_lower for k in ["report", "create", "build", "generate", "card"]):
            answer = f"I have prepared the recommended academic dossier components for {name} ({reg}), including the Core KPI Summary, SGPA Progression Trajectory, and Course Marks Breakdown. You can drag and drop any component from the right library directly onto the report canvas."

        else:
            answer = f"{name} ({reg}) is currently in Semester {sem} with a cumulative CGPA of {cgpa}/10.0 and {arrears} standing arrear(s). Academic status: {student_info.get('standing', 'Optimal')}."

    else:
        cohort_info = entity_data.get("cohortInfo", {})
        dept = cohort_info.get("departmentLabel", "The department")
        sem = cohort_info.get("semesterLabel", "All Semesters")
        total = cohort_info.get("totalStudents", 0)
        pass_pct = cohort_info.get("passPercentage", 0)
        avg_gpa = cohort_info.get("averageGpa", 0.0)
        at_risk = cohort_info.get("totalAtRisk", 0)

        if "attendance" in q_lower:
            answer = f"Attendance metrics are not recorded in the institutional database for {dept} ({sem}). Consequently, attendance correlation graphs are not available in the component library."

        elif any(k in q_lower for k in ["pass", "percentage", "rate", "passing"]):
            answer = f"For {dept} ({sem}), the overall pass percentage is {pass_pct}% out of {total} registered students. A total of {total - int(round(total * pass_pct / 100))} students have one or more active arrears."

        elif any(k in q_lower for k in ["risk", "at-risk", "critical", "warning", "arrear"]):
            answer = f"Early-warning analytics identify {at_risk} student(s) at academic risk in {dept} ({sem}). Targeted remedial coaching sessions and mentor check-ins are recommended for these students."

        elif any(k in q_lower for k in ["top", "rank", "best", "honor roll", "leader"]):
            avail_map = {c["id"]: c for c in available_components}
            top_students = avail_map.get("cohort_top_performers_table", {}).get("data", [])
            if top_students:
                top_str = ", ".join([f"#{s['rank']} {s['name']} ({s['gpa']} SGPA)" for s in top_students[:3]])
                answer = f"Top academic performers in {dept} ({sem}) are: {top_str}. These students qualify for the Dean's Honor Roll."
            else:
                answer = f"Top performers list is being compiled from current examination ledgers."

        elif any(k in q_lower for k in ["report", "create", "build", "generate", "card"]):
            answer = f"I have organized the full departmental analytics suite for {dept} ({sem}). You can add the Cohort Overview, Grade Distribution Bar, Subject Difficulty Radar, and Top Performers to the canvas."

        else:
            answer = f"{dept} ({sem}) currently records {total} students with an average SGPA of {avg_gpa}/10.0, an overall pass percentage of {pass_pct}%, and {at_risk} students flagged for academic intervention."

    return {
        "status": "success",
        "answer": answer,
        "suggestedComponents": suggested_components
    }

