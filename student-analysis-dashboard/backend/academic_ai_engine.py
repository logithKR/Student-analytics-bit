"""
Academic Intelligence — Academic AI Engine & Deterministic Database Truth Service
Provides canonical department recognition, deterministic student rankings,
conversation context resolution, and database-grounded answers.
"""

import re
from typing import Dict, Any, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Canonical University Departments Registry (20 Real Departments)
# ---------------------------------------------------------------------------
CANONICAL_DEPARTMENTS: Dict[str, Dict[str, Any]] = {
    "CD": {
        "code": "CD",
        "canonical_id": "CD",
        "name": "Computer Science & Design",
        "short_name": "CSD",
        "degree": "B.E. Computer Science and Design",
        "aliases": [
            "COMPUTER SCIENCE AND DESIGN",
            "COMPUTER SCIENCE & DESIGN",
            "COMPUTER SCIENCE DESIGN",
            "CS & DESIGN",
            "CS AND DESIGN",
            "CS&DESIGN",
            "CS & D",
            "CS AND D",
            "CS&D",
            "CSD",
            "CD"
        ]
    },
    "CS": {
        "code": "CS",
        "canonical_id": "CS",
        "name": "Computer Science & Engineering",
        "short_name": "CSE",
        "degree": "B.E. Computer Science and Engineering",
        "aliases": [
            "COMPUTER SCIENCE AND ENGINEERING",
            "COMPUTER SCIENCE & ENGINEERING",
            "COMPUTER SCIENCE",
            "COMP SCI",
            "COMPUTERS",
            "CSE",
            "CS"
        ]
    },
    "CB": {
        "code": "CB",
        "canonical_id": "CB",
        "name": "Computer Science & Business Systems",
        "short_name": "CSBS",
        "degree": "B.Tech Computer Science and Business Systems",
        "aliases": [
            "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
            "COMPUTER SCIENCE & BUSINESS SYSTEMS",
            "CS AND BUSINESS SYSTEMS",
            "CS & BUSINESS SYSTEMS",
            "CSBS",
            "CB"
        ]
    },
    "CT": {
        "code": "CT",
        "canonical_id": "CT",
        "name": "Computer Technology",
        "short_name": "CT",
        "degree": "B.Tech Computer Technology",
        "aliases": [
            "COMPUTER TECHNOLOGY",
            "COMP TECH",
            "CT"
        ]
    },
    "AD": {
        "code": "AD",
        "canonical_id": "AD",
        "name": "Artificial Intelligence & Data Science",
        "short_name": "AI & DS",
        "degree": "B.Tech Artificial Intelligence and Data Science",
        "aliases": [
            "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
            "ARTIFICIAL INTELLIGENCE & DATA SCIENCE",
            "AI AND DATA SCIENCE",
            "AI & DATA SCIENCE",
            "AI AND DS",
            "AI & DS",
            "AI DATA SCIENCE",
            "AIDS",
            "AD"
        ]
    },
    "AL": {
        "code": "AL",
        "canonical_id": "AL",
        "name": "Artificial Intelligence & Machine Learning",
        "short_name": "AI & ML",
        "degree": "B.E. Artificial Intelligence and Machine Learning",
        "aliases": [
            "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
            "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING",
            "AI AND MACHINE LEARNING",
            "AI & MACHINE LEARNING",
            "AI AND ML",
            "AI & ML",
            "AI MACHINE LEARNING",
            "AIML",
            "AL"
        ]
    },
    "IT": {
        "code": "IT",
        "canonical_id": "IT",
        "name": "Information Technology",
        "short_name": "IT",
        "degree": "B.Tech Information Technology",
        "aliases": [
            "INFORMATION TECHNOLOGY",
            "INFO TECH",
            "IT"
        ]
    },
    "ISE": {
        "code": "ISE",
        "canonical_id": "ISE",
        "name": "Information Science & Engineering",
        "short_name": "ISE",
        "degree": "B.E. Information Science and Engineering",
        "aliases": [
            "INFORMATION SCIENCE AND ENGINEERING",
            "INFORMATION SCIENCE & ENGINEERING",
            "INFORMATION SCIENCE",
            "INFO SCIENCE",
            "ISE"
        ]
    },
    "EC": {
        "code": "EC",
        "canonical_id": "EC",
        "name": "Electronics & Communication Engineering",
        "short_name": "ECE",
        "degree": "B.E. Electronics and Communication Engineering",
        "aliases": [
            "ELECTRONICS AND COMMUNICATION ENGINEERING",
            "ELECTRONICS & COMMUNICATION ENGINEERING",
            "ELECTRONICS AND COMMUNICATION",
            "ELECTRONICS & COMMUNICATION",
            "ECE",
            "EC"
        ]
    },
    "EE": {
        "code": "EE",
        "canonical_id": "EE",
        "name": "Electrical & Electronics Engineering",
        "short_name": "EEE",
        "degree": "B.E. Electrical and Electronics Engineering",
        "aliases": [
            "ELECTRICAL AND ELECTRONICS ENGINEERING",
            "ELECTRICAL & ELECTRONICS ENGINEERING",
            "ELECTRICAL AND ELECTRONICS",
            "ELECTRICAL & ELECTRONICS",
            "EEE",
            "EE"
        ]
    },
    "EI": {
        "code": "EI",
        "canonical_id": "EI",
        "name": "Electronics & Instrumentation Engineering",
        "short_name": "EIE",
        "degree": "B.E. Electronics and Instrumentation Engineering",
        "aliases": [
            "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
            "ELECTRONICS & INSTRUMENTATION ENGINEERING",
            "ELECTRONICS AND INSTRUMENTATION",
            "ELECTRONICS & INSTRUMENTATION",
            "EIE",
            "EI"
        ]
    },
    "BM": {
        "code": "BM",
        "canonical_id": "BM",
        "name": "Biomedical Engineering",
        "short_name": "BME",
        "degree": "B.E. Biomedical Engineering",
        "aliases": [
            "BIOMEDICAL ENGINEERING",
            "BIOMEDICAL",
            "BIOMED",
            "BME",
            "BM"
        ]
    },
    "BT": {
        "code": "BT",
        "canonical_id": "BT",
        "name": "Biotechnology",
        "short_name": "Biotech",
        "degree": "B.Tech Biotechnology",
        "aliases": [
            "BIOTECHNOLOGY",
            "BIOTECH",
            "BT"
        ]
    },
    "CE": {
        "code": "CE",
        "canonical_id": "CE",
        "name": "Civil Engineering",
        "short_name": "Civil",
        "degree": "B.E. Civil Engineering",
        "aliases": [
            "CIVIL ENGINEERING",
            "CIVIL",
            "CE"
        ]
    },
    "ME": {
        "code": "ME",
        "canonical_id": "ME",
        "name": "Mechanical Engineering",
        "short_name": "Mech",
        "degree": "B.E. Mechanical Engineering",
        "aliases": [
            "MECHANICAL ENGINEERING",
            "MECHANICAL",
            "MECH",
            "ME"
        ]
    },
    "MC": {
        "code": "MC",
        "canonical_id": "MC",
        "name": "Mechatronics Engineering",
        "short_name": "Mechatronics",
        "degree": "B.E. Mechatronics Engineering",
        "aliases": [
            "MECHATRONICS ENGINEERING",
            "MECHATRONICS",
            "MTRX",
            "MC"
        ]
    },
    "AG": {
        "code": "AG",
        "canonical_id": "AG",
        "name": "Agricultural Engineering",
        "short_name": "Agri",
        "degree": "B.E. Agricultural Engineering",
        "aliases": [
            "AGRICULTURAL ENGINEERING",
            "AGRICULTURE ENGINEERING",
            "AGRICULTURE",
            "AGRI",
            "AG"
        ]
    },
    "FT": {
        "code": "FT",
        "canonical_id": "FT",
        "name": "Food Technology",
        "short_name": "Food Tech",
        "degree": "B.Tech Food Technology",
        "aliases": [
            "FOOD TECHNOLOGY",
            "FOOD TECH",
            "FOOD",
            "FT"
        ]
    },
    "FD": {
        "code": "FD",
        "canonical_id": "FD",
        "name": "Fashion Technology",
        "short_name": "Fashion",
        "degree": "B.Tech Fashion Technology",
        "aliases": [
            "FASHION TECHNOLOGY",
            "FASHION TECH",
            "FASHION",
            "FD"
        ]
    },
    "TT": {
        "code": "TT",
        "canonical_id": "TT",
        "name": "Textile Technology",
        "short_name": "Textile",
        "degree": "B.Tech Textile Technology",
        "aliases": [
            "TEXTILE TECHNOLOGY",
            "TEXTILE TECH",
            "TEXTILE",
            "TT"
        ]
    }
}

