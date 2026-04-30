import pandas as pd
import sqlite3
import os

def export_transactions_to_excel(db_path, excel_path):
    print(f"Connecting to database: {db_path}")
    try:
        # Create connection
        conn = sqlite3.connect(db_path)
        
        # Read the transactions table into a pandas DataFrame
        print("Reading 'transactions' table...")
        df = pd.read_sql_query("SELECT * FROM transactions", conn)
        
        print(f"Found {len(df)} rows.")
        
        # Close connection
        conn.close()
        
        # Export to Excel
        print(f"Exporting to Excel: {excel_path}...")
        df.to_excel(excel_path, index=False, engine='openpyxl')
        
        print("Export successful!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        if "openpyxl" in str(e):
            print("Tip: Install openpyxl using 'pip install openpyxl'")

if __name__ == "__main__":
    db_file = 'truestimate.db'
    output_file = 'transactions_export.xlsx'
    
    if os.path.exists(db_file):
        export_transactions_to_excel(db_file, output_file)
    else:
        print(f"Error: {db_file} not found in the current directory.")
