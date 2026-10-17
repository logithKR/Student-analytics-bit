import pandas as pd
import numpy as np
import os
import glob
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEMESTERS = ["I", "III", "V", "VII"]

def get_dataset_path() -> str:
    """Dynamically resolves the dataset directory path across any machine."""
    env_path = os.getenv("DATASET_PATH")
    if env_path:
        if not os.path.isabs(env_path):
            candidate = os.path.abspath(os.path.join(BASE_DIR, env_path))
        else:
            candidate = env_path
        if os.path.exists(candidate):
            return candidate

    # Standard candidate search locations
    candidates = [
        os.path.join(BASE_DIR, "data", "UG"),
        os.path.join(BASE_DIR, "data"),
        os.path.abspath(os.path.join(BASE_DIR, "..", "..", "dataset", "UG")),
        os.path.abspath(os.path.join(BASE_DIR, "..", "..", "dataset")),
    ]
    for c in candidates:
        if os.path.exists(c) and any(f.endswith(".xlsx") for root, _, files in os.walk(c) for f in files):
            return c

    # Fallback to backend/data/UG (create if not exists)
    fallback = os.path.join(BASE_DIR, "data", "UG")
    os.makedirs(fallback, exist_ok=True)
    return fallback


def create_sample_dataset_if_empty(target_base: str):
    """
    Creates realistic sample Excel files adhering to university result schemas
    if no result workbooks exist, guaranteeing out-of-the-box functionality on any system.
    """
    existing_files = glob.glob(os.path.join(target_base, "**", "*.xlsx"), recursive=True)
    if existing_files:
        return

    sample_departments = {
        "CSE": {
            "V": [
                ("19CS501", "Data Structures"),
                ("19CS502", "Computer Networks"),
                ("19CS503", "Operating Systems"),
                ("19CS504", "Database Systems"),
                ("19CS505", "Theory of Computation"),
            ],
            "VII": [
                ("19CS701", "Cloud Computing"),
                ("19CS702", "Machine Learning"),
                ("19CS703", "Cyber Security"),
                ("19CS704", "Distributed Systems"),
            ]
        },
        "IT": {
            "V": [
                ("19IT501", "Web Technology"),
                ("19IT502", "Software Engineering"),
                ("19IT503", "Data Mining"),
                ("19IT504", "Information Security"),
            ]
        }
    }

    first_names = ["Arun", "Bhavya", "Chandran", "Divya", "Ezhil", "Gokul", "Harini", "Ishaan", "Janani", "Karthik", "Lavanya", "Mano", "Naveen", "Pooja", "Rahul", "Swetha", "Vignesh", "Yamini"]
    last_names = ["Kumar", "S", "R", "Murugan", "K", "Raj", "M", "Nath", "Prasad", "Devi"]

    np.random.seed(42)

    for dept, sems in sample_departments.items():
        for sem, subjects in sems.items():
            sem_dir = os.path.join(target_base, dept, sem)
            os.makedirs(sem_dir, exist_ok=True)
            file_path = os.path.join(sem_dir, f"{dept}-CONS-WO.xlsx")

            # Construct university sheet format: Row 0 title, Row 1 empty, Row 2 merged course codes, Row 3 sub-headers
            r2 = ["", "", "", ""]
            r3 = ["S.No", "Register Number", "Name", "Result"]

            for sub_code, _ in subjects:
                r2.extend([sub_code, sub_code, sub_code, sub_code])
                r3.extend(["IM", "EM", "TOT", "GRD"])

            r2.extend(["GPA", "REMARKS"])
            r3.extend(["GPA", "REMARKS"])

            rows_data = [
                ["ACADEMIC PERFORMANCE REPORT - " + dept] + [""] * (len(r3) - 1),
                [""] * len(r3),
                r2,
                r3
            ]

            num_students = 28
            for i in range(1, num_students + 1):
                reg_num = f"7376221{dept[:2]}{100 + i:03d}"
                name = f"{first_names[(i - 1) % len(first_names)]} {last_names[(i * 3) % len(last_names)]}"

                student_ims = []
                student_tots = []
                student_grds = []

                # Inject realistic variability: top students, average, and a few at-risk/failures
                is_struggling = (i % 7 == 0) or (i % 11 == 0)

                for _ in subjects:
                    if is_struggling:
                        im = round(float(np.random.choice([12.0, 15.0, 18.0, 22.0, 0.0])), 1)
                        em = round(float(np.random.choice([18.0, 24.0, 30.0, 0.0])), 1)
                    else:
                        im = round(float(np.random.uniform(28.0, 48.0)), 1)
                        em = round(float(np.random.uniform(32.0, 48.0)), 1)

                    tot = min(100.0, round(im + em, 1))
                    if tot >= 90: grd = "S"
                    elif tot >= 80: grd = "A+"
                    elif tot >= 70: grd = "A"
                    elif tot >= 60: grd = "B+"
                    elif tot >= 50: grd = "B"
                    elif tot >= 45: grd = "C"
                    else: grd = "U"

                    student_ims.append(im)
                    student_tots.append(tot)
                    student_grds.append(grd)

                has_arrear = "U" in student_grds
                res = "FAIL" if has_arrear else "PASS"
                avg_tot = float(np.mean(student_tots))
                gpa = round(max(3.5, min(9.9, avg_tot / 10.0)), 2) if not has_arrear else round(max(3.0, avg_tot / 12.0), 2)

                student_row = [i, reg_num, name, res]
                for idx_s in range(len(subjects)):
                    student_row.extend([student_ims[idx_s], round(student_tots[idx_s] - student_ims[idx_s], 1), student_tots[idx_s], student_grds[idx_s]])

                student_row.extend([gpa, "GOOD" if gpa >= 7.5 else ("AVERAGE" if gpa >= 5.5 else "NEEDS COUNSELING")])
                rows_data.append(student_row)

            df_out = pd.DataFrame(rows_data)
            try:
                df_out.to_excel(file_path, header=False, index=False)
            except Exception as e:
                print(f"[!] Warning: Could not write seed spreadsheet {file_path}: {e}")


