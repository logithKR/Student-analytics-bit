# Chapter III & IV detailed text and tables specification

CHAPTER_3_TITLE = "OBJECTIVES AND METHODOLOGY"
CHAPTER_3_SECTIONS = [
    {
        "heading": "3.1 Objectives of the Proposed Work",
        "paragraphs": [
            "The primary objective of this project is to architect, develop, and validate an end-to-end Academic Intelligence Platform that synthesizes multi-department institutional performance records, performs real-time student failure risk classification using machine learning, and provides resilient conversational analytics with dynamic visualization. The specific measurable objectives are:",
            "1. Develop an automated, multi-tiered data ingestion pipeline capable of traversing departmental directories, parsing consolidated semester result workbooks across twenty engineering departments, and harmonizing disparate continuous assessment scales into a unified, in-memory analytics repository.",
            "2. Engineer and deploy a high-performance machine learning risk prediction engine using an XGBoost Classifier, utilizing feature extraction (average internal percentage, minimum subject score, count of failing subjects) to predict calibrated failure probabilities with sub-15ms inference latency.",
            "3. Architect a resilient conversational AI query planner powered by Groq Large Language Models, featuring a zero-token local intent caching router, an automated multi-key pool failover mechanism, and cascading fallback models to ensure zero service disruption under cloud API rate limits.",
            "4. Construct a responsive, single-page executive analytics dashboard in React 19 and Vite 8, featuring twelve interactive Recharts visualization components with client-side PNG, SVG, and CSV export capabilities."
        ]
    },
    {
        "heading": "3.2 System Architecture Overview",
        "paragraphs": [
            "The Academic Intelligence Platform follows a decoupled, three-tier service-oriented architecture designed for horizontal scalability, high throughput, and strict separation of concerns. Figure 3.1 illustrates the structural composition of the system.",
            "The Presentation Tier comprises a modern React 19 single-page application bundled with Vite 8. It houses the Executive Dashboard, AI Prediction Hub, Student Directory, and Conversational Visualization Studio. It interfaces with the backend exclusively via asynchronous RESTful HTTP endpoints, rendering dynamic visualizations using Recharts and handling client-side export generation.",
            "The Application Tier is powered by a high-performance FastAPI asynchronous server running on Python 3.12 and Uvicorn. This tier encapsulates four core services: (1) the Data Aggregation Service (data_service.py); (2) the Machine Learning Risk Engine (model_service.py); (3) the Conversational AI Engine (ai_service.py); and (4) the Audit Logger Service (logger_service.py).",
            "The Storage & Cloud AI Tier includes the local departmental spreadsheet repository (*-CONS-WO.xlsx), serialized machine learning artifacts (.joblib), runtime query audit logs (ai_query_logs.json), and external cloud inference pools hosted on Groq."
        ]
    },
    {
        "heading": "3.3 Academic Data Ingestion & Normalization Pipeline",
        "paragraphs": [
            "Institutional academic data is generated across twenty undergraduate departments following different curriculum regulations. The data ingestion service dynamically discovers and loads these workbooks from the hierarchical directory structure: backend/data/UG/<DEPARTMENT>/<SEMESTER>/<DEPT>-CONS-WO.xlsx.",
            "Because each department operates with distinct course codes, varying numbers of theory and laboratory subjects, and different assessment rubrics, the ingestion pipeline implements dynamic header detection. It scans initial rows for the student registration number header, extracts student register numbers, names, subject codes, continuous internal assessment (CIA) marks, end-semester exam marks, total marks, letter grades, and semester GPA. Table 3.1 outlines the primary academic result schema extracted across all departments."
        ]
    }
]

