from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from engine import compute_truestimate

app = FastAPI(title="TruEstimate Search Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "truestate.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/search")
def search_buildings(query: str = ""):
    if not query:
        return []
    conn = get_db_connection()
    cursor = conn.cursor()
    # Case-insensitive LIKE search
    cursor.execute("""
        SELECT DISTINCT building_name 
        FROM transactions 
        WHERE building_name LIKE ? COLLATE NOCASE
        ORDER BY building_name
        LIMIT 100
    """, (f"%{query}%",))
    rows = cursor.fetchall()
    conn.close()
    return [row["building_name"] for row in rows]

@app.get("/building/{building_name}")
def get_building_details(building_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ppsft, transaction_date as date, area, value, unit_no, config, tower, wing, floor
        FROM transactions 
        WHERE building_name = ? COLLATE NOCASE
        ORDER BY date(transaction_date) DESC
    """, (building_name,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail="Building not found")

    transactions = [dict(row) for row in rows]
    ppsft_values = [t["ppsft"] for t in transactions]

    estimate, confidence, rng, filtered_count = compute_truestimate(ppsft_values)

    return {
        "building": building_name.upper(),
        "TruEstimate": estimate,
        "Confidence": confidence,
        "Range": rng,
        "FilteredCount": filtered_count,
        "TotalTransactions": len(ppsft_values),
        "Transactions": transactions
    }