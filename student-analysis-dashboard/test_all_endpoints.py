import urllib.request
import urllib.parse
import json
import os
import sys

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

print(f"Testing API Endpoints at: {BASE_URL}")

# 1. Health check
print("\n--- Testing /api/health ---")
try:
    res = json.loads(urllib.request.urlopen(f"{BASE_URL}/health", timeout=5).read())
    print("Health Status:", res)
except Exception as e:
    print("Health check failed (ensure server is running via `python app.py` or `uvicorn main:app`):", e)
    sys.exit(1)

# 2. Predict Single
print("\n--- Testing /api/predict/single ---")
try:
    payload = json.dumps({
        "student_id": "7376221CS101",
        "student_name": "John Doe",
        "subjects": [
            {"name": "Data Structures", "mark": 35.0, "max_score": 50.0},
            {"name": "Computer Architecture", "mark": 42.0, "max_score": 50.0},
            {"name": "Discrete Math", "mark": 18.0, "max_score": 50.0}
        ]
    }).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/predict/single", data=payload, headers={"Content-Type": "application/json"})
    res = json.loads(urllib.request.urlopen(req, timeout=5).read())
    print("Single Prediction Result:", res)
except Exception as e:
    print("Single prediction failed:", e)

# 3. Existing Dashboard Endpoints
print("\n--- Testing Existing Dashboard Endpoints ---")
endpoints = [
    'departments',
    'dashboard/summary',
    'dashboard/top-performers',
    'dashboard/class-division',
    'dashboard/grade-distribution',
    'dashboard/batch-comparison',
    'dashboard/at-risk',
    'dashboard/semester-trends',
    'dashboard/subject-analytics',
    'students'
]

for e in endpoints:
    try:
        data = json.loads(urllib.request.urlopen(f"{BASE_URL}/{e}", timeout=5).read())
        preview = str(data)[:80]
        print(f"OK {e}: {preview}")
    except Exception as ex:
        print(f"FAIL {e}: {ex}")

# 4. AI Dynamic Analytics Endpoints
print("\n--- Testing AI Dynamic Analytics Endpoints ---")
try:
    schema = json.loads(urllib.request.urlopen(f"{BASE_URL}/ai/schema", timeout=5).read())
    print("OK ai/schema:", list(schema.keys()))
except Exception as ex:
    print("FAIL ai/schema:", ex)

try:
    ai_payload = json.dumps({"question": "Show average GPA by department"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/ai/query", data=ai_payload, headers={"Content-Type": "application/json"})
    ai_res = json.loads(urllib.request.urlopen(req, timeout=10).read())
    print(f"OK ai/query: Status={ai_res.get('status')} Chart={ai_res.get('visualization', {}).get('type')} Rows={len(ai_res.get('data', []))}")
except Exception as ex:
    print("FAIL ai/query:", ex)

print("\nEndpoint verification complete!")
