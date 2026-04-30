import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DB = os.path.join(BASE_DIR, "truestate.db")
CLEAN_DB = os.path.join(BASE_DIR, "truestimate.db")

def get_raw_connection():
    conn = sqlite3.connect(RAW_DB)
    conn.row_factory = sqlite3.Row
    return conn

def get_clean_connection():
    conn = sqlite3.connect(CLEAN_DB)
    conn.row_factory = sqlite3.Row
    return conn
