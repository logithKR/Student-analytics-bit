import os
import unittest
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

import groq
from ai_service import (
    process_ai_query,
    groq_query_planner,
    get_configured_groq_keys,
    get_configured_groq_models,
    mask_api_key,
    GroqRateLimitError
)
from data_service import load_data

class TestGroqMultiKeyMultiModelFailover(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.student_data = load_data()

    def test_key_discovery_priority(self):
        """Verify keys are discovered across GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3 and GROQ_API_KEYS."""
        env_vars = {
            "GROQ_API_KEY": "gsk_primary_key_1111111111",
            "GROQ_API_KEY_2": "gsk_secondary_key_22222222",
            "GROQ_API_KEY_3": "gsk_tertiary_key_333333333",
            "GROQ_API_KEYS": "gsk_extra_key_4444444444, gsk_extra_key_5555555555"
        }
        with patch.dict(os.environ, env_vars):
            keys = get_configured_groq_keys()
            self.assertEqual(len(keys), 5)
            self.assertEqual(keys[0], "gsk_primary_key_1111111111")
            self.assertEqual(keys[1], "gsk_secondary_key_22222222")
            self.assertEqual(keys[2], "gsk_tertiary_key_333333333")
            self.assertEqual(keys[3], "gsk_extra_key_4444444444")
            self.assertEqual(keys[4], "gsk_extra_key_5555555555")

    def test_key_masking_security(self):
        """Verify API keys are never leaked in plaintext."""
        masked = mask_api_key("gsk_1234567890abcdef1234567890")
        self.assertEqual(masked, "gsk_...7890")
        self.assertNotIn("abcdef", masked)

    def test_failover_key1_to_key2_on_rate_limit(self):
        """When Key 1 hits 429, the engine must transparently switch to Key 2 on the same model."""
        env_vars = {
            "GROQ_API_KEY": "gsk_key_1_1111111111111",
            "GROQ_API_KEY_2": "gsk_key_2_2222222222222",
            "GROQ_API_KEY_3": "",
            "GROQ_API_KEYS": "",
            "GROQ_MODEL": "openai/gpt-oss-120b",
            "GROQ_FALLBACK_MODELS": "openai/gpt-oss-20b"
        }
        with patch.dict(os.environ, env_vars):
            mock_success = MagicMock()
            mock_success.choices = [MagicMock()]
            mock_success.choices[0].message.content = '{"intent": "general_chat", "answer": "Hello from Key 2!", "needs_clarification": false, "is_visualizable": false, "queryPlan": null, "graphSpecification": null}'

            err_resp = MagicMock()
            err_resp.status_code = 429
            rate_limit_err = groq.RateLimitError(
                message="Rate limit reached for Key 1",
                response=err_resp,
                body={"error": {"message": "Rate limit reached for Key 1"}}
            )

            # First call (Key 1) fails with 429, second call (Key 2) succeeds
            with patch("groq.resources.chat.completions.Completions.create", side_effect=[rate_limit_err, mock_success]):
                res = process_ai_query("Hello test", self.student_data, mode="chat_only")
                self.assertEqual(res.status, "success")
                self.assertIn("Key 2", res.answer)
                self.assertEqual(res.keyUsed, mask_api_key("gsk_key_2_2222222222222"))
                self.assertEqual(len(res.failoverAttempts), 1)
                self.assertEqual(res.failoverAttempts[0]["reason"], "rate_limit_exceeded")
                self.assertEqual(res.failoverAttempts[0]["keyIndex"], 1)

    def test_failover_all_keys_to_secondary_model_on_rate_limit(self):
        """When all keys hit 429 on Model 1, engine must switch to Model 2 (openai/gpt-oss-20b) and succeed."""
        env_vars = {
            "GROQ_API_KEY": "gsk_key_1_1111111111111",
            "GROQ_API_KEY_2": "gsk_key_2_2222222222222",
            "GROQ_API_KEY_3": "gsk_key_3_3333333333333",
            "GROQ_API_KEYS": "",
            "GROQ_MODEL": "openai/gpt-oss-120b",
            "GROQ_FALLBACK_MODELS": "openai/gpt-oss-20b"
        }
        with patch.dict(os.environ, env_vars):
            mock_success = MagicMock()
            mock_success.choices = [MagicMock()]
            mock_success.choices[0].message.content = '{"intent": "general_chat", "answer": "Hello from Secondary Model!", "needs_clarification": false, "is_visualizable": false, "queryPlan": null, "graphSpecification": null}'

            err_resp = MagicMock()
            err_resp.status_code = 429
            rate_limit_err = groq.RateLimitError(
                message="Rate limit reached",
                response=err_resp,
                body={"error": {"message": "Rate limit reached"}}
            )

            # Model 1: Key 1 fails, Key 2 fails, Key 3 fails.
            # Model 2: Key 1 succeeds!
            call_sequence = [rate_limit_err, rate_limit_err, rate_limit_err, mock_success]
            with patch("groq.resources.chat.completions.Completions.create", side_effect=call_sequence) as mock_create:
                res = process_ai_query("Explain student trends", self.student_data, mode="chat_only")
                self.assertEqual(res.status, "success")
                self.assertIn("Secondary Model", res.answer)
                self.assertIn("openai/gpt-oss-20b", res.modelUsed)
                self.assertEqual(res.keyUsed, mask_api_key("gsk_key_1_1111111111111"))
                # Exactly 3 failover attempts were logged from Model 1
                self.assertEqual(len(res.failoverAttempts), 3)
                for attempt in res.failoverAttempts:
                    self.assertEqual(attempt["model"], "openai/gpt-oss-120b")
                    self.assertEqual(attempt["reason"], "rate_limit_exceeded")

    def test_complete_exhaustion_reports_rate_limit_error(self):
        """When all keys across all models are completely exhausted, report clean rate limit error."""
        env_vars = {
            "GROQ_API_KEY": "gsk_key_1_1111111111111",
            "GROQ_API_KEY_2": "gsk_key_2_2222222222222",
            "GROQ_API_KEY_3": "",
            "GROQ_API_KEYS": "",
            "GROQ_MODEL": "openai/gpt-oss-120b",
            "GROQ_FALLBACK_MODELS": "openai/gpt-oss-20b"
        }
        with patch.dict(os.environ, env_vars):
            err_resp = MagicMock()
            err_resp.status_code = 429
            rate_limit_err = groq.RateLimitError(
                message="Rate limit reached for all keys and models",
                response=err_resp,
                body={"error": {"message": "Rate limit reached"}}
            )

            with patch("groq.resources.chat.completions.Completions.create", side_effect=rate_limit_err):
                res = process_ai_query("Show department GPA", self.student_data, mode="chat_viz")
                self.assertEqual(res.status, "error")
                self.assertEqual(res.errorStage, "Groq API Request")
                self.assertEqual(res.errorType, "rate_limit_error")
                self.assertIn("rate limit exceeded", res.error.lower())
                self.assertEqual(len(res.failoverAttempts), 4)  # 2 models * 2 keys = 4 attempts

if __name__ == "__main__":
    unittest.main()
