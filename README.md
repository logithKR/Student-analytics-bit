# Academic Intelligence Platform - Student Analytics & AI Risk Engine

An end-to-end academic intelligence dashboard and machine learning risk prediction engine designed for engineering colleges. The platform analyzes student academic progression, visualizes department performance metrics, and uses an XGBoost Classifier to predict student failure probabilities based on internal assessment marks.

---

## 🚀 Key Features

- **Department Analytics Dashboard:** High-level KPIs, SGPA trends, grade distributions, class division breakdown (Distinction, First Class, etc.), and radar charts for course difficulty.
- **AI Prediction Hub:**
  - **Single Student Predictor:** Real-time pass/fail probability calculation, risk categorization (`SAFE`, `MEDIUM RISK`, `HIGH RISK (FAIL)`), and actionable faculty recommendations.
  - **Bulk Batch Upload:** Parse semester result spreadsheets (`.xlsx`/`.xls`) with dynamic column benchmark scaling (40, 50, 60 scale), auto-detecting at-risk courses and generating cohort reports.
- **Student Directory:** Searchable, filterable, and paginated directory across departments (CSE, IT) and semesters.
- **Student Profile View:** Individual academic history, SGPA progression area charts, and subject breakdown.

---

## 🛠️ Technology Stack

- **Backend:** FastAPI, Uvicorn, Python 3.10+
- **Machine Learning & Analytics:** XGBoost, Scikit-learn, Pandas, Openpyxl, Joblib
- **Frontend:** React 19, Vite 8, React Router v7, Recharts, Lucide React
- **Configuration:** Python-dotenv, Cross-platform relative path resolution

---

## 📋 Prerequisites

- **Python:** 3.10, 3.11, or 3.12
- **Node.js:** 18.0 or higher (v20+ recommended)
- **Package Managers:** `pip` and `npm`

---

## ⚙️ Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Ramesh-Sakthivel-18/Student-analytics-bit.git
cd Student-analytics-bit
```

### 2. Backend Setup & Startup

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Navigate to backend directory and start the server:
```bash
cd student-analysis-dashboard/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> The API server will be available at `http://localhost:8000`.  
> Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

*(Optional)* Configure `.env`:
Copy `.env.example` to `.env` if you wish to customize port, dataset paths, or CORS origins:
```bash
cp .env.example .env
```

### 3. Frontend Setup & Startup

Open a new terminal window:
```bash
cd student-analysis-dashboard/frontend
npm install
npm run dev
```
> The dashboard web application will start at `http://localhost:5173`.

---

## 🧪 Testing & Verification

The repository includes verification suites that run out-of-the-box without hardcoded dependencies:

### Test Model Service & Inference
```bash
python student-analysis-dashboard/backend/test_model_service.py
```

### Test Batch Spreadsheet Parser
```bash
python student-analysis-dashboard/backend/test_bulk_excel.py
```

### Verify End-to-End API Endpoints
Ensure the backend server is running, then run:
```bash
python student-analysis-dashboard/test_all_endpoints.py
```

### Run Offline Testing Scripts
```bash
python testing/test.py
python testing/test_new_1.py
```

---

## 📂 Project Architecture

```
Student-analytics-bit/
├── README.md                               # Project documentation & setup instructions
├── requirements.txt                        # Global Python requirements
├── testing/                                # Standalone test scripts & model validations
│   ├── test.py
│   ├── test_new.py
│   └── test_new_1.py
├── training/                               # ML model training pipelines
│   ├── train_new.py                        # Current production model trainer
│   └── model/new/                          # Model & feature artifacts (.joblib)
└── student-analysis-dashboard/
    ├── backend/                            # FastAPI REST API service
    │   ├── main.py                         # API endpoints and middleware
    │   ├── data_service.py                 # Academic data aggregation & seed loader
    │   ├── model_service.py                # XGBoost inference & Excel parser
    │   ├── requirements.txt                # Backend dependencies
    │   ├── .env.example                    # Sample environment variables
    │   └── data/UG/                        # Semester result spreadsheets (.xlsx)
    └── frontend/                           # React 19 + Vite dashboard
        ├── src/
        │   ├── App.jsx                     # Route definitions & topbar
        │   ├── components/Sidebar.jsx      # Navigation sidebar
        │   ├── pages/Dashboard.jsx         # Executive overview & charts
        │   ├── pages/PredictionHub.jsx     # AI Risk Engine (Single & Bulk)
        │   ├── pages/StudentsList.jsx      # Directory & pagination
        │   └── pages/StudentDetail.jsx     # Individual student analysis
        └── vite.config.js                  # Bundler & proxy configuration
```