def load_data():
    """Loads and aggregates all student records across all department spreadsheets."""
    all_students = []
    dataset_path = get_dataset_path()

    # Ensure dataset exists; create sample data if completely empty
    if not os.path.exists(dataset_path) or not os.listdir(dataset_path):
        create_sample_dataset_if_empty(dataset_path)

    if not os.path.exists(dataset_path):
        return []

    for dept in os.listdir(dataset_path):
        dept_dir = os.path.join(dataset_path, dept)
        if not os.path.isdir(dept_dir): continue
        
        for sem in SEMESTERS:
            # Check for both "I" and "I SEM" formats
            sem_dir = os.path.join(dept_dir, sem)
            if not os.path.exists(sem_dir):
                sem_dir = os.path.join(dept_dir, f"{sem} SEM")
            
            if not os.path.exists(sem_dir):
                continue
                
            excel_files = glob.glob(os.path.join(sem_dir, "*.xlsx"))
            for file_path in excel_files:
                try:
                    df = pd.read_excel(file_path, header=None)
                    if len(df) < 5:
                        continue
                    
                    # Extract headers (Row 2 and Row 3)
                    row2 = df.iloc[2].ffill().astype(str)
                    row3 = df.iloc[3].fillna("").astype(str)
                    
                    # Create combined column names
                    col_names = []
                    for r2, r3 in zip(row2, row3):
                        r2_str = "" if str(r2).lower() == "nan" else str(r2).strip()
                        r3_str = "" if str(r3).lower() == "nan" else str(r3).strip()
                        if r3_str.upper() in ["GPA", "REMARKS"]:
                            col_names.append(r3_str.upper())
                        elif not r3_str:
                            col_names.append(r2_str)
                        elif not r2_str:
                            col_names.append(r3_str)
                        else:
                            col_names.append(f"{r2_str}_{r3_str}")
                    
                    # Apply columns and drop header rows
                    df.columns = col_names
                    
                    reg_col = None
                    for c in df.columns:
                        if any(k in str(c).upper() for k in ["REGISTER", "REG NO", "ROLL"]):
                            reg_col = c
                            break
                    if not reg_col:
                        continue

                    df = df.iloc[4:].dropna(subset=[reg_col])
                    
                    # Parse student records
                    for _, row in df.iterrows():
                        reg_num = str(row.get(reg_col, "")).strip()
                        if not reg_num or reg_num.lower() in ["nan", "none", ""]:
                            continue
                        
                        name = ""
                        for c in df.columns:
                            if "NAME" in str(c).upper():
                                name = str(row.get(c, "")).strip()
                                break
                        if not name:
                            name = f"Student {reg_num}"

                        result = "PASS"
                        for c in df.columns:
                            if str(c).upper() in ["RESULT", "RES"]:
                                result = str(row.get(c, "PASS")).strip().upper()
                                break

                        gpa = 0.0
                        for c in df.columns:
                            if "GPA" in str(c).upper():
                                raw_gpa = row.get(c, 0)
                                try: gpa = float(raw_gpa)
                                except Exception: gpa = 0.0
                                break
                        
                        # Extract subjects
                        subjects = []
                        subject_codes = set([c.split('_')[0] for c in col_names if '_' in c and len(c.split('_')) == 2])
                        for sub in subject_codes:
                            if not sub or sub.lower() in ['nan', 'none', '']: continue
                            im = row.get(f"{sub}_IM", 0)
                            em = row.get(f"{sub}_EM", 0)
                            tot = row.get(f"{sub}_TOT", 0)
                            grd = row.get(f"{sub}_GRD", "")
                            
                            try: im = float(im) if pd.notna(im) else 0.0
                            except: im = 0.0
                            try: em = float(em) if pd.notna(em) else 0.0
                            except: em = 0.0
                            try: tot = float(tot) if pd.notna(tot) else 0.0
                            except: tot = 0.0
                            
                            if pd.notna(grd) and str(grd).strip() != "":
                                subjects.append({
                                    "code": sub,
                                    "im": im,
                                    "em": em,
                                    "tot": tot,
                                    "grd": str(grd).strip().upper()
                                })

                        # Count failed subjects
                        fail_subjects = [s for s in subjects if s["grd"] in ["U", "F", "RA", "FAIL"]]
                        
                        student = {
                            "registerNumber": reg_num,
                            "name": name,
                            "department": dept,
                            "semester": sem,
                            "result": result,
                            "gpa": gpa,
                            "subjects": subjects,
                            "failCount": len(fail_subjects)
                        }
                        all_students.append(student)
                        
                except Exception as e:
                    print(f"[!] Error reading spreadsheet {file_path}: {e}")
                
    return all_students


