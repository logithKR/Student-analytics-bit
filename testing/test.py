import os
import glob
import pandas as pd
import numpy as np
import joblib

# ==========================================
# 1. Configuration & Dynamic Relative Paths
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Look for test file in repo dataset or backend sample data
dataset_candidates = [
    os.path.join(REPO_ROOT, "student-analysis-dashboard", "backend", "data", "UG", "IT", "V", "IT-CONS-WO.xlsx"),
    os.path.join(REPO_ROOT, "student-analysis-dashboard", "backend", "data", "UG", "CSE", "V", "CSE-CONS-WO.xlsx"),
    os.path.join(REPO_ROOT, "dataset", "UG", "IT", "V", "IT-CONS-WO.xlsx")
]

TEST_FILE = None
for c in dataset_candidates:
    if os.path.exists(c):
        TEST_FILE = c
        break

if not TEST_FILE:
    found = glob.glob(os.path.join(REPO_ROOT, "**", "*.xlsx"), recursive=True)
    if found:
        TEST_FILE = found[0]

# Model & features resolution
model_candidates = [
    os.path.join(REPO_ROOT, "student-analysis-dashboard", "backend", "model", "xgboost_probability_model.joblib"),
    os.path.join(REPO_ROOT, "training", "model", "new", "xgboost_probability_model.joblib"),
    os.path.join(REPO_ROOT, "training", "model", "xgboost_probability_model.joblib")
]
MODEL_PATH = next((m for m in model_candidates if os.path.exists(m)), model_candidates[0])

features_candidates = [
    os.path.join(REPO_ROOT, "student-analysis-dashboard", "backend", "model", "prob_features.joblib"),
    os.path.join(REPO_ROOT, "training", "model", "new", "prob_features.joblib"),
    os.path.join(REPO_ROOT, "training", "model", "prob_features.joblib")
]
FEATURES_PATH = next((f for f in features_candidates if os.path.exists(f)), features_candidates[0])


def run_test():
    print("--- Starting Standalone Model Test ---")
    
    # 1. Load Model & Features
    try:
        model = joblib.load(MODEL_PATH)
        feature_cols = joblib.load(FEATURES_PATH)
        print(f"[*] Successfully loaded model from: {MODEL_PATH}")
        print(f"[*] Features: {feature_cols}")
    except Exception as e:
        print(f"[!] Error loading model: {e}")
        return

    # 2. Read Raw Excel File
    if not TEST_FILE or not os.path.exists(TEST_FILE):
        print("[!] No test spreadsheet found.")
        return

    print(f"[*] Reading test file: {TEST_FILE}")
    try:
        df_raw = pd.read_excel(TEST_FILE, header=None)
    except Exception as e:
        print(f"[!] Error reading Excel file: {e}")
        return

    # 3. Locate the 'IM' sub-header dynamically
    sub_header_idx = -1
    for i, row in df_raw.iterrows():
        row_str = row.astype(str).str.strip().str.upper().values
        if 'IM' in row_str:
            sub_header_idx = i
            break
            
    if sub_header_idx == -1:
        print("[!] Could not find the 'IM' (Internal Marks) row in the Excel sheet.")
        return
        
    print(f"[*] Found 'IM' header at row index {sub_header_idx}")
    
    im_cols = [j for j, val in enumerate(df_raw.iloc[sub_header_idx]) if str(val).strip().upper() == 'IM']
    print(f"[*] Extracting marks from column indices: {im_cols}")

    # 4. Extract data and find max mark for scaling
    students_data = []
    max_im_global = 0.0

    for i in range(sub_header_idx + 1, len(df_raw)):
        row = df_raw.iloc[i]
        reg_no = str(row[1] if len(row) > 1 and str(row[1]).startswith("7376") else row[0]).strip()
        name = str(row[2] if len(row) > 2 and str(row[1]).startswith("7376") else (row[1] if len(row) > 1 else "Student")).strip()
        
        if pd.isna(row[0]) or reg_no == '' or reg_no.lower() in ['nan', 'none']:
            continue
            
        im_values = []
        for col in im_cols:
            val = str(row[col]).strip().upper()
            if val.replace('.', '', 1).isdigit():
                im_values.append(float(val))
            elif val in ['AB', 'U', 'W']:
                im_values.append(0.0)
                
        if not im_values:
            continue
            
        current_max = max(im_values) if im_values else 0.0
        max_im_global = max(max_im_global, current_max)
        
        students_data.append({
            'reg_no': reg_no,
            'name': name,
            'im_values': im_values
        })

    # 5. Apply the scaling rule (if marks are out of 25, multiply by 2)
    scale_factor = 2.0 if 0 < max_im_global <= 25 else 1.0
    print(f"[*] Global Max Internal Mark found: {max_im_global}")
    print(f"[*] Applying Scale Factor: x{scale_factor}")

    # 6. Process features and predict
    results = []
    for student in students_data:
        scaled_ims = [x * scale_factor for x in student['im_values']]
        
        avg_im = np.mean(scaled_ims)
        min_im = np.min(scaled_ims)
        low_count = sum(1 for x in scaled_ims if x < 25.0)
        
        X_test = pd.DataFrame([[avg_im, min_im, low_count]], columns=feature_cols)
        probs = model.predict_proba(X_test)[0]
        
        pass_prob = round(probs[0] * 100, 2)
        fail_prob = round(probs[1] * 100, 2)
        
        if fail_prob >= 50.0:
            risk = "HIGH RISK (FAIL)"
        elif fail_prob >= 25.0:
            risk = "MEDIUM RISK"
        else:
            risk = "SAFE (PASS)"
            
        results.append({
            'Register Number': student['reg_no'],
            'Student Name': student['name'],
            'Raw Extracted Marks': str(student['im_values']),
            'Scaled Avg IM (/50)': round(avg_im, 2),
            'Scaled Min IM (/50)': round(min_im, 2),
            'Danger Subjects (<25)': low_count,
            'Pass Probability (%)': pass_prob,
            'Fail Probability (%)': fail_prob,
            'Risk Status': risk
        })
        
    # 7. Save results to a new Excel file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_file = os.path.join(OUTPUT_DIR, "Model_Predictions_Output.xlsx")
    out_df = pd.DataFrame(results)
    
    out_df.to_excel(out_file, index=False)
    print(f"\n[SUCCESS] Processed {len(results)} students.")
    print(f"[SUCCESS] Test results successfully saved to:\n -> {out_file}")

if __name__ == "__main__":
    run_test()