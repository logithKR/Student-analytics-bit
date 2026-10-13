import os
import sys
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from model_service import parse_and_predict_excel
from data_service import get_dataset_path

dataset_dir = get_dataset_path()
excel_files = glob.glob(os.path.join(dataset_dir, "**", "*.xlsx"), recursive=True)

if not excel_files:
    print("[!] No sample Excel file found in dataset directory.")
    sys.exit(0)

excel_path = excel_files[0]
print(f"Reading sample dataset file: {excel_path}")

with open(excel_path, "rb") as f:
    file_bytes = f.read()

res = parse_and_predict_excel(file_bytes)
print("\nBulk Batch Prediction Result Summary:")
print("  Summary:", res["summary"])
print(f"  Extracted {len(res['students'])} students.")
if res["students"]:
    print("  Sample Student Prediction (First 2):")
    for s in res["students"][:2]:
        print("   ", s)

print("\n[SUCCESS] Bulk prediction test completed successfully!")