DEPT_ALIAS_MAP = {
    "CSE": "CS",
    "COMPUTER SCIENCE": "CS",
    "COMPUTER SCIENCE & ENGINEERING": "CS",
    "COMPUTER SCIENCE AND ENGINEERING": "CS",
    "AIDS": "AD",
    "AI&DS": "AD",
    "AIML": "AL",
    "AI&ML": "AL",
    "MECH": "ME",
    "MECHANICAL": "ME",
    "CIVIL": "CE",
    "ECE": "EC",
    "EEE": "EE",
    "EIE": "EI",
    "BIOTECH": "BT",
    "BIOMED": "BM",
    "CSBS": "CB",
    "FOOD": "FT",
    "TEXTILE": "TT",
    "AGRI": "AG",
    "AGRICULTURE": "AG",
    "MECHATRONICS": "MC",
    "INFORMATION SCIENCE": "ISE",
    "INFORMATION TECHNOLOGY": "IT",
}

def normalize_dept(dept: str) -> str:
    if not dept:
        return dept
    cleaned = str(dept).strip().upper()
    return DEPT_ALIAS_MAP.get(cleaned, cleaned)

def _filter_data(data, department=None, semester=None):
    if department and department != "All":
        norm_dept = normalize_dept(department)
        data = [s for s in data if normalize_dept(s.get("department")) == norm_dept]
    if semester and semester != "All":
        data = [s for s in data if s.get("semester") == semester]
    return data


