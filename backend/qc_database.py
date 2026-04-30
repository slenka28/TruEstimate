"""
qc_database.py
--------------
Connection manager for truestimate_system.db.
All QC pipeline state is isolated to this database, completely separate
from truestate.db (raw) and truestimate.db (clean transactional).
"""

import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QC_DB = os.path.join(BASE_DIR, "truestimate_system.db")


def get_qc_connection() -> sqlite3.Connection:
    """
    Returns a Row-factory-enabled connection to the QC system database.
    Creates the file if it does not exist (SQLite behaviour).
    """
    conn = sqlite3.connect(QC_DB)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for better read/write concurrency
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn
