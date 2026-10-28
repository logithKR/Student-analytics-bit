"""
Academic Intelligence Platform - Main Application Launcher
Runs backend server, automatically creates/verifies SQLite database,
and exposes the platform API on port 8000.
"""
import sys
import os
import importlib.util

# Add backend directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "student-analysis-dashboard", "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Switch working directory to backend so relative data and model paths resolve correctly
os.chdir(BACKEND_DIR)

from auth_db import init_db

# Auto-create/verify SQLite database on import or execution
init_db()

# Dynamically load the FastAPI app from backend/main.py
spec = importlib.util.spec_from_file_location("backend_main", os.path.join(BACKEND_DIR, "main.py"))
backend_main = importlib.util.module_from_spec(spec)
sys.modules["backend_main"] = backend_main
spec.loader.exec_module(backend_main)
app = backend_main.app

def run_server():
    print("=" * 65)
    print("  ACADEMIC INTELLIGENCE PLATFORM (BIT)")
    print("  Student Analytics & XGBoost AI Failure Risk Engine")
    print("=" * 65)
    print("\n[+] SQLite Database auto-verified & ready at users.db")
    print("[+] Launching FastAPI Backend Server...")
    print("  -> API Server:     http://localhost:8000")
    print("  -> OpenAPI Docs:   http://localhost:8000/docs")
    print("  -> Frontend App:   http://localhost:5173")
    print("=" * 65 + "\n")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    run_server()