def get_dashboard_summary(data, department=None, semester=None):
    data = _filter_data(data, department, semester)
    if not data:
        return {"totalStudents": 0, "averageGpa": 0, "highestGpa": 0, "lowestGpa": 0, "passCount": 0, "failCount": 0, "passPercentage": 0}
        
    gpas = [s["gpa"] for s in data if s["gpa"] > 0]
    pass_count = len([s for s in data if s["result"].upper() in ["P", "PASS", "SAFE"]])
    fail_count = len(data) - pass_count
    
    return {
        "totalStudents": len(data),
        "averageGpa": round(sum(gpas) / len(gpas), 2) if gpas else 0,
        "highestGpa": max(gpas) if gpas else 0,
        "lowestGpa": min(gpas) if gpas else 0,
        "passCount": pass_count,
        "failCount": fail_count,
        "passPercentage": round((pass_count / len(data)) * 100, 2) if data else 0
    }


def get_subject_analytics(data, department=None, semester=None):
    data = _filter_data(data, department, semester)
    subject_stats = {}
    for s in data:
        for sub in s["subjects"]:
            code = sub["code"]
            if code not in subject_stats:
                subject_stats[code] = {"total_marks": [], "grades": [], "passes": 0, "fails": 0}
            
            subject_stats[code]["total_marks"].append(sub["tot"])
            subject_stats[code]["grades"].append(sub["grd"])
            if sub["grd"] in ["U", "F", "RA", "FAIL"]:
                subject_stats[code]["fails"] += 1
            else:
                subject_stats[code]["passes"] += 1
                
    result = []
    for code, stats in subject_stats.items():
        marks = stats["total_marks"]
        if not marks: continue
        result.append({
            "subject": code,
            "average": round(sum(marks) / len(marks), 2),
            "highest": max(marks),
            "lowest": min(marks),
            "passCount": stats["passes"],
            "failCount": stats["fails"]
        })
    return result


def get_top_performers(data, department=None, semester=None, limit=5):
    """Get top N students by GPA for the selected department/semester."""
    data = _filter_data(data, department, semester)
    sorted_students = sorted(data, key=lambda x: x["gpa"], reverse=True)
    top = []
    for i, s in enumerate(sorted_students[:limit]):
        top.append({
            "rank": i + 1,
            "registerNumber": s["registerNumber"],
            "name": s["name"],
            "semester": s["semester"],
            "gpa": s["gpa"]
        })
    return top


def get_class_division(data, department=None, semester=None):
    """Categorize students into academic divisions based on GPA."""
    data = _filter_data(data, department, semester)
    divisions = {
        "distinction": 0,   # GPA >= 8.0
        "firstClass": 0,    # GPA 6.5 - 7.99
        "secondClass": 0,   # GPA 5.0 - 6.49
        "fail": 0           # GPA < 5.0 or result is fail
    }
    for s in data:
        if s["result"].upper() not in ["P", "PASS", "SAFE"] or s["gpa"] < 5.0:
            divisions["fail"] += 1
        elif s["gpa"] >= 8.0:
            divisions["distinction"] += 1
        elif s["gpa"] >= 6.5:
            divisions["firstClass"] += 1
        else:
            divisions["secondClass"] += 1
    
    total = len(data) if data else 1
    return [
        {"name": "Distinction (8.0+)", "value": divisions["distinction"], "percentage": round(divisions["distinction"] / total * 100, 1)},
        {"name": "First Class (6.5-7.99)", "value": divisions["firstClass"], "percentage": round(divisions["firstClass"] / total * 100, 1)},
        {"name": "Second Class (5.0-6.49)", "value": divisions["secondClass"], "percentage": round(divisions["secondClass"] / total * 100, 1)},
        {"name": "Reappear / Fail", "value": divisions["fail"], "percentage": round(divisions["fail"] / total * 100, 1)},
    ]


