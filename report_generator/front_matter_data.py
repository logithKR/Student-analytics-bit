# Front matter content and tables specification

PROJECT_TITLE = "ACADEMIC INTELLIGENCE PLATFORM — STUDENT ANALYTICS & AI RISK ENGINE"

STUDENTS = [
    ("LOGITHKUMAR K R", "7376231CD124"),
    ("RAMESH S", "7376231CD141")
]

DEGREE = "BACHELOR OF ENGINEERING"
BRANCH = "COMPUTER SCIENCE AND DESIGN"
COLLEGE = "BANNARI AMMAN INSTITUTE OF TECHNOLOGY"
AUTONOMOUS = "(An Autonomous Institution Affiliated to Anna University, Chennai)"
LOCATION = "SATHYAMANGALAM - 638401"
UNIVERSITY = "ANNA UNIVERSITY: CHENNAI 600 025"
MONTH_YEAR = "APRIL 2026"

HOD_NAME = "Dr. VENKATESAN R"
HOD_DESIG = "HEAD OF THE DEPARTMENT"
HOD_DEPT = "Department of Computer Science and Design"

GUIDE_NAME = "Ms. INDHUMATHI K"
GUIDE_DESIG = "ASSISTANT PROFESSOR"
GUIDE_DEPT = "Department of Computer Science and Design"

CHAIRMAN = "Dr. S.V. Balasubramaniam"
PRINCIPAL = "Dr. C. Palanisamy"

ABSTRACT_TEXT = [
    "Academic progression monitoring and early attrition prevention represent paramount challenges in contemporary higher education institutions. Traditional institutional record-keeping approaches rely heavily on decentralized spreadsheets, static ledger sheets, and manual calculations conducted after end-semester examinations conclude. This post-facto evaluation model prevents academic deans, department heads, and faculty mentors from implementing timely remedial interventions for vulnerable students during the active academic term.",
    "This project presents the Academic Intelligence Platform, an enterprise-grade academic analytics dashboard, machine learning risk assessment engine, and conversational AI data studio engineered specifically for autonomous engineering institutions. The platform integrates four core architectural tiers: an automated Academic Record Ingestion and Normalization Pipeline, an XGBoost Failure Probability Classifier, a conversational AI Query Subsystem with resilient cloud failover, and an interactive 12-component dynamic visualization dashboard built using React 19 and Recharts.",
    "The data ingestion pipeline recursively traverses institutional multi-semester consolidated result workbooks across twenty undergraduate engineering departments (including Computer Science, Information Technology, AI & Data Science, Electronics and Communication, and Mechanical Engineering), ingesting over 7,200 student records. The machine learning risk prediction engine uses an XGBoost Classifier trained on continuous internal assessment marks, normalizing varying assessment scales (40, 50, and 60 marks) into unified percentage benchmarks to output calibrated failure probabilities categorized into Safe (<30%), Medium Risk (30-65%), and High Risk (>65%) cohorts.",
    "To deliver immediate, non-technical data exploration, the platform incorporates a natural-language conversational analytics engine powered by Groq Large Language Models. The engine integrates a multi-key pool failover mechanism and cascading model fallback (openai/gpt-oss-120b to gpt-oss-20b and qwen/qwen3.8-27b) alongside a local rule-based caching router that executes standard queries with zero token consumption. Comprehensive test evaluations confirm an inference latency below 15ms per student, high batch parsing efficiency, resilient failover recovery, and client-side vector (SVG), raster (PNG), and tabular (CSV) exports.",
]