TABLE_3_1 = {
    "caption": "Table 3.1: Academic Result Data Sources & Schema Extracted by the Ingestion Pipeline",
    "headers": ["Entity / Field", "Source Spreadsheet Column", "Normalized Target Type", "Analytical Purpose"],
    "rows": [
        ["Register Number", "REG NO / ROLL NO", "String (Unique ID)", "Primary student identification across semesters"],
        ["Student Name", "STUDENT NAME", "String (Title Case)", "Directory search and individual profile view"],
        ["Department Code", "Directory Path / Header", "String (CS, IT, AD, etc.)", "Cohort grouping and departmental benchmarking"],
        ["Semester", "Subfolder (I, III, V, VII)", "String (Roman Numeral)", "Curricular stage and longitudinal progression tracking"],
        ["Course Code", "Sub-header (e.g., CS3501)", "String (Alphanumeric)", "Subject-level failure and difficulty analysis"],
        ["Internal Marks", "CIA / INT (out of 40/50/60)", "Float (Normalized 0-100%)", "Primary feature input for XGBoost failure model"],
        ["Total Marks", "TOT / FINAL (out of 100)", "Float (0.0 to 100.0)", "Course performance and GPA calculation"],
        ["Grade", "GRD / GRADE", "Categorical (O, A+, A, B+, B, C, U)", "Letter grade distribution and arrears detection"],
        ["Semester GPA", "SGPA / GPA", "Float (0.00 to 10.00)", "Academic standing and distinction classification"],
        ["Result Status", "RES / RESULT", "Categorical (PASS / FAIL)", "Ground truth label for student risk evaluation"]
    ]
}

CHAPTER_3_SECTIONS_CONT = [
    {
        "heading": "3.3.1 Data Normalization and Grade Conversion Rules",
        "paragraphs": [
            "A critical engineering requirement of the ingestion pipeline is normalizing continuous internal assessment marks recorded under varying maximum score limits. If Course A is scored out of 50 marks and Course B out of 60 marks, raw marks cannot be directly evaluated by the machine learning classifier. The ingestion engine computes normalized percentage values using: S_norm = S_raw * (100.0 / Max_Marks).",
            "Furthermore, letter grades are mapped to standard ten-point scale grade points following university academic regulations. Table 3.2 details the official mapping schema."
        ]
    }
]

TABLE_3_2 = {
    "caption": "Table 3.2: Internal Assessment Scaling and Grade Normalization Mapping Rules",
    "headers": ["Letter Grade", "Grade Point Value", "Academic Performance Level", "Semester Result Status"],
    "rows": [
        ["O", "10", "Outstanding (90% - 100%)", "PASS"],
        ["A+", "9", "Excellent (80% - 89%)", "PASS"],
        ["A", "8", "Very Good (70% - 79%)", "PASS"],
        ["B+", "7", "Good (60% - 69%)", "PASS"],
        ["B", "6", "Above Average (50% - 59%)", "PASS"],
        ["C", "5", "Average (45% - 49%)", "PASS"],
        ["U / RA", "0", "Re-Appearance / Arrear (<45%)", "FAIL"],
        ["AB", "0", "Absent from Examination", "FAIL"],
        ["W", "0", "Withdrawn from Course", "WITHDRAWN"]
    ]
}

CHAPTER_3_SECTIONS_CONT2 = [
    {
        "heading": "3.4 Machine Learning Risk Prediction Engine",
        "paragraphs": [
            "The predictive failure risk modeling problem is formulated as a supervised binary classification task with calibrated probability estimation. Given a student feature vector X representing normalized continuous internal assessment marks across all enrolled courses in the active semester, the goal is to predict the probability P(Fail | X) that the student will incur at least one course failure.",
            "The model utilizes an optimized XGBoost Classifier (XGBClassifier) trained with the objective 'binary:logistic'. Tree-based gradient boosting was selected due to its superior handling of non-linear feature interactions, resilience against multicollinearity among related engineering subjects, and deterministic feature importance ranking. The feature set comprises three composite indicators engineered to capture both holistic academic competence and course-specific vulnerabilities:",
            "1. Avg_Internal_Pct: The arithmetic mean of all normalized internal assessment percentages across the student's enrolled courses.",
            "2. Min_Internal_Pct: The lowest normalized percentage achieved by the student in any single enrolled course, capturing localized subject failure risk.",
            "3. Low_Internal_Count: The total count of enrolled courses in which the student's normalized score falls below 50%, capturing multi-course vulnerability.",
            "Table 3.3 details the feature formulations and the calibrated risk categorization bands."
        ]
    }
]

