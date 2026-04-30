"""
init_qc_db.py
-------------
One-time initialization script for truestimate_system.db.

Responsibilities:
  1. Create all 4 QC tables with correct schema.
  2. Derive per-project TruEstimate values from truestimate.db using
     the existing compute_truestimate() engine.
  3. Populate truestimate_projects as the canonical valuation source
     for the QC matching pipeline.

Run once (or re-run to refresh truestimate_projects after a new ingestion):
    python init_qc_db.py
"""

import sqlite3
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine import compute_truestimate
from database import get_clean_connection
from qc_database import get_qc_connection, QC_DB


# --- DDL: Create all 4 tables ---

CREATE_ASK_PRICES_RAW = """
CREATE TABLE IF NOT EXISTS ask_prices_raw (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name  TEXT,
    market_ask    REAL,
    source_file   TEXT,
    ingested_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_TRUESTIMATE_PROJECTS = """
CREATE TABLE IF NOT EXISTS truestimate_projects (
    project_name        TEXT PRIMARY KEY,
    truestimate         REAL,
    transaction_count   INTEGER,
    confidence          REAL,
    last_updated        TIMESTAMP
);
"""

CREATE_QC_RESULTS = """
CREATE TABLE IF NOT EXISTS qc_results (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name      TEXT,
    market_ask        REAL,
    market_ask_2025   REAL,
    truestimate       REAL,
    deviation         REAL,
    qc_label          TEXT,
    qc_status         TEXT,
    match_confidence  REAL,
    source_file       TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_PUBLISH_READY = """
CREATE TABLE IF NOT EXISTS publish_ready (
    project_name    TEXT PRIMARY KEY,
    truestimate     REAL,
    market_ask      REAL,
    market_ask_2025 REAL,
    deviation       REAL,
    qc_label        TEXT,
    published_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


def create_schema(conn: sqlite3.Connection) -> None:
    print("Creating QC schema...")
    conn.execute(CREATE_ASK_PRICES_RAW)
    conn.execute(CREATE_TRUESTIMATE_PROJECTS)
    conn.execute(CREATE_QC_RESULTS)
    conn.execute(CREATE_PUBLISH_READY)
    conn.commit()
    print("  [OK] Tables created: ask_prices_raw, truestimate_projects, qc_results, publish_ready")


# --- STEP 2: Populate truestimate_projects ---
# Reads from truestimate.db, runs the estimation engine per project.

def populate_truestimate_projects(qc_conn: sqlite3.Connection) -> int:
    """
    Reads all transactions from truestimate.db, groups by building_name,
    runs compute_truestimate() on each group, and upserts the result
    into truestimate_projects.
    Returns the number of projects written.
    """
    print("\nPopulating truestimate_projects from truestimate.db...")

    clean_conn = get_clean_connection()
    clean_conn.row_factory = sqlite3.Row
    cursor = clean_conn.cursor()

    cursor.execute("""
        SELECT building_name, GROUP_CONCAT(ppsft) AS ppsft_list, COUNT(*) AS txn_count
        FROM transactions
        WHERE ppsft IS NOT NULL AND ppsft > 0
        GROUP BY building_name
        HAVING COUNT(*) > 1
    """)
    rows = cursor.fetchall()
    clean_conn.close()

    now = datetime.now(timezone.utc).isoformat()
    inserted = 0

    qc_conn.execute("DELETE FROM truestimate_projects;")  # Full refresh

    for row in rows:
        name = str(row["building_name"]).upper().strip()
        ppsft_values = [float(v) for v in row["ppsft_list"].split(",") if v.strip()]
        txn_count = row["txn_count"]

        if not ppsft_values:
            continue

        estimate, confidence, _, _ = compute_truestimate(ppsft_values)

        if estimate <= 0:
            continue

        qc_conn.execute("""
            INSERT OR REPLACE INTO truestimate_projects
                (project_name, truestimate, transaction_count, confidence, last_updated)
            VALUES (?, ?, ?, ?, ?)
        """, (name, estimate, txn_count, confidence, now))
        inserted += 1

    qc_conn.commit()
    print(f"  [OK] {inserted} projects written to truestimate_projects")
    return inserted


# --- MAIN ---

def main():
    print("=== TruEstimate QC DB Initialization ===")
    print(f"Target database: {QC_DB}\n")

    qc_conn = get_qc_connection()

    create_schema(qc_conn)
    project_count = populate_truestimate_projects(qc_conn)

    qc_conn.close()

    print("\n=== Initialization Complete ===")
    print(f"  Projects in truestimate_projects : {project_count}")
    print("  Ready to run: python qc_pipeline.py <path_to_ask_prices.xlsx>")


if __name__ == "__main__":
    main()