TOC_ROWS = [
    ("CHAPTER NO.", "TITLE", "PAGE NO."),
    ("", "ACKNOWLEDGEMENT", "iii"),
    ("", "ABSTRACT", "iv"),
    ("", "TABLE OF CONTENT", "v"),
    ("", "LIST OF FIGURES", "vii"),
    ("", "LIST OF TABLES", "viii"),
    ("1", "INTRODUCTION", "1"),
    ("1.1", "Background of the Work", "2"),
    ("1.2", "Problem Statement", "4"),
    ("1.3", "Motivation and Scope of the Proposed Work", "5"),
    ("2", "LITERATURE SURVEY", "7"),
    ("2.1", "Educational Data Mining and Student Risk Modeling", "7"),
    ("2.2", "Machine Learning Classifiers for Academic Progression", "8"),
    ("2.3", "Natural Language Interfaces and LLMs for Institutional Analytics", "9"),
    ("2.4", "Modern Web Dashboards and Interactive Visualizations in Education", "10"),
    ("2.5", "Gap Identification and Problem Formulation", "11"),
    ("3", "OBJECTIVES AND METHODOLOGY", "13"),
    ("3.1", "Objectives of the Proposed Work", "13"),
    ("3.2", "System Architecture Overview", "14"),
    ("3.3", "Academic Data Ingestion & Normalization Pipeline", "16"),
    ("3.4", "Machine Learning Risk Prediction Engine", "19"),
    ("3.5", "Conversational AI Query Subsystem & Graph Specification Engine", "21"),
    ("3.6", "Dynamic Frontend Visual Analytics Subsystem", "24"),
    ("3.7", "Selection of Tools and Technologies", "25"),
    ("4", "PROPOSED WORK MODULES", "26"),
    ("4.1", "Ingestion & Academic Record Aggregator Module Implementation", "26"),
    ("4.2", "Machine Learning Risk Prediction Engine Implementation", "28"),
    ("4.3", "Conversational AI & Multi-Key Failover Engine Implementation", "30"),
    ("4.4", "Dynamic Visual Analytics & Dashboard Implementation", "33"),
    ("5", "RESULTS AND DISCUSSION", "35"),
    ("5.1", "System Functionality Results", "35"),
    ("5.2", "Significance, Strengths, and Limitations", "40"),
    ("5.3", "Cost-Benefit Analysis", "42"),
    ("6", "CONCLUSIONS AND FUTURE WORK", "44"),
    ("6.1", "Conclusion", "44"),
    ("6.2", "Suggestions for Future Work", "45"),
    ("", "REFERENCES", "47"),
    ("", "APPENDIX", "49")
]

LIST_OF_FIGURES_ROWS = [
    ("FIG. NO.", "FIGURE NAME", "PAGE NO."),
    ("3.1", "Academic Intelligence Platform System Architecture Overview", "15"),
    ("3.2", "End-to-End Conversational AI & Failover Execution Flow", "23"),
    ("4.1", "Department Performance Overview Dashboard", "31"),
    ("4.2", "Individual Student Academic Analytics & Progression View", "32"),
    ("4.3", "Conversational AI Analytics & Dynamic Query Interface", "34"),
    ("5.1", "Management HOD Analytics Portal Interface", "38"),
    ("5.2", "Academic Performance Analytics Hardware & Architecture Mockup", "39")
]

LIST_OF_TABLES_ROWS = [
    ("TABLE NO.", "TABLE NAME", "PAGE NO."),
    ("3.1", "Academic Result Data Sources & Schema Extracted by the Ingestion Pipeline", "17"),
    ("3.2", "Internal Assessment Scaling and Grade Normalization Mapping Rules", "18"),
    ("3.3", "XGBoost Feature Formulations and Risk Categorization Thresholds", "20"),
    ("3.4", "Summary of Tools and Technologies Used", "25"),
    ("4.1", "Academic Record Parsing Steps and Normalization Pipeline", "27"),
    ("4.2", "FastAPI Backend REST Endpoints — Request and Response Specifications", "29"),
    ("4.3", "Dynamic Chart Engine Feature Matrix — Visualizations, Axes & Export Options", "32"),
    ("5.1", "System Functionality Verification — Test Case Summary", "37"),
    ("5.2", "Cost-Benefit and Resource Utilization Summary", "43")
]
