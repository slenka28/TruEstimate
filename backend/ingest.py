import pandas as pd
import sqlite3
import numpy as np

raw_db_path = "truestate.db"
clean_db_path = "truestimate.db"

excel_path = "E:\\Truestate\\TruEstimate Data\\Kaveri_2025_Apartment_Trial.xlsx"

# Load Excel
df = pd.read_excel(excel_path)

# Clean columns
df.columns = df.columns.str.strip()
df = df.dropna(axis=1, how='all')

print("Columns:", df.columns)

# Rename
df = df.rename(columns={
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
    "Buyer Name": "buyer_name",
    "Seller": "seller_name"
})

# Keep only required columns (+ market_value for filtering)
df = df[
    [
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
]

# Convert types
df["ppsft"] = pd.to_numeric(df["ppsft"], errors="coerce")
df["area"] = pd.to_numeric(df["area"], errors="coerce")
# Clean numeric columns properly (VERY IMPORTANT)
df["value"] = (
    df["value"]
    .astype(str)
    .str.replace(",", "")
    .str.strip()
)

df["market_value"] = (
    df["market_value"]
    .astype(str)
    .str.replace(",", "")
    .str.strip()
)

df["value"] = pd.to_numeric(df["value"], errors="coerce")
df["market_value"] = pd.to_numeric(df["market_value"], errors="coerce")

# Date formatting
df["transaction_date"] = pd.to_datetime(
    df["transaction_date"],
    format="%d-%m-%Y",
    errors="coerce"
).dt.strftime("%Y-%m-%d")

# Clean building name
df["building_name"] = df["building_name"].str.strip().str.upper()

# Remove invalid rows
df = df.dropna(subset=["building_name", "value", "area"])

# 🔥 STEP 1: COMMON CLEANING (BOTH DBs)

# Round SBUA up
df["area"] = np.ceil(df["area"])

# Recalculate PPSF
df["ppsft"] = (df["value"] / df["area"]).round(2)

# 🔥 SAVE RAW DB (ALL TRANSACTIONS)

conn_raw = sqlite3.connect(raw_db_path)
cursor = conn_raw.cursor()

cursor.execute("DROP TABLE IF EXISTS transactions;")
cursor.execute("""
CREATE TABLE transactions (
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

# Drop market_value before saving raw DB
df_raw = df.drop(columns=["market_value"])

df_raw.to_sql("transactions", conn_raw, if_exists="append", index=False)
conn_raw.commit()
conn_raw.close()

print(f"SUCCESS: RAW DB: {len(df_raw)} records inserted")

# 🔥 STEP 2: TRUESTIMATE CLEANING (STRICT FILTER)

df_clean = df[df["market_value"] <= df["value"]]

# Remove market_value column
df_clean = df_clean.drop(columns=["market_value"])

# 🔥 SAVE TRUESTIMATE DB

conn_clean = sqlite3.connect(clean_db_path)
cursor = conn_clean.cursor()

cursor.execute("DROP TABLE IF EXISTS transactions;")
cursor.execute("""
CREATE TABLE transactions (
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

df_clean.to_sql("transactions", conn_clean, if_exists="append", index=False)
conn_clean.commit()
conn_clean.close()

print(f"SUCCESS: TRUESTIMATE DB: {len(df_clean)} records inserted")