def get_grade_distribution(data, department=None, semester=None):
    """Get grade distribution across all subjects for stacked bar chart."""
    data = _filter_data(data, department, semester)
    grade_order = ["S", "A+", "A", "B+", "B", "C", "U"]
    grade_counts = {g: 0 for g in grade_order}
    total = 0
    
    for s in data:
        for sub in s["subjects"]:
            g = sub["grd"]
            if g in grade_counts:
                grade_counts[g] += 1
            total += 1
    
    result = []
    for g in grade_order:
        result.append({
            "grade": g,
            "count": grade_counts[g],
            "percentage": round(grade_counts[g] / total * 100, 1) if total > 0 else 0
        })
    return result


def get_semester_trends(data, department=None):
    semesters = ["I", "III", "V", "VII"]
    trends = []
    dept_data = _filter_data(data, department=department)
    
    for sem in semesters:
        sem_data = [s for s in dept_data if s["semester"] == sem]
        if sem_data:
            gpas = [s["gpa"] for s in sem_data if s["gpa"] > 0]
            avg_gpa = round(sum(gpas) / len(gpas), 2) if gpas else 0
            trends.append({
                "semester": sem,
                "averageGpa": avg_gpa,
                "studentCount": len(sem_data)
            })
    return trends


def get_batch_comparison(data, department=None):
    """Grade distribution per semester for stacked bar comparison."""
    grade_order = ["S", "A+", "A", "B+", "B", "C", "U"]
    result = []
    dept_data = _filter_data(data, department=department)
    
    for sem in SEMESTERS:
        sem_data = [s for s in dept_data if s["semester"] == sem]
        grade_counts = {g: 0 for g in grade_order}
        total = 0
        for s in sem_data:
            for sub in s["subjects"]:
                g = sub["grd"]
                if g in grade_counts:
                    grade_counts[g] += 1
                total += 1
        
        entry = {"semester": f"Sem {sem}"}
        for g in grade_order:
            entry[g] = round(grade_counts[g] / total * 100, 1) if total > 0 else 0
        result.append(entry)
    return result


def get_at_risk_students(data, department=None, semester=None):
    """Categorize students into risk levels based on academic rules."""
    data = _filter_data(data, department, semester)
    
    high_risk = []
    moderate_risk = []
    
    for s in data:
        is_fail = s["result"].upper() not in ["P", "PASS", "SAFE"]
        gpa = s["gpa"]
        fail_count = s["failCount"]
        
        risk_level = None
        reason = ""
        
        if is_fail or gpa < 5.0 or fail_count >= 2:
            risk_level = "critical"
            reasons = []
            if is_fail: reasons.append("Failed overall")
            if gpa < 5.0: reasons.append(f"Low GPA ({gpa})")
            if fail_count >= 2: reasons.append(f"{fail_count} arrears")
            reason = " | ".join(reasons)
            high_risk.append({
                "registerNumber": s["registerNumber"],
                "name": s["name"],
                "semester": s["semester"],
                "gpa": gpa,
                "failCount": fail_count,
                "riskLevel": "critical",
                "reason": reason
            })
        elif gpa < 6.0 or fail_count == 1:
            risk_level = "warning"
            reasons = []
            if gpa < 6.0: reasons.append(f"Borderline GPA ({gpa})")
            if fail_count == 1: reasons.append("1 arrear")
            reason = " | ".join(reasons)
            moderate_risk.append({
                "registerNumber": s["registerNumber"],
                "name": s["name"],
                "semester": s["semester"],
                "gpa": gpa,
                "failCount": fail_count,
                "riskLevel": "warning",
                "reason": reason
            })
    
    return {
        "highRiskCount": len(high_risk),
        "moderateRiskCount": len(moderate_risk),
        "totalAtRisk": len(high_risk) + len(moderate_risk),
        "highRisk": high_risk,
        "moderateRisk": moderate_risk
    }
