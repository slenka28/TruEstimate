"""
qc_pipeline.py
--------------
9-Step QC & Publishing Pipeline for TruEstimate.

Usage:
    python qc_pipeline.py "E:\\Truestate\\TruEstimate Data\\Project Ask Prices.xlsx"

Or from Python:
    from qc_pipeline import run_pipeline
    summary = run_pipeline("path/to/file.xlsx")

Pipeline Steps:
    1.  File Ingestion         - read Excel, detect columns dynamically
    2.  Normalization          - uppercase project names, strip whitespace
    3.  Raw Storage            - insert into ask_prices_raw (traceability)
    4.  Load TruEstimate       - fetch per-project estimates from truestimate_projects
    5.  Project Matching       - exact match on normalized names
    6.  Feature Engineering    - time-adjust ask price, compute deviation
    7.  QC Classification      - label each record (EXCELLENT to REJECT)
    8.  QC Validation          - PASS / FAIL gate
    9.  Publish Filter         - write PASS records to publish_ready

Audit principle: ALL records (including FAIL) are written to qc_results.
"""

import pandas as pd
import sqlite3
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qc_database import get_qc_connection

# --- CONSTANTS ---

# Time-normalization factor: ask prices are adjusted downward to 2025-aligned values.
# Rationale: listed ask prices tend to be ~10% above settled transaction prices.
TIME_NORMALIZATION_FACTOR = 0.90

# QC gate threshold: deviation above this value is a FAIL
QC_PASS_THRESHOLD = 0.40


# --- STEP 1 & 2: Ingest + Detect Columns ---

def detect_columns(df: pd.DataFrame) -> tuple:
    """
    Dynamically detects project name and ask price columns.
    Matching is case-insensitive and whitespace-tolerant.
    Raises ValueError with a helpful message if columns cannot be found.
    """
    cols = {c.lower().strip(): c for c in df.columns}

    # Project name variants: must contain 'project' or equal 'name'
    project_col = next(
        (original for key, original in cols.items()
         if "project" in key or key == "name"),
        None
    )

    # Ask price variants: must contain 'ask', 'price', or 'market'
    ask_col = next(
        (original for key, original in cols.items()
         if "ask" in key or "price" in key or "market" in key),
        None
    )

    if project_col is None:
        raise ValueError(
            f"Could not detect project name column. "
            f"Found columns: {list(df.columns)}. "
            f"Expected a column containing 'project' or 'name'."
        )

    if ask_col is None:
        raise ValueError(
            f"Could not detect ask price column. "
            f"Found columns: {list(df.columns)}. "
            f"Expected a column containing 'ask', 'price', or 'market'."
        )

    print(f"  Detected project column : '{project_col}'")
    print(f"  Detected ask col        : '{ask_col}'")
    return project_col, ask_col


def normalize_name(name) -> str:
    """Normalizes a project name to canonical form: UPPERCASE, stripped."""
    return str(name).upper().strip()


# --- QC Label Classification ---

def classify_deviation(deviation: float) -> str:
    """
    Maps a fractional deviation value to a human-readable QC label.
    Thresholds are inclusive at the upper bound.
    """
    if deviation <= 0.10:
        return "EXCELLENT"
    elif deviation <= 0.20:
        return "GOOD"
    elif deviation <= 0.30:
        return "ACCEPTABLE"
    elif deviation <= 0.40:
        return "RISKY"
    else:
        return "REJECT"


# --- MAIN PIPELINE ---

