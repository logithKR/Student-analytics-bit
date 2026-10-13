import urllib.request
import json
import os
import sys

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

endpoints = [
    'health',
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

print(f"Testing endpoints against {BASE_URL}...")
for e in endpoints:
    try:
        data = json.loads(urllib.request.urlopen(f"{BASE_URL}/{e}", timeout=5).read())
        preview = str(data)[:100]
        print(f"OK {e}: {preview}")
    except Exception as ex:
        print(f"FAIL {e}: {ex}")