TABLE_3_3 = {
    "caption": "Table 3.3: XGBoost Feature Formulations and Risk Categorization Thresholds",
    "headers": ["Risk Category", "Probability Range P(Fail)", "Pedagogical Meaning", "Faculty Advisory Action"],
    "rows": [
        ["SAFE (PASS)", "0.0% to 29.9%", "Strong academic standing across all subjects", "Maintain regular schedule; encourage peer tutoring participation"],
        ["MEDIUM RISK", "30.0% to 64.9%", "Borderline marks in one or more core subjects", "Mandatory faculty mentoring and targeted assignment review"],
        ["HIGH RISK (FAIL)", "65.0% to 100.0%", "Critical vulnerability; multiple subject failures likely", "Immediate HOD intervention, remedial classes, and parent conference"]
    ]
}

CHAPTER_3_SECTIONS_CONT3 = [
    {
        "heading": "3.5 Conversational AI Query Subsystem & Graph Specification Engine",
        "paragraphs": [
            "The conversational analytics subsystem (ai_service.py) enables non-technical academic stakeholders to interrogate complex institutional records using natural language. The architecture is illustrated in Figure 3.2.",
            "To eliminate cloud API latency and conserve token quotas for standard institutional inquiries, queries are first evaluated by a local Rule-Based Intent Classifier. If the user request matches common analytical patterns (such as requesting the top performers, overall grade distribution, class division, or department pass percentages), the local query planner generates structured results and visualization specifications instantly with zero token consumption and sub-10ms response times.",
            "For complex or ad-hoc queries, the request is dispatched to Groq's high-speed inference engine using a multi-turn planner prompt. The LLM is constrained to output a structured JSON response containing: (1) intent classification; (2) queryPlan detailing entity, filters, groupings, aggregations, and row limits; and (3) graphSpecification defining visualization type, axis bindings, and series.",
            "To safeguard against cloud API rate limiting (HTTP 429), the service implements an automated Multi-Key Pool Failover mechanism that dynamically rotates across configured primary, secondary, and tertiary keys. If all keys exhaust their token quotas on the primary model (openai/gpt-oss-120b), queries automatically cascade to secondary fallback models (openai/gpt-oss-20b and qwen/qwen3.8-27b). The returned specification is then validated and repaired against active dataset columns via validate_and_repair_specification() before rendering."
        ]
    },
    {
        "heading": "3.6 Dynamic Frontend Visual Analytics Subsystem",
        "paragraphs": [
            "The frontend visualization layer is engineered as a modular, reusable charting suite built with React 19 and Recharts. The architecture features twelve dedicated visualization components (Vertical Bar, Horizontal Bar, Grouped Bar, Stacked Bar, Line, Area, Pie, Donut, Radar, and Scatter).",
            "Each chart is encased in a unified ChartContainer providing responsive viewport handling, a ChartHeader with real-time metadata badges, an interactive ChartToolbar enabling dynamic chart-type toggling, custom tooltips with currency and percentage formatting, and an integrated export engine supporting one-click raster PNG, vector SVG, and CSV dataset downloads."
        ]
    },
    {
        "heading": "3.7 Selection of Tools and Technologies",
        "paragraphs": [
            "The selection of software components and libraries was guided by performance, cross-platform compatibility, and zero-licensing cost. Table 3.4 summarizes the technological stack."
        ]
    }
]

TABLE_3_4 = {
    "caption": "Table 3.4: Summary of Tools and Technologies Used",
    "headers": ["Component Layer", "Technology / Framework", "Version", "Technical Justification"],
    "rows": [
        ["Backend REST Framework", "FastAPI (Python)", "0.110+", "High-performance async server with automatic OpenAPI schema validation"],
        ["ASGI Web Server", "Uvicorn", "0.29+", "Lightweight, ultra-fast asynchronous server gateway interface"],
        ["Machine Learning Engine", "XGBoost", "2.0+", "State-of-the-art regularized gradient boosting with calibrated probabilities"],
        ["ML Pipeline & Utilities", "Scikit-learn & Joblib", "1.4+", "Model serialization, cross-validation, and metrics evaluation"],
        ["Tabular Data Processing", "Pandas & OpenPyXL", "2.2+", "Fast in-memory filtering, multi-sheet Excel ingestion, and aggregations"],
        ["Conversational AI Engine", "Groq Python SDK", "0.9+", "Ultra-fast cloud LPUs delivering sub-500ms LLM inference"],
        ["Frontend UI Framework", "React", "19.0", "Declarative, component-driven reactive interface architecture"],
        ["Web Application Bundler", "Vite", "8.2", "Ultra-fast Hot Module Replacement and optimized production bundling"],
        ["Charting & Visualization", "Recharts", "2.12+", "Composable SVG charting components built specifically for React"],
        ["Client-Side Export", "HTML2Canvas & FileSaver", "Latest", "High-resolution raster PNG, SVG, and CSV dataset serialization"]
    ]
}