def run_pipeline(file_path: str) -> dict:
    """
    Executes the full 9-step QC & Publishing pipeline.

    Args:
        file_path: Absolute or relative path to the Ask Price Excel file.

    Returns:
        A summary dict with counts for all pipeline stages.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Excel file not found: {file_path}")

    source_file = os.path.basename(file_path)
    now = datetime.now(timezone.utc).isoformat()

    print(f"\n{'='*56}")
    print(f"  TruEstimate QC Pipeline  |  {source_file}")
    print(f"{'='*56}")

    conn = get_qc_connection()

    # -- STEP 1: File Ingestion --
    print("\n[STEP 1] Loading Excel file...")
    df = pd.read_excel(file_path)
    df.columns = df.columns.str.strip()
    print(f"  Loaded {len(df)} raw rows from '{source_file}'")

    # -- STEP 1b: Dynamic Column Detection --
    project_col, ask_col = detect_columns(df)

    df = df[[project_col, ask_col]].copy()
    df.columns = ["project_name", "market_ask"]

    # Drop rows missing either field
    before_drop = len(df)
    df = df.dropna(subset=["project_name", "market_ask"])
    dropped_null = before_drop - len(df)
    if dropped_null:
        print(f"  WARNING: Dropped {dropped_null} rows with missing name or ask price")

    # Coerce ask price to numeric, discard non-numeric
    df["market_ask"] = pd.to_numeric(df["market_ask"], errors="coerce")
    df = df[df["market_ask"] > 0].dropna(subset=["market_ask"])
    print(f"  {len(df)} valid rows after cleaning")

    # -- STEP 2: Normalization --
    print("\n[STEP 2] Normalizing project names...")
    df["project_name"] = df["project_name"].apply(normalize_name)

    # Deduplicate: keep row with highest ask for each project
    df = df.sort_values("market_ask", ascending=False).drop_duplicates(
        subset="project_name", keep="first"
    )
    print(f"  {len(df)} unique projects after deduplication")

    # -- STEP 3: Raw Storage --
    print("\n[STEP 3] Storing raw ask prices...")
    raw_df = df.copy()
    raw_df["source_file"] = source_file
    raw_df["ingested_at"] = now
    raw_df.to_sql("ask_prices_raw", conn, if_exists="append", index=False)
    conn.commit()
    print(f"  [OK] {len(raw_df)} records inserted into ask_prices_raw")

    # -- STEP 4: Load TruEstimate Projects --
    print("\n[STEP 4] Loading TruEstimate valuation data...")
    tr_df = pd.read_sql(
        "SELECT project_name, truestimate, transaction_count, confidence FROM truestimate_projects",
        conn
    )
    if tr_df.empty:
        conn.close()
        raise RuntimeError(
            "truestimate_projects is empty. Run 'python init_qc_db.py' first."
        )
    tr_df["project_name"] = tr_df["project_name"].apply(normalize_name)
    print(f"  Loaded {len(tr_df)} projects from truestimate_projects")

    # -- STEP 5: Project Matching --
    print("\n[STEP 5] Matching ask prices to TruEstimate projects...")
    merged = pd.merge(df, tr_df, on="project_name", how="left")

    matched   = merged[merged["truestimate"].notna() & (merged["truestimate"] > 0)]
    unmatched = merged[merged["truestimate"].isna()  | (merged["truestimate"] <= 0)]

    print(f"  Matched   : {len(matched)} projects")
    print(f"  Unmatched : {len(unmatched)} projects")

    if not unmatched.empty:
        print("  Unmatched project names (first 10):")
        for name in unmatched["project_name"].head(10).tolist():
            print(f"    - {name}")

    # Persist unmatched to qc_results as NO_MATCH for full auditability
    if not unmatched.empty:
        unmatched_records = unmatched.copy()
        unmatched_records["market_ask_2025"] = None
        unmatched_records["deviation"]       = None
        unmatched_records["qc_label"]        = "NO_MATCH"
        unmatched_records["qc_status"]       = "FAIL"
        unmatched_records["match_confidence"] = 0.0
        unmatched_records["source_file"]     = source_file
        unmatched_records["created_at"]      = now
        unmatched_records[
            ["project_name","market_ask","market_ask_2025","truestimate",
             "deviation","qc_label","qc_status","match_confidence","source_file","created_at"]
        ].to_sql("qc_results", conn, if_exists="append", index=False)
        conn.commit()

    if matched.empty:
        conn.close()
        print("\nWARNING: No projects matched. Pipeline complete (no publishable records).")
        return {
            "total_ingested": len(df),
            "matched": 0,
            "unmatched": len(unmatched),
            "pass": 0,
            "fail": 0,
            "published": 0,
        }

    # -- STEP 6: Feature Engineering --
    print("\n[STEP 6] Computing time-adjusted prices and deviation...")
    m = matched.copy()
    m["market_ask_2025"] = (m["market_ask"] * TIME_NORMALIZATION_FACTOR).round(2)
    m["deviation"] = (
        (m["market_ask_2025"] - m["truestimate"]).abs() / m["truestimate"]
    ).round(6)

    # -- STEP 7 & 8: QC Classification + Validation --
    print("\n[STEP 7/8] Classifying and validating QC status...")
    m["qc_label"]         = m["deviation"].apply(classify_deviation)
    m["qc_status"]        = m["deviation"].apply(
        lambda d: "PASS" if d <= QC_PASS_THRESHOLD else "FAIL"
    )
    m["match_confidence"] = m["confidence"]
    m["source_file"]      = source_file
    m["created_at"]       = now

    pass_df = m[m["qc_status"] == "PASS"]
    fail_df = m[m["qc_status"] == "FAIL"]
    print(f"  PASS : {len(pass_df)}  |  FAIL : {len(fail_df)}")

    label_dist = m["qc_label"].value_counts().to_dict()
    print(f"  Label distribution: {label_dist}")

    # -- STEP 8: Store All QC Results (full audit trail) --
    print("\n[STEP 8] Writing full audit trail to qc_results...")
    audit_cols = [
        "project_name","market_ask","market_ask_2025","truestimate",
        "deviation","qc_label","qc_status","match_confidence","source_file","created_at"
    ]
    m[audit_cols].to_sql("qc_results", conn, if_exists="append", index=False)
    conn.commit()
    print(f"  [OK] {len(m)} records written to qc_results")

    # -- STEP 9: Publish Filter --
    print("\n[STEP 9] Publishing validated records...")
    if not pass_df.empty:
        pub = pass_df[[
            "project_name","truestimate","market_ask","market_ask_2025","deviation","qc_label"
        ]].copy()
        pub["published_at"] = now
        pub.to_sql("publish_ready", conn, if_exists="replace", index=False)
        conn.commit()
        print(f"  [OK] {len(pub)} records published to publish_ready")
    else:
        print("  WARNING: No records passed QC -- publish_ready not updated")

    conn.close()

    summary = {
        "total_ingested"    : len(df),
        "matched"           : len(matched),
        "unmatched"         : len(unmatched),
        "pass"              : len(pass_df),
        "fail"              : len(fail_df),
        "published"         : len(pass_df),
        "label_distribution": label_dist,
        "pass_rate"         : round(len(pass_df) / len(matched) * 100, 1) if len(matched) > 0 else 0,
    }

    print(f"\n{'='*56}")
    print(f"  Pipeline Complete")
    print(f"  Ingested : {summary['total_ingested']}  |  Matched : {summary['matched']}")
    print(f"  PASS     : {summary['pass']}  |  FAIL    : {summary['fail']}")
    print(f"  Pass rate: {summary['pass_rate']}%")
    print(f"  Published: {summary['published']} records to publish_ready")
    print(f"{'='*56}\n")

    return summary


# --- CLI Entry Point ---

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python qc_pipeline.py <path_to_excel_file>")
        print('Example: python qc_pipeline.py "E:\\Truestate\\TruEstimate Data\\Project Ask Prices.xlsx"')
        sys.exit(1)

    file_arg = sys.argv[1]
    result = run_pipeline(file_arg)
    print("Summary:", result)
