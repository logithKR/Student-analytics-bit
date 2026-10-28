import sys
import os
import sqlite3
import time

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("=== 1. Testing SQLite Database ===")
db_path = os.path.join(os.path.dirname(__file__), 'backend', 'users.db')
assert os.path.exists(db_path), f"users.db does not exist at {db_path}!"

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print("Tables in SQLite:", tables)
assert 'users' in tables, "users table missing"
assert 'auth_audit' in tables, "auth_audit table missing"

c.execute("SELECT email, full_name, role FROM users")
users = c.fetchall()
print(f"Total registered users in SQLite: {len(users)}")
for u in users:
    print(f" - {u[0]} ({u[1]} | {u[2]})")
conn.close()

print("\n=== 2. Testing Auth Endpoints ===")
# Test valid login
res = client.post("/api/auth/login", json={"email": "admin@bit.edu", "password": "Admin@1234"})
assert res.status_code == 200, f"Login failed: {res.text}"
data = res.json()
token = data["token"]
print("Login successful! User:", data["user"]["full_name"])

# Test me endpoint with token
res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
assert res_me.status_code == 200, f"Auth me failed: {res_me.text}"
print("Profile retrieved:", res_me.json()["user"]["email"], "| Role:", res_me.json()["user"]["role"])

# Test invalid login
res_bad = client.post("/api/auth/login", json={"email": "admin@bit.edu", "password": "WrongPassword!"})
assert res_bad.status_code == 401, "Should fail with 401"
print("Invalid password correctly rejected with 401")

# Test registration
test_email = f"new_hod_{int(time.time())}@bit.edu"
res_reg = client.post("/api/auth/register", json={
    "full_name": "Dr. Test HOD",
    "email": test_email,
    "department": "Mechanical Engineering",
    "role": "Head of Department (HOD)",
    "password": "SecurePassword@2026"
})
assert res_reg.status_code == 200, f"Register failed: {res_reg.text}"
print("Registered new user in SQLite:", res_reg.json()["user"]["email"])

# Test duplicate registration
res_dup = client.post("/api/auth/register", json={
    "full_name": "Dr. Duplicate",
    "email": test_email,
    "department": "Mechanical Engineering",
    "role": "Head of Department (HOD)",
    "password": "SecurePassword@2026"
})
assert res_dup.status_code == 400, "Duplicate email should fail with 400"
print("Duplicate email correctly rejected with 400")

print("\n=== 3. Testing Core Academic API Endpoints ===")
res_health = client.get("/api/health")
assert res_health.status_code == 200, "Health check failed"
print("API Health:", res_health.json()["status"], "| Loaded Students:", res_health.json()["loaded_students_count"])

res_depts = client.get("/api/departments")
assert res_depts.status_code == 200
print("Departments count:", len(res_depts.json()["departments"]))

res_summary = client.get("/api/dashboard/summary")
assert res_summary.status_code == 200
print("Dashboard summary pass rate:", res_summary.json()["passPercentage"])

print("\n[SUCCESS] ALL INTEGRATION TESTS PASSED 100%!")
