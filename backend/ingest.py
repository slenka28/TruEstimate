import pandas as pd
import sqlite3
import numpy as np
import os

raw_db_path = "truestate.db"
clean_db_path = "truestimate.db"

raw_excel_path = "E:\\Truestate\\TruEstimate Data\\Kaveri_2025_Apartment_Trial.xlsx"
clean_excel_path = "E:\\Truestate\\TruEstimate Data\\Resale_H1_2025_Final.xlsx"

def load_and_clean_excel(excel_path):
    print(f"Loading {excel_path}...")
    # Load Excel
    df = pd.read_excel(excel_path)
    
    # Clean columns
    df.columns = df.columns.str.strip()
    df = df.dropna(axis=1, how='all')
    
    # Rename
    rename_mapping = {
        "Project Name": "building_name",
        "Date of Execution": "transaction_date",
        "PPSF": "ppsft",
        "Consideration Amount": "value",
        "SBUA (SqFt)": "area",
        "Unit No": "unit_no",
        "Configuration": "config",
        "Tower": "tower",
        "Wing": "wing",
        "Floor No": "floor",
        "District": "district",
        "Taluka": "taluka",
        "Hobli": "hobli",
        "Village": "village",
        "Market value": "market_value",
        "Seller": "seller_name",
        "Buyer": "buyer_name",
        "Buyer Name": "buyer_name" # To handle older files
    }
    
    df = df.rename(columns=rename_mapping)
    
    # Keep only required columns (+ market_value for filtering)
    # Use intersection to avoid KeyError if some columns are missing
    required_cols = [
        "building_name",
        "transaction_date",
        "ppsft",
        "value",
        "area",
        "unit_no",
        "config",
        "tower",
        "wing",
        "floor",
        "district",
        "taluka",
        "hobli",
        "village",
        "market_value",
        "buyer_name",
        "seller_name"
    ]
    
    available_cols = [c for c in required_cols if c in df.columns]
    df = df[available_cols]
    
    # Convert types
    df["ppsft"] = pd.to_numeric(df["ppsft"], errors="coerce")
    df["area"] = pd.to_numeric(df["area"], errors="coerce")
    
    # Clean numeric columns properly
    if "value" in df.columns:
        df["value"] = (
            df["value"]
            .astype(str)
            .str.replace(",", "")
            .str.strip()
        )
        df["value"] = pd.to_numeric(df["value"], errors="coerce")
        
    if "market_value" in df.columns:
        df["market_value"] = (
            df["market_value"]
            .astype(str)
            .str.replace(",", "")
            .str.strip()
        )
        df["market_value"] = pd.to_numeric(df["market_value"], errors="coerce")
    
    # Date formatting
    if "transaction_date" in df.columns:
        df["transaction_date"] = pd.to_datetime(
            df["transaction_date"],
            format="%d-%m-%Y",
            errors="coerce"
        ).dt.strftime("%Y-%m-%d")
    
    # Clean building name
    if "building_name" in df.columns:
        df["building_name"] = df["building_name"].str.strip().str.upper()
    
    # Remove invalid rows
    df = df.dropna(subset=["building_name", "value", "area"])
    
    # Round SBUA up
    df["area"] = np.ceil(df["area"])
    
    # Recalculate PPSF
    df["ppsft"] = (df["value"] / df["area"]).round(2)
    
    return df

def save_to_db(df, db_path, table_name="transactions"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
    cursor.execute(f"""
    CREATE TABLE {table_name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT,
        transaction_date DATE,
        ppsft REAL,
        value REAL,
        area REAL,
        unit_no TEXT,
        config TEXT,
        tower TEXT,
        wing TEXT,
        floor TEXT,
        district TEXT,
        taluka TEXT,
        hobli TEXT,
        village TEXT,
        buyer_name TEXT,
        seller_name TEXT
    );
    """)
    
    df.to_sql(table_name, conn, if_exists="append", index=False)
    conn.commit()
    conn.close()

# 🔥 STEP 1: SAVE RAW DB (ALL TRANSACTIONS FROM KAVERI)
print("--- Processing Raw DB Data ---")
if os.path.exists(raw_excel_path):
    df_raw = load_and_clean_excel(raw_excel_path)
    # Drop market_value before saving raw DB
    if "market_value" in df_raw.columns:
        df_raw = df_raw.drop(columns=["market_value"])
    
    # Keep only projects with > 1 transaction
    txn_counts = df_raw["building_name"].value_counts()
    valid_buildings = txn_counts[txn_counts > 1].index
    df_raw = df_raw[df_raw["building_name"].isin(valid_buildings)]
    
    save_to_db(df_raw, raw_db_path)
    print(f"SUCCESS: RAW DB: {len(df_raw)} records inserted from {os.path.basename(raw_excel_path)}")
else:
    print(f"ERROR: Raw Excel file not found at {raw_excel_path}")


# 🔥 STEP 2: TRUESTIMATE CLEANING (STRICT FILTER FROM RESALE_H1)
print("\n--- Processing TruEstimate DB Data ---")
if os.path.exists(clean_excel_path):
    df_clean_source = load_and_clean_excel(clean_excel_path)
    
    # Apply Strict Filter: market value <= actual value
    df_clean = df_clean_source[df_clean_source["market_value"] <= df_clean_source["value"]]
    
    # Remove market_value column
    if "market_value" in df_clean.columns:
        df_clean = df_clean.drop(columns=["market_value"])
    
    # Keep only projects with > 1 transaction
    txn_counts = df_clean["building_name"].value_counts()
    valid_buildings = txn_counts[txn_counts > 1].index
    df_clean = df_clean[df_clean["building_name"].isin(valid_buildings)]
    
    save_to_db(df_clean, clean_db_path)
    print(f"SUCCESS: TRUESTIMATE DB: {len(df_clean)} records inserted from {os.path.basename(clean_excel_path)}")
else:
    print(f"ERROR: Clean Excel file not found at {clean_excel_path}")