# Pre-compile alias patterns sorted strictly by length descending (longest first)
COMPILED_ALIASES: List[Tuple[re.Pattern, str, str]] = []
for _code, _meta in CANONICAL_DEPARTMENTS.items():
    for _alias in _meta["aliases"]:
        # Use word boundaries so shorter tokens (e.g. CS) never match inside longer tokens (e.g. CSD, CSBS)
        _pattern = re.compile(r'\b' + re.escape(_alias) + r'\b', re.IGNORECASE)
        COMPILED_ALIASES.append((_pattern, _code, _meta["name"]))

# Sort descending by alias length so "COMPUTER SCIENCE AND DESIGN" and "CSD" take precedence over "CS"
COMPILED_ALIASES.sort(key=lambda x: len(x[0].pattern), reverse=True)


def resolve_department(query: str, context: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Deterministically resolves a department from user text or conversation context.
    Strictly distinguishes CSD from CS using word boundaries and precedence ordering.
    """
    if not query:
        if context and context.get("last_department"):
            dept_code = context["last_department"]
            if dept_code in CANONICAL_DEPARTMENTS:
                meta = CANONICAL_DEPARTMENTS[dept_code]
                return {"code": meta["code"], "name": meta["name"], "source": "context"}
        return None

    # 1. Check query against all pre-compiled aliases (longest first)
    for pattern, code, name in COMPILED_ALIASES:
        if pattern.search(query):
            meta = CANONICAL_DEPARTMENTS[code]
            return {
                "code": meta["code"],
                "name": meta["name"],
                "short_name": meta["short_name"],
                "degree": meta["degree"],
                "source": "query"
            }

    # 2. Check for unknown department reference (e.g. "Aerospace", "Marine", "Robotics")
    unknown_match = re.search(r'\b(?:in|of|for|department|dept)\s+([A-Za-z &]{3,30})\s*(?:department|dept)?\b', query, re.IGNORECASE)
    if unknown_match:
        potential_dept = unknown_match.group(1).strip()
        stop_words = {"the", "a", "an", "all", "our", "their", "this", "each", "every", "pass", "fail", "marks", "grade", "gpa", "cgpa", "student", "students", "semester", "sem"}
        if potential_dept.lower() not in stop_words and len(potential_dept) >= 3:
            # Check if it didn't match any known alias
            return {
                "unknown": True,
                "raw_name": potential_dept
            }

    # 3. Fallback to conversation context if query does not specify a department
    if context and context.get("last_department"):
        dept_code = context["last_department"]
        if dept_code in CANONICAL_DEPARTMENTS:
            meta = CANONICAL_DEPARTMENTS[dept_code]
            return {"code": meta["code"], "name": meta["name"], "short_name": meta["short_name"], "source": "context"}

    return None


def get_ranked_students_for_department(
    student_data: List[Dict[str, Any]],
    department_code: str,
    semester: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Filters and deterministically ranks students belonging to a department.
    Handles ties deterministically with secondary sort on registerNumber.
    """
    if department_code == "CS":
        matching = [s for s in student_data if str(s.get("department", "")).strip().upper() in ("CS", "CSE")]
    else:
        matching = [s for s in student_data if str(s.get("department", "")).strip().upper() == department_code]

    if semester and semester != "All":
        matching = [s for s in matching if str(s.get("semester", "")).strip().upper() == str(semester).strip().upper()]

    # Sort descending by GPA, ascending by registerNumber for consistent tie-breaking
    def sort_key(s):
        try:
            g = float(s.get("gpa", 0.0))
        except (ValueError, TypeError):
            g = 0.0
        return (-g, str(s.get("registerNumber", "")))

    return sorted(matching, key=sort_key)


def get_student_by_register_number(student_data: List[Dict[str, Any]], reg_no: str) -> Optional[Dict[str, Any]]:
    """Finds a student record by exact register number."""
    target = reg_no.strip().upper()
    for s in student_data:
        if str(s.get("registerNumber", "")).strip().upper() == target:
            return s
    return None


def parse_ranking_intent(query: str) -> Optional[Dict[str, Any]]:
    """
    Detects if query is requesting a specific rank (#1 top, #2 second, #3 third, or top N).
    """
    q = query.lower()

    # Exact ordinal checks
    if any(k in q for k in ["second student", "2nd student", "second highest", "second best", "rank 2", "who is second", "who is the second", "show second"]):
        return {"type": "single_rank", "rank": 2}

    if any(k in q for k in ["third student", "3rd student", "third highest", "third best", "rank 3", "who is third", "who is the third", "show third"]):
        return {"type": "single_rank", "rank": 3}

    if any(k in q for k in ["fourth student", "4th student", "fourth highest", "rank 4"]):
        return {"type": "single_rank", "rank": 4}

    if any(k in q for k in ["fifth student", "5th student", "fifth highest", "rank 5"]):
        return {"type": "single_rank", "rank": 5}

    # Top N check (e.g. "top 3", "top 5", "top 10 students")
    top_n_match = re.search(r'\b(?:top|first|best)\s+(\d+)\s*(?:students?|performers?|achievers?)?\b', q)
    if top_n_match:
        count = int(top_n_match.group(1))
        return {"type": "top_n", "limit": min(max(count, 1), 50)}

    # Top / #1 single check
    if any(k in q for k in ["top student", "top performer", "best student", "highest student", "topper", "rank 1", "rank one", "highest gpa", "highest cgpa", "number 1 student", "number one student", "who is the top"]):
        return {"type": "single_rank", "rank": 1}

    return None


def parse_metric_follow_up_intent(query: str, context: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Detects follow-up questions asking about the previously referenced student's metrics:
    - "What is their CGPA?"
    - "What is her GPA?"
    - "What semester are they in?"
    - "Tell me about them"
    """
    if not context or not context.get("last_student"):
        return None

    q = query.lower().strip()
    pronouns = ["their", "his", "her", "them", "this student", "that student", "they"]
    has_pronoun = any(p in q for p in pronouns) or len(q.split()) <= 4

    if has_pronoun and any(k in q for k in ["cgpa", "gpa", "marks", "score", "grade", "arrear", "semester", "status", "who is", "details"]):
        return {
            "type": "student_metric",
            "student": context["last_student"]
        }

    return None


def execute_academic_query(
    query: str,
    student_data: List[Dict[str, Any]],
    context: Optional[Dict[str, Any]] = None,
    mode: str = "chat_viz"
) -> Optional[Dict[str, Any]]:
    """
    Primary Deterministic Academic Truth Pipeline.
    Answers ranking, department, and student queries with 100% verified database grounding.
    Returns None if the query is not an academic ranking/student question (allowing general Groq pass-through).
    """
    context = context or {}
    q_clean = query.strip()

    # 1. Check for metric follow-up on previously discussed student ("What is their CGPA?")
    metric_follow_up = parse_metric_follow_up_intent(q_clean, context)
    if metric_follow_up:
        last_s_reg = metric_follow_up["student"].get("registerNumber")
        student = get_student_by_register_number(student_data, last_s_reg) if last_s_reg else None
        if student:
            dept_code = student.get("department", "CS")
            dept_meta = CANONICAL_DEPARTMENTS.get(dept_code, {"name": dept_code})
            gpa_val = student.get("gpa", 0.0)
            sem_val = student.get("semester", "")
            fail_count = student.get("failCount", 0)
            status_label = "Optimal (Green)" if fail_count == 0 else f"At-Risk ({fail_count} Arrears)"

            answer = (
                f"**{student.get('name')}** (`{student.get('registerNumber')}`) in **{dept_meta.get('name')}** "
                f"currently holds a cumulative GPA of **{gpa_val:.2f} / 10.0** (Semester {sem_val}, Result: {student.get('result', 'PASS')}, "
                f"Standing: {status_label})."
            )

            student_card = {
                "name": student.get("name"),
                "registerNumber": student.get("registerNumber"),
                "department": dept_meta.get("name"),
                "departmentCode": dept_code,
                "gpa": gpa_val,
                "semester": sem_val,
                "result": student.get("result", "PASS"),
                "rank": context.get("last_rank", 1),
                "failCount": fail_count
            }

            return {
                "status": "success",
                "intent": "database_query",
                "answer": answer,
                "studentCard": student_card,
                "updated_context": {
                    "last_department": dept_code,
                    "last_student": student_card
                },
                "data": [student_card],
                "columns": [
                    {"name": "name", "type": "string"},
                    {"name": "registerNumber", "type": "string"},
                    {"name": "department", "type": "string"},
                    {"name": "gpa", "type": "number"},
                    {"name": "semester", "type": "string"}
                ],
                "totalRows": 1,
                "modelUsed": "Deterministic Academic Grounding Engine",
                "is_visualizable": False
            }

    # 2. Check for ranking intent ("Who is the top student in CSD?", "Show the second student")
    rank_intent = parse_ranking_intent(q_clean)
    if not rank_intent:
        return None

    # Resolve department (query or conversation context)
    dept_res = resolve_department(q_clean, context)

    # If department was mentioned but is unknown/unregistered
    if dept_res and dept_res.get("unknown"):
        raw = dept_res.get("raw_name")
        return {
            "status": "success",
            "intent": "general_chat",
            "answer": (
                f"The department '{raw}' was not found in the verified university records. "
                f"The application tracks 20 registered departments including **Computer Science & Design (CSD)**, "
                f"**Computer Science & Engineering (CS / CSE)**, **Information Technology (IT)**, "
                f"**Artificial Intelligence & Data Science (AIDS)**, **ECE**, **EEE**, and others. "
                f"Which department would you like to evaluate?"
            ),
            "clarificationNeeded": True,
            "data": [],
            "columns": [],
            "totalRows": 0,
            "modelUsed": "Institutional Registry Validator"
        }

    # If no department specified in query or context, clarify or show institutional top performers
    if not dept_res:
        # If user asked generally "Who is the top student?", rank across entire university
        top_all = sorted(student_data, key=lambda s: (-float(s.get("gpa", 0.0)), s.get("registerNumber", "")))
        if not top_all:
            return {
                "status": "success",
                "intent": "database_query",
                "answer": "No student records were found in the university database.",
                "totalRows": 0
            }

        target_rank = rank_intent.get("rank", 1) if rank_intent.get("type") == "single_rank" else 1
        idx = target_rank - 1
        if idx >= len(top_all):
            return {
                "status": "success",
                "intent": "database_query",
                "answer": f"There are only {len(top_all)} student records in the database.",
                "totalRows": 0
            }

        student = top_all[idx]
        dept_code = student.get("department", "CS")
        dept_meta = CANONICAL_DEPARTMENTS.get(dept_code, {"name": dept_code})

        student_card = {
            "name": student.get("name"),
            "registerNumber": student.get("registerNumber"),
            "department": dept_meta.get("name"),
            "departmentCode": dept_code,
            "gpa": float(student.get("gpa", 0.0)),
            "semester": student.get("semester"),
            "result": student.get("result", "PASS"),
            "rank": target_rank,
            "failCount": student.get("failCount", 0)
        }

        answer = (
            f"The **#{target_rank}** top-ranking student across the entire university is **{student.get('name')}** "
            f"from **{dept_meta.get('name')} ({dept_code})** with a GPA of **{student.get('gpa')}** "
            f"(Register Number: `{student.get('registerNumber')}`, Semester {student.get('semester')})."
        )

        return {
            "status": "success",
            "intent": "database_query",
            "answer": answer,
            "studentCard": student_card,
            "updated_context": {
                "last_department": dept_code,
                "last_student": student_card,
                "last_rank": target_rank
            },
            "data": [student_card],
            "columns": [
                {"name": "name", "type": "string"},
                {"name": "registerNumber", "type": "string"},
                {"name": "department", "type": "string"},
                {"name": "gpa", "type": "number"},
                {"name": "semester", "type": "string"}
            ],
            "totalRows": 1,
            "modelUsed": "Deterministic Academic Grounding Engine",
            "is_visualizable": False
        }

    # Department is confidently resolved
    dept_code = dept_res["code"]
    dept_name = dept_res["name"]
    ranked_students = get_ranked_students_for_department(student_data, dept_code)

    if not ranked_students:
        return {
            "status": "success",
            "intent": "database_query",
            "answer": f"No student records were found for the **{dept_name} ({dept_code})** department in the current database.",
            "data": [],
            "columns": [],
            "totalRows": 0,
            "modelUsed": "Deterministic Academic Grounding Engine"
        }

    # Case A: Requesting a single specific rank (e.g. #1 top student, or #2 second student)
    if rank_intent["type"] == "single_rank":
        target_rank = rank_intent["rank"]
        idx = target_rank - 1

        if idx >= len(ranked_students):
            return {
                "status": "success",
                "intent": "database_query",
                "answer": f"The **{dept_name} ({dept_code})** cohort contains {len(ranked_students)} students, so rank #{target_rank} is not available.",
                "totalRows": len(ranked_students)
            }

        student = ranked_students[idx]
        gpa_val = float(student.get("gpa", 0.0))
        sem_val = student.get("semester")

        rank_word = "top-ranking" if target_rank == 1 else "second-highest performing" if target_rank == 2 else "third-highest performing" if target_rank == 3 else f"#{target_rank} performing"

        answer = (
            f"The {rank_word} student in **{dept_name} ({dept_code})** is **{student.get('name')}** "
            f"with a cumulative GPA of **{gpa_val:.2f} / 10.0** (Register Number: `{student.get('registerNumber')}`, Semester {sem_val})."
        )

        student_card = {
            "name": student.get("name"),
            "registerNumber": student.get("registerNumber"),
            "department": dept_name,
            "departmentCode": dept_code,
            "gpa": gpa_val,
            "semester": sem_val,
            "result": student.get("result", "PASS"),
            "rank": target_rank,
            "failCount": student.get("failCount", 0)
        }

        return {
            "status": "success",
            "intent": "database_query",
            "answer": answer,
            "studentCard": student_card,
            "updated_context": {
                "last_department": dept_code,
                "last_student": student_card,
                "last_rank": target_rank
            },
            "data": [student_card],
            "columns": [
                {"name": "name", "type": "string"},
                {"name": "registerNumber", "type": "string"},
                {"name": "department", "type": "string"},
                {"name": "gpa", "type": "number"},
                {"name": "semester", "type": "string"}
            ],
            "totalRows": 1,
            "modelUsed": "Deterministic Academic Grounding Engine",
            "is_visualizable": False
        }

    # Case B: Requesting Top N list (e.g. "Top 5 students in CSD")
    limit = rank_intent["limit"]
    top_n = ranked_students[:limit]
    rows = []
    for i, s in enumerate(top_n):
        rows.append({
            "name": s.get("name"),
            "registerNumber": s.get("registerNumber"),
            "department": dept_name,
            "departmentCode": dept_code,
            "gpa": float(s.get("gpa", 0.0)),
            "semester": s.get("semester"),
            "rank": i + 1
        })

    lead_student = top_n[0]
    lead_card = {
        "name": lead_student.get("name"),
        "registerNumber": lead_student.get("registerNumber"),
        "department": dept_name,
        "departmentCode": dept_code,
        "gpa": float(lead_student.get("gpa", 0.0)),
        "semester": lead_student.get("semester"),
        "result": lead_student.get("result", "PASS"),
        "rank": 1
    }

    answer = (
        f"Here are the top {len(rows)} academic achievers in **{dept_name} ({dept_code})**. "
        f"**{lead_student.get('name')}** leads the cohort with a GPA of **{float(lead_student.get('gpa', 0)):.2f}**."
    )

    # Configure chart specification for horizontal bar
    spec = {
        "visualization": "horizontal_bar",
        "title": f"Top {len(rows)} Students in {dept_name} (Ranked by GPA)",
        "description": f"Verified academic GPA standings for {dept_name} ({dept_code})",
        "layout": "horizontal",
        "xAxis": {"field": "name", "label": "Student Name", "type": "category"},
        "yAxis": {"field": "gpa", "label": "GPA", "type": "number", "unit": "GPA", "domain": [0.0, 10.0]},
        "series": ["gpa"],
        "groupBy": [],
        "aggregation": "none",
        "sort": {"field": "gpa", "direction": "desc"},
        "limit": len(rows),
        "colors": ["#FFD43B", "#F0C419", "#EAB308", "#CA8A04", "#A16207"]
    }

    return {
        "status": "success",
        "intent": "database_query",
        "answer": answer,
        "studentCard": lead_card,
        "updated_context": {
            "last_department": dept_code,
            "last_student": lead_card,
            "last_rank": 1
        },
        "data": rows,
        "columns": [
            {"name": "rank", "type": "number"},
            {"name": "name", "type": "string"},
            {"name": "registerNumber", "type": "string"},
            {"name": "gpa", "type": "number"},
            {"name": "semester", "type": "string"}
        ],
        "totalRows": len(rows),
        "graphSpecification": spec,
        "visualization": spec,
        "showChart": mode == "chat_viz",
        "showTable": mode == "data_table",
        "modelUsed": "Deterministic Academic Grounding Engine",
        "is_visualizable": True
    }

