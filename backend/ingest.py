import pandas as pd
import sqlite3

db_path = "truestate.db"
excel_path = "E:\\Truestate\\TruEstimate Data\\Kaveri_2025_Apartment_Trial.xlsx"

# Load Excel
df = pd.read_excel(excel_path)

# Clean
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
    "Floor No": "floor"
})

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
        "floor"
    ]
]
# Convert
df["ppsft"] = pd.to_numeric(df["ppsft"], errors="coerce")
df["area"] = pd.to_numeric(df["area"], errors="coerce")
df["transaction_date"] = pd.to_datetime(
    df["transaction_date"],
    format="%d-%m-%Y",
    errors="coerce"
).dt.strftime("%Y-%m-%d")
df["building_name"] = df["building_name"].str.strip().str.upper()

df = df.dropna(subset=["building_name", "ppsft"])

# DB
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

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
    floor TEXT
);
""")

# Insert
df.to_sql("transactions", conn, if_exists="append", index=False)

conn.commit()
conn.close()

print(f"✅ SUCCESS: {len(df)} records inserted")