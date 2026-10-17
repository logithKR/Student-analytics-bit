import os
import unittest
from unittest.mock import patch, MagicMock
import json
from dotenv import load_dotenv

# Ensure environment is loaded
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

from ai_service import (
    process_ai_query,
    groq_query_planner,
    execute_query_plan,
    validate_and_repair_specification,
    AIAppError,
    GroqConfigurationError,
    GroqAuthenticationError,
    GroqRateLimitError,
    GroqTimeoutError,
    GroqNetworkError,
    GroqModelError,
    AIResponseParsingError,
    GraphSpecificationValidationError,
    DataRetrievalError,
    QueryPlan
)
from data_service import load_data
import groq

class TestRealGroqOnlyEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.student_data = load_data()
        assert len(cls.student_data) > 0, "Student data must exist."

    # =========================================================================
    # FAILURE MODE 1: Missing / Disabled Groq API Key
    # =========================================================================
    def test_01_missing_groq_api_key(self):
        """When GROQ_API_KEY is empty, must report Configuration Error, NO fallback graph."""
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
            res = process_ai_query("Show department pass percentages", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(len(res.data), 0)
            self.assertEqual(res.errorStage, "Groq API Configuration")
            self.assertEqual(res.errorType, "configuration_error")
            self.assertIn("API key missing", res.error)

    # =========================================================================
    # FAILURE MODE 2: Invalid API Key (Authentication Error)
    # =========================================================================
    def test_02_invalid_api_key(self):
        """When Groq returns AuthenticationError (401), must report Authentication Error, NO fallback graph."""
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_invalid_test_key"}):
            with patch("groq.resources.chat.completions.Completions.create") as mock_create:
                err_response = MagicMock()
                err_response.status_code = 401
                mock_create.side_effect = groq.AuthenticationError(
                    message="Invalid API Key",
                    response=err_response,
                    body={"error": {"message": "Invalid API Key"}}
                )
                res = process_ai_query("Show top 5 students", self.student_data, mode="chat_viz")
                self.assertEqual(res.status, "error")
                self.assertFalse(res.showChart)
                self.assertIsNone(res.visualization)
                self.assertIsNone(res.graphSpecification)
                self.assertEqual(len(res.data), 0)
                self.assertEqual(res.errorStage, "Groq API Request")
                self.assertEqual(res.errorType, "authentication_error")
                self.assertIn("Invalid API key", res.error)

    # =========================================================================
    # FAILURE MODE 3: Network Failure
    # =========================================================================
    def test_03_network_failure(self):
        """When connection fails, must report Network Error, NO fallback graph."""
        with patch("groq.resources.chat.completions.Completions.create") as mock_create:
            mock_create.side_effect = groq.APIConnectionError(request=MagicMock(), message="Connection refused")
            res = process_ai_query("Show grade distribution", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(len(res.data), 0)
            self.assertEqual(res.errorStage, "Groq API Request")
            self.assertEqual(res.errorType, "network_error")
            self.assertIn("Unable to reach Groq API", res.error)

    # =========================================================================
    # FAILURE MODE 4: Request Timeout
    # =========================================================================
    def test_04_request_timeout(self):
        """When Groq times out, must report Timeout Error, NO fallback graph."""
        with patch("groq.resources.chat.completions.Completions.create") as mock_create:
            mock_create.side_effect = groq.APITimeoutError(request=MagicMock())
            res = process_ai_query("Compare CSE and IT pass rates", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(len(res.data), 0)
            self.assertEqual(res.errorStage, "Groq API Request")
            self.assertEqual(res.errorType, "timeout_error")
            self.assertIn("timed out", res.error)

    # =========================================================================
    # FAILURE MODE 5: Rate Limit Exceeded
    # =========================================================================
    def test_05_rate_limit_exceeded(self):
        """When rate limit is hit, must report Rate Limit Error, NO fallback graph."""
        with patch("groq.resources.chat.completions.Completions.create") as mock_create:
            err_resp = MagicMock()
            err_resp.status_code = 429
            mock_create.side_effect = groq.RateLimitError(
                message="Rate limit exceeded: 30 requests per minute",
                response=err_resp,
                body={"error": {"message": "Rate limit exceeded"}}
            )
            res = process_ai_query("Top 5 performers", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(len(res.data), 0)
            self.assertEqual(res.errorStage, "Groq API Request")
            self.assertEqual(res.errorType, "rate_limit_error")
            self.assertIn("rate limit exceeded", res.error.lower())

    # =========================================================================
    # FAILURE MODE 6: Malformed / Invalid JSON Response from Model
    # =========================================================================
    def test_06_malformed_ai_json_response(self):
        """When Groq returns non-JSON content, must report Parsing Error, NO fallback graph."""
        with patch("groq.resources.chat.completions.Completions.create") as mock_create:
            mock_completion = MagicMock()
            mock_completion.choices = [MagicMock()]
            mock_completion.choices[0].message.content = "Here is your chart: ```invalid json text"
            mock_create.return_value = mock_completion

            res = process_ai_query("Show department pass rates", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(len(res.data), 0)
            self.assertEqual(res.errorStage, "AI Response Parsing")
            self.assertEqual(res.errorType, "parsing_error")
            self.assertIn("could not be parsed into valid JSON", res.error)

    # =========================================================================
    # FAILURE MODE 7: Database / Application Data Query Failure
    # =========================================================================
    def test_07_database_query_failure(self):
        """When application data querying fails, must report Data Retrieval Error, NO fake rows."""
        with patch("ai_service.execute_query_plan") as mock_exec:
            mock_exec.side_effect = RuntimeError("Database connection lost during query execution.")
            with patch("ai_service.groq_query_planner") as mock_planner:
                mock_planner.return_value = {
                    "intent": "database_query",
                    "answer": "Looking up department data.",
                    "is_visualizable": True,
                    "queryPlan": {
                        "entity": "departments",
                        "groupBy": ["department"],
                        "metrics": [{"field": "pass_percentage", "function": "avg", "alias": "pass_percentage"}],
                        "sortBy": "pass_percentage",
                        "sortOrder": "desc"
                    },
                    "graphSpecification": {
                        "visualization": "bar",
                        "title": "Pass Percentages",
                        "xAxis": {"field": "department", "label": "Department"},
                        "yAxis": {"field": "pass_percentage", "label": "Pass %"}
                    }
                }
                res = process_ai_query("Show department pass rates", self.student_data, mode="chat_viz")
                self.assertEqual(res.status, "error")
                self.assertFalse(res.showChart)
                self.assertIsNone(res.visualization)
                self.assertIsNone(res.graphSpecification)
                self.assertEqual(len(res.data), 0)
                self.assertEqual(res.errorStage, "Data Retrieval")
                self.assertEqual(res.errorType, "data_retrieval_error")
                self.assertIn("requested data could not be retrieved", res.error)

    # =========================================================================
    # FAILURE MODE 8: Empty Dataset Returned
    # =========================================================================
    def test_08_empty_dataset_handling(self):
        """When real database query returns 0 rows, must NOT generate fake bars or mock records."""
        with patch("ai_service.groq_query_planner") as mock_planner:
            mock_planner.return_value = {
                "intent": "database_query",
                "answer": "Searching for students.",
                "is_visualizable": True,
                "queryPlan": {
                    "entity": "students",
                    "filters": [{"field": "department", "operator": "eq", "value": "AEROSPACE_NON_EXISTENT"}],
                    "metrics": [{"field": "gpa", "function": "none", "alias": "gpa"}]
                },
                "graphSpecification": {
                    "visualization": "bar",
                    "title": "Aerospace Students",
                    "xAxis": {"field": "name", "label": "Student"},
                    "yAxis": {"field": "gpa", "label": "GPA"}
                }
            }
            res = process_ai_query("Show aerospace department students", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "success")
            self.assertFalse(res.showChart)
            self.assertFalse(res.showTable)
            self.assertEqual(len(res.data), 0)
            self.assertIsNone(res.graphSpecification)
            self.assertIn("0 student records matching your criteria", res.answer)

    # =========================================================================
    # FAILURE MODE 9: Missing / Null Graph Specification from AI
    # =========================================================================
    def test_09_missing_graph_spec_when_visualizable(self):
        """When Groq says visualizable but fails to return graphSpecification, must report error, NO fake default graph."""
        with patch("ai_service.groq_query_planner") as mock_planner:
            mock_planner.return_value = {
                "intent": "database_query",
                "answer": "Summary data.",
                "is_visualizable": True,
                "queryPlan": {
                    "entity": "departments",
                    "metrics": [{"field": "student_count", "function": "sum", "alias": "student_count"}]
                },
                "graphSpecification": None  # Null graph specification
            }
            res = process_ai_query("Show department student counts", self.student_data, mode="chat_viz")
            self.assertEqual(res.status, "error")
            self.assertFalse(res.showChart)
            self.assertIsNone(res.visualization)
            self.assertIsNone(res.graphSpecification)
            self.assertEqual(res.errorStage, "Specification Validation")
            self.assertEqual(res.errorType, "validation_error")

    # =========================================================================
    # FAILURE MODE 10: Invalid Graph Specification Fields (Unresolvable Columns)
    # =========================================================================
    def test_10_invalid_graph_fields(self):
        """When graph spec refers to fields completely incompatible with returned data, must fail cleanly without fake chart."""
        with patch("ai_service.validate_and_repair_specification") as mock_repair:
            mock_repair.return_value = None  # Validation fails completely
            with patch("ai_service.groq_query_planner") as mock_planner:
                mock_planner.return_value = {
                    "intent": "database_query",
                    "answer": "Summary data.",
                    "is_visualizable": True,
                    "queryPlan": {
                        "entity": "departments",
                        "metrics": [{"field": "student_count", "function": "sum", "alias": "student_count"}]
                    },
                    "graphSpecification": {
                        "visualization": "invalid_chart_type",
                        "title": "Invalid Chart",
                        "xAxis": {"field": "imaginary_column", "label": "Fake"},
                        "yAxis": {"field": "phantom_metric", "label": "Fake"}
                    }
                }
                res = process_ai_query("Show invalid graph", self.student_data, mode="chat_viz")
                self.assertEqual(res.status, "error")
                self.assertFalse(res.showChart)
                self.assertIsNone(res.visualization)
                self.assertIsNone(res.graphSpecification)
                self.assertEqual(res.errorStage, "Specification Validation")
                self.assertEqual(res.errorType, "validation_error")

    # =========================================================================
    # SUCCESS MODE: Real Groq Execution on Active API Key
    # =========================================================================
    def test_11_real_groq_api_call_integration(self):
        """Verifies end-to-end real Groq API execution when key is present in environment."""
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            self.skipTest("No GROQ_API_KEY available in environment for integration test.")

        res = process_ai_query("Show top 5 performing departments based on average percentage", self.student_data, mode="chat_viz")
        self.assertEqual(res.status, "success")
        self.assertTrue(res.queryExecuted)
        self.assertIsNotNone(res.queryPlan)
        self.assertGreater(len(res.data), 0)
        self.assertTrue(res.showChart)
        self.assertIsNotNone(res.graphSpecification)
        self.assertIn("Groq", res.modelUsed)
        self.assertIsNone(res.error)

if __name__ == "__main__":
    unittest.main()