CHAPTER_4_TITLE = "PROPOSED WORK MODULES"
CHAPTER_4_SECTIONS = [
    {
        "heading": "4.1 Ingestion & Academic Record Aggregator Module Implementation",
        "paragraphs": [
            "The data ingestion subsystem is implemented in data_service.py. It coordinates file system discovery, spreadsheet parsing, and in-memory analytics caching across all department datasets.",
            "Upon application startup, get_dataset_path() locates the root academic data repository (backend/data/UG). If the repository is empty, create_sample_dataset_if_empty() generates realistic seed Excel workbooks adhering to university grade scales, guaranteeing that all application features function immediately on any clean installation.",
            "The load_data() function traverses all department subfolders, identifies semester directories (I, III, V, VII), and reads consolidated spreadsheets (*-CONS-WO.xlsx). Table 4.1 outlines the multi-stage parsing and normalization pipeline."
        ]
    }
]

TABLE_4_1 = {
    "caption": "Table 4.1: Academic Record Parsing Steps and Normalization Pipeline",
    "headers": ["Pipeline Stage", "Primary Method / Module", "Input Source", "Output Artifact / Transformation"],
    "rows": [
        ["Directory Discovery", "get_dataset_path()", "File System Path / .env", "Resolved path to multi-department root directory"],
        ["Workbook Traversal", "os.walk() & glob", "backend/data/UG/<DEPT>/<SEM>", "Identified list of 61 consolidated result workbooks"],
        ["Header Resolution", "pd.read_excel(header=None)", "Raw Excel Sheet Matrix", "Dynamic index identifying registration number row"],
        ["Student Extraction", "parse_student_row()", "Row cells (Reg, Name, Marks)", "Standardized dictionary of student credentials and grades"],
        ["Score Normalization", "data_service.py", "CIA Marks (out of 40/50/60)", "Unified 0-100% scaled assessment percentages"],
        ["Global Aggregation", "load_data()", "Individual department records", "In-memory list of 7,293 unified student record dictionaries"]
    ]
}

CHAPTER_4_SECTIONS_CONT = [
    {
        "heading": "4.2 Machine Learning Risk Prediction Engine Implementation",
        "paragraphs": [
            "The machine learning risk service is implemented in model_service.py. It manages XGBoost model loading, feature scaling, real-time single-student inference, and batch spreadsheet processing.",
            "The service loads the serialized model (xgboost_probability_model.joblib) and feature registry (prob_features.joblib) into memory during module initialization. In predict_single_student(), continuous internal assessment marks submitted for a student across all enrolled subjects are parsed, normalized to 100% scale, and transformed into the three-dimensional feature vector [Avg_Internal_Pct, Min_Internal_Pct, Low_Internal_Count].",
            "The predict_proba() method generates the failure probability vector. The predicted failure probability is evaluated against institutional risk bands (Safe, Medium Risk, High Risk), generating customized faculty recommendations and a list of specific at-risk subjects.",
            "For batch processing, parse_and_predict_excel() accepts multipart file uploads, dynamically identifies student rows and assessment columns, calculates cohort failure distributions, and returns comprehensive cohort risk summaries within seconds."
        ]
    },
    {
        "heading": "4.3 Conversational AI & Multi-Key Failover Engine Implementation",
        "paragraphs": [
            "The natural language query engine is implemented in ai_service.py and logger_service.py. It handles conversational query understanding, schema linking, resilient LLM invocation, and audit tracking.",
            "The module discovers all configured API credentials from environment variables across GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3, and comma-separated GROQ_API_KEYS. When a query is processed, execute_query_plan() first evaluates local rule filters. If an external Groq LLM call is required, groq_query_planner() iterates through the credential pool. Upon encountering HTTP 429 (Rate Limit Exceeded) or HTTP 401 (Authentication Failure), the engine logs the failover event, masks credential characters for security, and rotates to the next key without failing the request.",
            "All interactions are logged in logger_service.py, capturing execution latency, model used, key index, data row count, and query debug trees. Table 4.2 documents the primary REST endpoints exposed by the backend."
        ]
    }
]

TABLE_4_2 = {
    "caption": "Table 4.2: FastAPI Backend REST Endpoints — Request and Response Specifications",
    "headers": ["HTTP Method", "Endpoint URI", "Request Payload / Query Params", "Response Data & Status Code"],
    "rows": [
        ["GET", "/api/summary", "?department=CS&semester=V", "200 OK — Overall pass rate, average SGPA, total students, at-risk count"],
        ["GET", "/api/students", "?page=1&limit=25&dept=IT&search=John", "200 OK — Paginated student records with search filtering and GPA"],
        ["GET", "/api/students/{reg_no}", "Path parameter: register_number", "200 OK — Comprehensive student history and course mark breakdown"],
        ["POST", "/api/predict/single", "JSON: { student_id, assessments: [...] }", "200 OK — Pass/fail probability, risk category, and faculty recommendations"],
        ["POST", "/api/predict/bulk", "Multipart Form Data: .xlsx file", "200 OK — Batch student predictions and cohort risk summary statistics"],
        ["POST", "/api/ai/query", "JSON: { question, history, mode }", "200 OK — Natural language answer, data rows, and graphSpecification"],
        ["GET", "/api/ai/logs", "?limit=50&status=all", "200 OK — Paginated query audit logs, model metrics, and failover history"],
        ["GET", "/api/model/status", "None", "200 OK — Model operational state, booster version, and feature registry"]
    ]
}

CHAPTER_4_SECTIONS_CONT2 = [
    {
        "heading": "4.4 Dynamic Visual Analytics & Dashboard Implementation",
        "paragraphs": [
            "The frontend presentation layer is developed with React 19 and Recharts. The application architecture is structured into dedicated modular pages: Dashboard.jsx (Executive overview), PredictionHub.jsx (ML Risk Predictor), StudentsList.jsx (Directory), StudentDetail.jsx (Student profile), AIAnalytics.jsx (Conversational studio), and AILogs.jsx (Audit log viewer).",
            "The DynamicChartRenderer.jsx component acts as a central dispatcher, accepting any valid graphSpecification JSON and rendering the optimal visualization with responsive containers and formatted axes. Table 4.3 outlines the dynamic charting feature matrix.",
            "Figure 4.1 showcases the Department Performance Overview Dashboard. Figure 4.2 illustrates the Individual Student Academic Analytics view. Figure 4.3 displays the Conversational AI Analytics interface."
        ]
    }
]

TABLE_4_3 = {
    "caption": "Table 4.3: Dynamic Chart Engine Feature Matrix — Visualizations, Axes & Export Options",
    "headers": ["Chart Type", "Component File", "Typical Metric Use Case", "Supported Export Formats"],
    "rows": [
        ["Vertical Bar", "BarChartComponent.jsx", "Department pass percentage comparison", "PNG, SVG, CSV"],
        ["Horizontal Bar", "HorizontalBarChartComponent.jsx", "Ranked student GPAs and subject marks", "PNG, SVG, CSV"],
        ["Grouped Bar", "BarChartComponent.jsx", "Side-by-side Pass vs. Fail count comparison", "PNG, SVG, CSV"],
        ["Stacked Bar", "StackedBarChartComponent.jsx", "Grade distribution tiers across batches", "PNG, SVG, CSV"],
        ["Line Chart", "LineChartComponent.jsx", "Progression trends across semesters", "PNG, SVG, CSV"],
        ["Area Chart", "AreaChartComponent.jsx", "Cumulative GPA trajectories over time", "PNG, SVG, CSV"],
        ["Donut / Pie", "PieChartComponent.jsx", "Performance categories and class divisions", "PNG, SVG, CSV"],
        ["Radar Chart", "RadarChartComponent.jsx", "Multi-course difficulty benchmarking", "PNG, SVG, CSV"],
        ["Scatter Plot", "ScatterChartComponent.jsx", "Correlation between internal marks and SGPA", "PNG, SVG, CSV"]
    ]
}
