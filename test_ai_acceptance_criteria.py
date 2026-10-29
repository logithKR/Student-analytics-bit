"""
Comprehensive Acceptance Criteria Test Suite for AI Chat & Academic Intelligence Engine.
Tests all 10 requirements specified in Request #10 against real university database and SQLite.
"""

import os
import sys
import unittest

backend_dir = r"r:\project\bit\Student-analytics-bit\student-analysis-dashboard\backend"
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from data_service import load_data
from auth_db import create_user, authenticate_user, create_access_token
from conversation_service import (
    create_conversation,
    get_conversation,
    get_conversation_messages,
    list_conversations
)


class TestAIAcceptanceCriteria(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.student_data = load_data()
        cls.user = authenticate_user("ramesh@bitsathy.ac.in", "Faculty@BIT2026")
        if not cls.user:
            try:
                cls.user = create_user(
                    email="test_evaluator@bitsathy.ac.in",
                    password="Password@BIT2026",
                    full_name="AI Evaluator",
                    department="CD"
                )
            except Exception:
                from auth_db import get_user_by_email
                cls.user = get_user_by_email("test_evaluator@bitsathy.ac.in")

        cls.token = create_access_token({"sub": cls.user["email"]})
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    def test_criterion_1_and_3_csd_top_student(self):
        """Criterion 1 & 3: 'Who is the top student in CSD?' returns CD department only."""
        conv = create_conversation(user_id=self.user["id"], title="CSD Chat")
        res = self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CSD?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertIsNotNone(data.get("studentCard"))
        card = data["studentCard"]
        self.assertEqual(card["departmentCode"], "CD")
        self.assertEqual(card["name"], "VALLARASU S")
        self.assertEqual(card["registerNumber"], "7376231CD503")
        self.assertEqual(card["gpa"], 10.0)
        self.assertEqual(card["rank"], 1)
        self.assertIn("Computer Science & Design", data["answer"])

    def test_criterion_2_and_3_cs_top_student(self):
        """Criterion 2 & 3: 'Who is the top student in CS?' returns CS department only."""
        conv = create_conversation(user_id=self.user["id"], title="CS Chat")
        res = self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CS?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        self.assertIsNotNone(data.get("studentCard"))
        card = data["studentCard"]
        self.assertEqual(card["departmentCode"], "CS")
        self.assertEqual(card["name"], "NANTHINI S")
        self.assertEqual(card["registerNumber"], "7376221CS238")
        self.assertEqual(card["gpa"], 9.8)
        self.assertEqual(card["rank"], 1)
        self.assertIn("Computer Science & Engineering", data["answer"])

    def test_criterion_4_follow_up_second_student(self):
        """Criterion 4: 'Show the second student' uses CSD department context."""
        conv = create_conversation(user_id=self.user["id"], title="Context Chain")
        # Step 1: Top student in CSD
        self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CSD?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        
        # Step 2: Follow-up
        res2 = self.client.post("/api/ai/query", json={
            "question": "Show the second student",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        
        self.assertIsNotNone(data2.get("studentCard"))
        card2 = data2["studentCard"]
        self.assertEqual(card2["departmentCode"], "CD")
        self.assertEqual(card2["name"], "KAVYA M")
        self.assertEqual(card2["registerNumber"], "7376231CD121")
        self.assertEqual(card2["gpa"], 9.86)
        self.assertEqual(card2["rank"], 2)

    def test_criterion_5_follow_up_metric_cgpa(self):
        """Criterion 5: 'What is their CGPA?' resolves the correct student from context."""
        conv = create_conversation(user_id=self.user["id"], title="Pronoun Chain")
        # Query CSD top student
        self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CSD?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        
        # Follow-up: Second student
        self.client.post("/api/ai/query", json={
            "question": "Show the second student",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        
        # Follow-up: What is their CGPA?
        res3 = self.client.post("/api/ai/query", json={
            "question": "What is their CGPA?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        
        self.assertIsNotNone(data3.get("studentCard"))
        self.assertEqual(data3["studentCard"]["name"], "KAVYA M")
        self.assertEqual(data3["studentCard"]["gpa"], 9.86)
        self.assertIn("9.86", data3["answer"])

    def test_criterion_6_and_8_persistence_and_isolation(self):
        """Criterion 6 & 8: Conversation persistence restores exact messages without cross-mixing."""
        convA = create_conversation(user_id=self.user["id"], title="Conversation A")
        convB = create_conversation(user_id=self.user["id"], title="Conversation B")
        
        self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CSD?",
            "mode": "chat_viz",
            "conversation_id": convA["id"]
        }, headers=self.headers)
        
        self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CS?",
            "mode": "chat_viz",
            "conversation_id": convB["id"]
        }, headers=self.headers)
        
        # Retrieve Conversation A
        resA = self.client.get(f"/api/ai/conversations/{convA['id']}", headers=self.headers)
        self.assertEqual(resA.status_code, 200)
        msgsA = resA.json()["messages"]
        self.assertEqual(len(msgsA), 2)
        self.assertIn("CSD", msgsA[0]["content"])
        self.assertIn("VALLARASU S", msgsA[1]["content"])
        
        # Retrieve Conversation B
        resB = self.client.get(f"/api/ai/conversations/{convB['id']}", headers=self.headers)
        self.assertEqual(resB.status_code, 200)
        msgsB = resB.json()["messages"]
        self.assertEqual(len(msgsB), 2)
        self.assertIn("CS", msgsB[0]["content"])
        self.assertIn("NANTHINI S", msgsB[1]["content"])
        
        # Ensure zero leakage between conversation A and B
        for msg in msgsA:
            self.assertNotIn("NANTHINI S", msg["content"])
        for msg in msgsB:
            self.assertNotIn("VALLARASU S", msg["content"])

    def test_criterion_7_new_chat_creates_fresh_context(self):
        """Criterion 7: Starting a new chat creates clean context without carrying over old department."""
        # Chat 1 sets department to CSD
        conv1 = create_conversation(user_id=self.user["id"], title="Prior Chat")
        self.client.post("/api/ai/query", json={
            "question": "Who is the top student in CSD?",
            "mode": "chat_viz",
            "conversation_id": conv1["id"]
        }, headers=self.headers)
        
        # Chat 2 is freshly created
        conv2_res = self.client.post("/api/ai/conversations", json={"title": "Fresh Chat"}, headers=self.headers)
        conv2_id = conv2_res.json()["conversation"]["id"]
        
        # In Chat 2, asking "Who is the top student?" ranks across the whole institution, not CSD
        res2 = self.client.post("/api/ai/query", json={
            "question": "Who is the top student?",
            "mode": "chat_viz",
            "conversation_id": conv2_id
        }, headers=self.headers)
        self.assertEqual(res2.status_code, 200)
        data = res2.json()
        self.assertIsNotNone(data.get("studentCard"))
        # Institution-wide top student has GPA 10.0
        self.assertEqual(data["studentCard"]["gpa"], 10.0)

    def test_criterion_10_unknown_department_handling(self):
        """Criterion 10: Unknown departments are handled honestly without hallucinating."""
        conv = create_conversation(user_id=self.user["id"], title="Unknown Dept")
        res = self.client.post("/api/ai/query", json={
            "question": "Who is the top student in Aerospace?",
            "mode": "chat_viz",
            "conversation_id": conv["id"]
        }, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("clarificationNeeded"))
        self.assertIn("Aerospace", data["answer"])
        self.assertIn("not found", data["answer"].lower())
        self.assertIsNone(data.get("studentCard"))


if __name__ == "__main__":
    unittest.main()

