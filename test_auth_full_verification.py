import os
import sys
import unittest
import time

# Ensure backend directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "student-analysis-dashboard", "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.chdir(BACKEND_DIR)

from fastapi.testclient import TestClient
from main import app
from auth_db import init_db, is_token_revoked

class TestUnifiedAuthenticationFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_public_health_endpoint(self):
        """Public health endpoint returns 200 without token."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_02_protected_endpoints_reject_unauthenticated(self):
        """Protected endpoints must return 401 Unauthorized when unauthenticated."""
        endpoints = [
            ("GET", "/api/dashboard/summary"),
            ("GET", "/api/departments"),
            ("GET", "/api/students"),
            ("POST", "/api/predict/single", {"student_id": "TEST1", "student_name": "Test", "internal_marks": [35, 40]}),
            ("POST", "/api/ai/query", {"question": "What is overall pass rate?"}),
            ("GET", "/api/ai/logs"),
            ("GET", "/api/report-builder/department"),
            ("GET", "/api/auth/me")
        ]
        for item in endpoints:
            method = item[0]
            url = item[1]
            payload = item[2] if len(item) > 2 else None
            
            if method == "GET":
                res = self.client.get(url)
            else:
                res = self.client.post(url, json=payload)
            self.assertEqual(res.status_code, 401, f"Expected 401 on unauthenticated {method} {url}, got {res.status_code}")

    def test_03_ordinary_user_registration_no_role_requirement(self):
        """Any user can register with Name, Email, Password - no approval or role selection needed."""
        unique_email = f"user_{int(time.time())}@bit.edu"
        res_reg = self.client.post("/api/auth/register", json={
            "email": unique_email,
            "full_name": "Dr. Standard Researcher",
            "department": "Artificial Intelligence & Data Science",
            "password": "Password@2026"
        })
        self.assertEqual(res_reg.status_code, 200)
        data = res_reg.json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], unique_email)

    def test_04_equal_access_to_all_features_for_registered_user(self):
        """Every registered user receives equal, full access to all application features."""
        unique_email = f"equal_access_{int(time.time())}@bit.edu"
        reg_res = self.client.post("/api/auth/register", json={
            "email": unique_email,
            "full_name": "Equal Access User",
            "department": "Computer Science & Engineering",
            "password": "Password@2026"
        })
        token = reg_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Profile
        res_me = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.json()["user"]["email"], unique_email)

        # 2. Executive Dashboard Summary
        res_summary = self.client.get("/api/dashboard/summary", headers=headers)
        self.assertEqual(res_summary.status_code, 200)
        self.assertIn("passPercentage", res_summary.json())

        # 3. 20 Departments Info
        res_depts = self.client.get("/api/departments", headers=headers)
        self.assertEqual(res_depts.status_code, 200)
        self.assertIn("departments", res_depts.json())

        # 4. Student Analytics Directory
        res_students = self.client.get("/api/students", headers=headers)
        self.assertEqual(res_students.status_code, 200)
        self.assertIsInstance(res_students.json(), list)

        # 5. ML Prediction Engine
        res_pred = self.client.post("/api/predict/single", headers=headers, json={
            "student_id": "7376221CS101",
            "student_name": "Test Student",
            "internal_marks": [38.0, 42.0, 35.0]
        })
        self.assertEqual(res_pred.status_code, 200)

        # 6. Report Builder
        res_report = self.client.get("/api/report-builder/department", headers=headers)
        self.assertEqual(res_report.status_code, 200)

        # 7. AI Query Logs
        res_logs = self.client.get("/api/ai/logs", headers=headers)
        self.assertEqual(res_logs.status_code, 200)

    def test_05_logout_and_session_revocation(self):
        """Logout immediately revokes active token; subsequent requests return 401."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "faculty@bit.edu",
            "password": "Faculty@1234"
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verify access before logout
        res_before = self.client.get("/api/departments", headers=headers)
        self.assertEqual(res_before.status_code, 200)

        # Execute logout
        res_logout = self.client.post("/api/auth/logout", headers=headers)
        self.assertEqual(res_logout.status_code, 200)

        # Verify token is recorded as revoked
        self.assertTrue(is_token_revoked(token))

        # Subsequent request with revoked token must be rejected with 401
        res_after = self.client.get("/api/departments", headers=headers)
        self.assertEqual(res_after.status_code, 401)

if __name__ == "__main__":
    unittest.main()
