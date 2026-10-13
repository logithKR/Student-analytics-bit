import os
import sys
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

import model_service
from data_service import get_dataset_path

dataset_dir = get_dataset_path()
excel_files = glob.glob(os.path.join(dataset_dir, "**", "*.xlsx"), recursive=True)

if not excel_files:
    print("[!] No sample Excel file found in dataset directory.")
    sys.exit(0)

target_file = excel_files[0]
print(f"Testing parser on: {target_file}")

with open(target_file, 'rb') as f:
    res = model_service.parse_and_predict_excel(f.read())

print('Total Students:', len(res['students']))
if res['students']:
    print('Sample Student 1:', res['students'][0]['student_name'], res['students'][0]['risk_status'])
    if len(res['students']) > 1:
        print('Sample Student 2:', res['students'][1]['student_name'], res['students'][1]['risk_status'])

print("[SUCCESS] Parser test passed!")
