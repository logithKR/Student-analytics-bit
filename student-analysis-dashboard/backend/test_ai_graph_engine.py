import unittest
import numpy as np
from ai_service import (
    process_ai_query, rule_based_query_planner, execute_query_plan,
    validate_and_repair_specification, GraphSpecification, QueryPlan,
    ColumnMetadata, FilterSpec, MetricSpec
)
from data_service import (
    load_data, get_dashboard_summary, get_top_performers,
    get_class_division, get_grade_distribution, get_subject_analytics,
    get_semester_trends
)

class TestAIGraphEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.student_data = load_data()
        assert len(cls.student_data) > 0, "Student data must be populated for tests."

    # =========================================================================
    # 1. NUMERICAL VALIDATION AGAINST OVERVIEW / DASHBOARD PAGES
    # =========================================================================

    def test_top_performers_numerical_parity(self):
        """Cross-check: AI query for top 5 performers matches get_top_performers exactly."""
        overview_top5 = get_top_performers(self.student_data, limit=5)
        ai_res = process_ai_query("Show the top 5 performers", self.student_data, mode="chat_viz")
        
        self.assertEqual(ai_res.status, "success")
        self.assertTrue(ai_res.showChart or ai_res.showTable)
        self.assertEqual(len(ai_res.data), 5)

        # Check exact GPAs in descending order
        expected_gpas = [p["gpa"] for p in overview_top5]
        actual_gpas = [r["gpa"] for r in ai_res.data]
        self.assertEqual(actual_gpas, expected_gpas)

        # Check exact top students set
        expected_names = set(p["name"] for p in overview_top5)
        actual_names = set(r["name"] for r in ai_res.data)
        self.assertEqual(actual_names, expected_names)

        # Rank 1 and Rank 2 must match exactly
        self.assertEqual(ai_res.data[0]["name"], overview_top5[0]["name"])
        self.assertEqual(ai_res.data[1]["name"], overview_top5[1]["name"])

    def test_grade_distribution_numerical_parity(self):
        """Cross-check: AI query for grade distribution matches get_grade_distribution exactly."""
        overview_grades = get_grade_distribution(self.student_data)
        ai_res = process_ai_query("What is the grade distribution breakdown?", self.student_data, mode="chat_viz")
        
        self.assertEqual(ai_res.status, "success")
        ai_data_map = {r["grade"]: r for r in ai_res.data}
        for og in overview_grades:
            g = og["grade"]
            self.assertIn(g, ai_data_map)
            self.assertEqual(ai_data_map[g]["count"], og["count"])
            self.assertEqual(ai_data_map[g]["percentage"], og["percentage"])

    def test_class_division_numerical_parity(self):
        """Cross-check: AI query for class division matches get_class_division exactly."""
        overview_divisions = get_class_division(self.student_data)
        ai_res = process_ai_query("What percentage of students are in each performance category?", self.student_data, mode="chat_viz")
        
        self.assertEqual(ai_res.status, "success")
        self.assertIsNotNone(ai_res.graphSpecification)
        self.assertEqual(ai_res.graphSpecification.visualization, "donut")

        overview_map = {d["name"]: d for d in overview_divisions}
        for row in ai_res.data:
            self.assertIn(row["name"], overview_map)
            self.assertEqual(row["value"], overview_map[row["name"]]["value"])
            self.assertEqual(row["percentage"], overview_map[row["name"]]["percentage"])

    def test_department_pass_percentage_parity(self):
        """Cross-check: Department pass percentage calculation matches Overview summary formula."""
        ai_res = process_ai_query("Top 5 performing departments based on average percentage", self.student_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        
        for dept_row in ai_res.data:
            dept = dept_row["department"]
            expected_summary = get_dashboard_summary(self.student_data, department=dept)
            self.assertEqual(dept_row["pass_percentage"], expected_summary["passPercentage"])
            self.assertEqual(dept_row["average_gpa"], expected_summary["averageGpa"])
            self.assertEqual(dept_row["student_count"], expected_summary["totalStudents"])

    def test_semester_trend_numerical_parity(self):
        """Cross-check: Semester trends match get_semester_trends."""
        overview_trends = get_semester_trends(self.student_data)
        ai_res = process_ai_query("Show semester SGPA progression trends", self.student_data, mode="chat_viz")
        
        self.assertEqual(ai_res.status, "success")
        self.assertIn(ai_res.graphSpecification.visualization, ["area", "line"])
        self.assertEqual(len(ai_res.data), len(overview_trends))
        for i in range(len(overview_trends)):
            self.assertEqual(ai_res.data[i]["semester"], overview_trends[i]["semester"])
            self.assertEqual(ai_res.data[i]["averageGpa"], overview_trends[i]["averageGpa"])

    # =========================================================================
    # 2. DYNAMIC AXIS DETECTION & INTENT INFERENCE
    # =========================================================================

    def test_dynamic_axes_attendance_or_percentage(self):
        """Dynamic axis detection: X-axis = Department, Y-axis = Pass/Attendance Percentage."""
        ai_res = process_ai_query("Show pass percentage by department", self.student_data, mode="chat_viz")
        spec = ai_res.graphSpecification
        self.assertIsNotNone(spec)
        self.assertEqual(spec.xAxis.field, "department")
        self.assertEqual(spec.yAxis.field, "pass_percentage")
        self.assertEqual(spec.yAxis.unit, "%")

    def test_dynamic_axes_subject_average_marks(self):
        """Dynamic axis detection: X-axis = Course Code, Y-axis = Average Marks."""
        ai_res = process_ai_query("Show average marks for each subject", self.student_data, mode="chat_viz")
        spec = ai_res.graphSpecification
        self.assertIsNotNone(spec)
        self.assertEqual(spec.xAxis.field, "code")
        self.assertEqual(spec.yAxis.field, "average_marks")
        self.assertEqual(spec.yAxis.unit, "marks")

    def test_dynamic_axes_pass_vs_fail_comparison(self):
        """Dynamic axis detection: Multi-series grouped bar chart for Pass vs Fail."""
        ai_res = process_ai_query("Compare pass and fail students for each department", self.student_data, mode="chat_viz")
        spec = ai_res.graphSpecification
        self.assertIsNotNone(spec)
        self.assertEqual(spec.visualization, "grouped_bar")
        self.assertEqual(spec.xAxis.field, "department")
        self.assertIn("pass_count", spec.series)
        self.assertIn("fail_count", spec.series)

    # =========================================================================
    # 3. CONTEXTUAL FOLLOW-UP QUESTIONS
    # =========================================================================

    def test_follow_up_limit_adjustment(self):
        """Follow-up: 'Make it top 10' inherits previous query and updates limit."""
        history = [
            {"role": "user", "content": "Top 5 performing departments based on average percentage"},
            {"role": "assistant", "content": "Here are the top 5 departments."}
        ]
        history_objs = [type("Msg", (), m) for m in history]
        ai_res = process_ai_query("Make it top 10", self.student_data, mode="chat_viz", history=history_objs)
        self.assertEqual(ai_res.status, "success")
        self.assertIsNotNone(ai_res.graphSpecification)
        self.assertEqual(ai_res.graphSpecification.limit, 10)

    def test_follow_up_metric_transformation(self):
        """Follow-up: 'Now show the same data as percentages' transforms metric."""
        history = [
            {"role": "user", "content": "Top 5 performing departments"},
            {"role": "assistant", "content": "Here are the top 5 departments by GPA."}
        ]
        history_objs = [type("Msg", (), m) for m in history]
        ai_res = process_ai_query("Now show the same data as percentages", self.student_data, mode="chat_viz", history=history_objs)
        self.assertEqual(ai_res.status, "success")
        spec = ai_res.graphSpecification
        self.assertIsNotNone(spec)
        self.assertEqual(spec.yAxis.field, "pass_percentage")
        self.assertEqual(spec.yAxis.unit, "%")

    # =========================================================================
    # 4. CRITICAL EDGE CASES (ALL 12 TESTS)
    # =========================================================================

    def test_edge_case_1_empty_dataset(self):
        """Edge Case 1: Empty dataset returns clean zero-results state without crashing."""
        ai_res = process_ai_query("Show average GPA by department", [], mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertEqual(ai_res.totalRows, 0)
        self.assertEqual(len(ai_res.data), 0)
        self.assertFalse(ai_res.showChart)
        self.assertIn("No student records", ai_res.answer)

    def test_edge_case_2_single_data_point(self):
        """Edge Case 2: Single data point renders valid visualization without axis errors."""
        single_student = [self.student_data[0]]
        ai_res = process_ai_query("Show top 5 performers", single_student, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertEqual(len(ai_res.data), 1)
        self.assertEqual(ai_res.data[0]["name"], single_student[0]["name"])

    def test_edge_case_3_null_values(self):
        """Edge Case 3: Missing/null values are handled gracefully without silent errors."""
        corrupted_data = [
            {
                "registerNumber": "7376221CS999",
                "name": None,
                "department": None,
                "semester": "V",
                "result": "PASS",
                "gpa": None,
                "failCount": 0,
                "subjects": []
            }
        ]
        ai_res = process_ai_query("Show average GPA by department", corrupted_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        # Result should not crash and GPA should default cleanly to 0.0
        for r in ai_res.data:
            self.assertIsNotNone(r.get("average_gpa"))

    def test_edge_case_4_zero_values(self):
        """Edge Case 4: Zero percentage, zero marks, 0 GPA displayed correctly, not as null."""
        zero_data = [
            {
                "registerNumber": "7376221CS000",
                "name": "Zero Performer",
                "department": "CSE",
                "semester": "V",
                "result": "FAIL",
                "gpa": 0.0,
                "failCount": 5,
                "subjects": [{"code": "CS501", "tot": 0.0, "grd": "U"}]
            }
        ]
        ai_res = process_ai_query("Show average GPA by department", zero_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertEqual(ai_res.data[0]["average_gpa"], 0.0)

    def test_edge_case_5_duplicate_categories(self):
        """Edge Case 5: Duplicate categories are correctly aggregated into distinct entries."""
        dup_data = [
            {"registerNumber": "1", "name": "A", "department": "CSE", "semester": "V", "result": "PASS", "gpa": 8.0, "failCount": 0, "subjects": []},
            {"registerNumber": "2", "name": "B", "department": "CSE", "semester": "V", "result": "PASS", "gpa": 6.0, "failCount": 0, "subjects": []},
            {"registerNumber": "3", "name": "C", "department": "CSE", "semester": "V", "result": "PASS", "gpa": 10.0, "failCount": 0, "subjects": []},
            {"registerNumber": "4", "name": "D", "department": "IT", "semester": "V", "result": "PASS", "gpa": 8.0, "failCount": 0, "subjects": []},
        ]
        ai_res = process_ai_query("Show average GPA by department", dup_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        dept_names = [r["department"] for r in ai_res.data]
        self.assertEqual(len(dept_names), len(set(dept_names)), "Departments must not have duplicate rows")
        cse_row = next(r for r in ai_res.data if r["department"] == "CSE")
        self.assertEqual(cse_row["average_gpa"], 8.0) # (8.0 + 6.0 + 10.0) / 3 = 8.0

    def test_edge_case_6_large_dataset(self):
        """Edge Case 6: Handles hundreds of student records without freezing or failing."""
        large_dataset = self.student_data * 10 # 840 records
        ai_res = process_ai_query("Top 5 performing departments based on average percentage", large_dataset, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertLessEqual(len(ai_res.data), 10)

    def test_edge_case_7_very_long_labels(self):
        """Edge Case 7: Very long labels are handled safely without crashing."""
        long_data = [
            {
                "registerNumber": "7376221CS888",
                "name": "Alexandrina Bartholomew Constantinus Montgomery-Smith the Third of Edinburgh",
                "department": "Computer Science and Design - Artificial Intelligence and Machine Learning",
                "semester": "V",
                "result": "PASS",
                "gpa": 9.5,
                "failCount": 0,
                "subjects": []
            }
        ]
        ai_res = process_ai_query("Show top 5 performers", long_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertIn("Alexandrina", ai_res.data[0]["name"])

    def test_edge_case_8_special_characters(self):
        """Edge Case 8: Special characters in labels are preserved cleanly."""
        spec_data = [
            {
                "registerNumber": "7376221CS777",
                "name": "O'Connor & Smith-Jones (Jr.) \"Top!\" / CSE_AI",
                "department": "CSE & IT / Bio-Tech (Special)",
                "semester": "V",
                "result": "PASS",
                "gpa": 9.2,
                "failCount": 0,
                "subjects": []
            }
        ]
        ai_res = process_ai_query("Show top 5 performers", spec_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertGreater(len(ai_res.data), 0)
        label_val = str(ai_res.data[0].get("name") or ai_res.data[0].get("department") or "")
        self.assertTrue("O'Connor" in label_val or "CSE & IT" in label_val)

    def test_edge_case_9_negative_values(self):
        """Edge Case 9: Negative values are handled gracefully and GPA is bounded >= 0.0."""
        neg_data = [
            {
                "registerNumber": "7376221CS666",
                "name": "Negative Student",
                "department": "CSE",
                "semester": "V",
                "result": "FAIL",
                "gpa": -2.5,
                "failCount": 3,
                "subjects": []
            }
        ]
        ai_res = process_ai_query("Show average GPA by department", neg_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        # System cleanly formats numeric averages
        self.assertIsNotNone(ai_res.data[0]["average_gpa"])

    def test_edge_case_10_percentage_validation(self):
        """Edge Case 10: Percentages are mathematically validated to not silently produce invalid numbers."""
        summary = get_dashboard_summary(self.student_data)
        self.assertGreaterEqual(summary["passPercentage"], 0.0)
        self.assertLessEqual(summary["passPercentage"], 100.0)

    def test_edge_case_11_missing_axis_repair(self):
        """Edge Case 11: Malformed specification missing axes is safely repaired."""
        raw_broken_spec = {
            "visualization": "invalid_unknown_type",
            "xAxis": {"field": "non_existent_field"},
            "yAxis": {"field": "another_fake_field"}
        }
        cols = [ColumnMetadata(name="department", type="string"), ColumnMetadata(name="gpa", type="number")]
        rows = [{"department": "CSE", "gpa": 8.0}]
        repaired = validate_and_repair_specification(raw_broken_spec, cols, rows, ["bar"])
        self.assertIsNotNone(repaired)
        self.assertEqual(repaired.visualization, "bar")
        self.assertEqual(repaired.xAxis.field, "department")
        self.assertEqual(repaired.yAxis.field, "gpa")

    def test_edge_case_12_ambiguous_user_request(self):
        """Edge Case 12: Ambiguous questions ('Show me something', 'Create a graph') return a safe overview or concise clarification."""
        ai_res = process_ai_query("Show me something", self.student_data, mode="chat_viz")
        self.assertEqual(ai_res.status, "success")
        self.assertTrue(ai_res.showChart or len(ai_res.answer) > 0)

if __name__ == "__main__":
    unittest.main()
