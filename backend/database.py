import sqlite3

RAW_DB = "truestate.db"
CLEAN_DB = "truestimate.db"

def get_raw_connection():
    conn = sqlite3.connect(RAW_DB)
    conn.row_factory = sqlite3.Row
    return conn

def get_clean_connection():
    conn = sqlite3.connect(CLEAN_DB)
    conn.row_factory = sqlite3.Row
    return conn
