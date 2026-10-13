import unittest
from ai_service import (
    QueryPlan, ChartConfig, FilterSpec, MetricSpec,
    execute_query_plan, process_ai_query, rule_based_query_planner,
    get_schema_summary, evaluate_chart_compatibility, ColumnMetadata
)
from data_service import load_data

class TestAIAnalyticsService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.student_data = load_data()

    def test_schema_catalog(self):
        catalog = get_schema_summary()
        self.assertIn("students", catalog)
        self.assertIn("subjects", catalog)
        self.assertIn("gpa", catalog["students"]["columns"])
        self.assertIn("department", catalog["students"]["columns"])

    def test_chart_config_validation_fallback(self):
        config = ChartConfig(type="non_existent_3d_cube", title="Test")
        self.assertEqual(config.type, "bar")

        valid_types = ["bar", "line", "pie", "table"]
        for t in valid_types:
            cfg = ChartConfig(type=t, title="Valid")
            self.assertEqual(cfg.type, t)

    def test_empty_dataset_handling(self):
        plan = QueryPlan(
            entity="students",
            groupBy=["department"],
            metrics=[MetricSpec(field="registerNumber", function="count", alias="count")]
        )
        res = execute_query_plan(plan, [])
        self.assertEqual(res["totalRows"], 0)
        self.assertEqual(len(res["rows"]), 0)

    def test_department_aggregation(self):
        plan = QueryPlan(
            entity="students",
            groupBy=["department"],
            metrics=[
                MetricSpec(field="registerNumber", function="count", alias="student_count"),
                MetricSpec(field="gpa", function="avg", alias="average_gpa")
            ]
        )
        res = execute_query_plan(plan, self.student_data)
        self.assertGreater(res["totalRows"], 0)
        first_row = res["rows"][0]
        self.assertIn("department", first_row)
        self.assertIn("student_count", first_row)
        self.assertIn("average_gpa", first_row)

    def test_mode_a_chat_only(self):
        # Mode A: Chat Only must NOT automatically generate a chart
        res = process_ai_query("Show average GPA by department", self.student_data, mode="chat_only")
        self.assertEqual(res.status, "success")
        self.assertEqual(res.mode, "chat_only")
        self.assertFalse(res.showChart)
        self.assertIsNone(res.visualization)
        self.assertTrue(len(res.answer) > 0)

    def test_mode_b_chat_viz(self):
        # Mode B: Chat + Viz displays chart when appropriate
        res = process_ai_query("Show average GPA by department", self.student_data, mode="chat_viz")
        self.assertEqual(res.status, "success")
        self.assertEqual(res.mode, "chat_viz")
        self.assertTrue(res.showChart)
        self.assertIsNotNone(res.visualization)
        self.assertIn(res.visualization.type, ["bar", "line", "pie", "table"])

    def test_mode_c_data_table(self):
        # Mode C: Data Table focuses on rows and columns
        res = process_ai_query("Show average GPA by department", self.student_data, mode="data_table")
        self.assertEqual(res.status, "success")
        self.assertEqual(res.mode, "data_table")
        self.assertFalse(res.showChart)
        self.assertTrue(res.showTable)
        self.assertGreater(len(res.data), 0)

    def test_general_question_without_database(self):
        # General question should not run database queries
        res = process_ai_query("What does GPA stand for and how is it used?", self.student_data, mode="chat_only")
        self.assertEqual(res.status, "success")
        self.assertEqual(res.intent, "general_chat")
        self.assertFalse(res.queryExecuted)
        self.assertEqual(len(res.data), 0)
        self.assertIn("gpa", res.answer.lower())

    def test_chart_compatibility_evaluator(self):
        cat_col = ColumnMetadata(name="department", type="string")
        num_col = ColumnMetadata(name="avg_gpa", type="number")
        rows = [{"department": "CSE", "avg_gpa": 7.5}, {"department": "IT", "avg_gpa": 7.2}]
        
        compat = evaluate_chart_compatibility([cat_col, num_col], rows)
        self.assertIn("bar", compat)
        self.assertIn("table", compat)

        # Flat records with no numeric metrics
        str_only_cols = [ColumnMetadata(name="reg", type="string"), ColumnMetadata(name="name", type="string")]
        str_rows = [{"reg": "1", "name": "A"}, {"reg": "2", "name": "B"}]
        compat_str = evaluate_chart_compatibility(str_only_cols, str_rows)
        self.assertEqual(compat_str, ["table"])

if __name__ == "__main__":
    unittest.main()
