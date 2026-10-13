import pandas as pd
import sys
import os

def explore_excel(file_path):
    print(f"Reading {file_path}")
    try:
        df = pd.read_excel(file_path, header=None)
        rows_to_show = min(5, len(df))
        for i in range(rows_to_show):
            print(f"Row {i}:", df.iloc[i].values)
    except Exception as e:
        print("Error reading Excel sheet:", e)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        # Default sample search
        default_sample = os.path.join(os.path.dirname(os.path.abspath(__file__)), "student-analysis-dashboard", "backend", "data", "UG", "CSE", "V", "CSE-CONS-WO.xlsx")
        if os.path.exists(default_sample):
            print(f"No file path provided. Using default sample: {default_sample}")
            target = default_sample
        else:
            print("Usage: python scratch_explore.py <path_to_excel_file>")
            sys.exit(0)

    explore_excel(target)
