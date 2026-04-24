from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import sqlite3
from engine import compute_truestimate
from database import get_raw_connection, get_clean_connection

app = FastAPI(title="TruEstimate Search Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search_buildings(query: str = ""):
    if not query:
        return []
    conn = get_raw_connection()
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

@app.get("/search_village")
def search_villages(query: str = ""):
    if not query:
        return []
    conn = get_raw_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT village 
        FROM transactions 
        WHERE village LIKE ? COLLATE NOCASE
        ORDER BY village
        LIMIT 100
    """, (f"%{query}%",))
    rows = cursor.fetchall()
    conn.close()
    return [row["village"] for row in rows if row["village"]]

@app.get("/building/{building_name}")
def get_building_details(building_name: str):
    conn = get_clean_connection()
    cursor = conn.cursor()
    
    # Get building transactions and village name
    cursor.execute("""
        SELECT ppsft, transaction_date as date, area, value, unit_no, config, tower, wing, floor, village
        FROM transactions 
        WHERE building_name = ? COLLATE NOCASE
        ORDER BY date(transaction_date) DESC
    """, (building_name,))
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        raise HTTPException(status_code=404, detail="Building not found")

    transactions = [dict(row) for row in rows]
    village_name = transactions[0]["village"]
    
    # Get village-level transactions for comparison
    village_comparison = []
    if village_name:
        cursor.execute("""
            SELECT ppsft, transaction_date as date
            FROM transactions
            WHERE village = ? AND building_name != ? COLLATE NOCASE
            ORDER BY date(transaction_date) ASC
        """, (village_name, building_name))
        village_rows = [dict(r) for r in cursor.fetchall()]
        
        # Group by month and calculate medians
        from statistics import median
        from collections import defaultdict
        
        project_by_month = defaultdict(list)
        for t in transactions:
            month = t["date"][:7] if t["date"] else None
            if month: project_by_month[month].append(t["ppsft"])
            
        village_by_month = defaultdict(list)
        for t in village_rows:
            month = t["date"][:7] if t["date"] else None
            if month: village_by_month[month].append(t["ppsft"])
            
        all_months = sorted(set(list(project_by_month.keys()) + list(village_by_month.keys())))
        
        for m in all_months:
            village_comparison.append({
                "month": m,
                "project_median": median(project_by_month[m]) if m in project_by_month else None,
                "village_median": median(village_by_month[m]) if m in village_by_month else None
            })

    conn.close()

    ppsft_values = [t["ppsft"] for t in transactions]
    estimate, confidence, rng, filtered_count = compute_truestimate(ppsft_values)

    return {
        "building": building_name.upper(),
        "village": village_name,
        "TruEstimate": estimate,
        "Confidence": confidence,
        "Range": rng,
        "FilteredCount": filtered_count,
        "TotalTransactions": len(ppsft_values),
        "Transactions": transactions,
        "VillageComparison": village_comparison
    }

@app.get("/locations/hierarchy")
def get_locations_hierarchy():
    conn = get_raw_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT district, taluka, hobli, village
        FROM transactions
        WHERE district IS NOT NULL
    """)
    rows = cursor.fetchall()
    conn.close()

    hierarchy = {}
    for row in rows:
        d, t, h, v = row["district"], row["taluka"], row["hobli"], row["village"]
        if not d: continue
        if d not in hierarchy:
            hierarchy[d] = {}
        if not t: continue
        if t not in hierarchy[d]:
            hierarchy[d][t] = {}
        if not h: continue
        if h not in hierarchy[d][t]:
            hierarchy[d][t][h] = []
        if v and v not in hierarchy[d][t][h]:
            hierarchy[d][t][h].append(v)
            
    return hierarchy

@app.get("/global/analytics")
def get_global_analytics(
    district: Optional[str] = None,
    taluka: Optional[str] = None,
    hobli: Optional[str] = None,
    village: Optional[str] = None
):
    conn = get_raw_connection()
    cursor = conn.cursor()
    
    conditions = []
    params = []
    
    if district:
        conditions.append("district = ?")
        params.append(district)
    if taluka:
        conditions.append("taluka = ?")
        params.append(taluka)
    if hobli:
        conditions.append("hobli = ?")
        params.append(hobli)
    if village:
        conditions.append("village = ?")
        params.append(village)
        
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    # KPIs
    kpi_query = f"""
        SELECT 
            COUNT(*) as total_transactions,
            SUM(value) as total_value
        FROM transactions
        {where_clause}
    """
    cursor.execute(kpi_query, params)
    kpis = dict(cursor.fetchone() or {"total_transactions": 0, "total_value": 0})
    
    # Fetch PPSFT for estimation engine
    cursor.execute(f"SELECT ppsft FROM transactions {where_clause}", params)
    ppsft_rows = cursor.fetchall()
    
    prices = [r["ppsft"] for r in ppsft_rows if r["ppsft"]]
    estimate, conf, rng, _ = compute_truestimate(prices) if prices else (0, 0, [0,0], 0)
    
    kpis["median_ppsft"] = estimate
    kpis["confidence"] = conf
    
    # Trend
    trend_query = f"""
        SELECT strftime('%Y-%m', transaction_date) as month, AVG(ppsft) as avg_price, COUNT(*) as count
        FROM transactions
        {where_clause}
        GROUP BY month
        ORDER BY month
    """
    cursor.execute(trend_query, params)
    trend = [dict(r) for r in cursor.fetchall() if dict(r).get('month')]
    
    # Top Transactions
    top_query = f"""
        SELECT building_name, ppsft, value, area, transaction_date as date
        FROM transactions
        {where_clause}
        ORDER BY value DESC
        LIMIT 10
    """
    cursor.execute(top_query, params)
    top_transactions = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        "KPIs": kpis,
        "Trend": trend,
        "TopTransactions": top_transactions,
        "Count": len(prices)
    }

@app.get("/transactions")
def get_all_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = 'asc',
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    village: Optional[str] = None,
    search: Optional[str] = None
):
    conn = get_raw_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * page_size
    
    conditions = []
    params = []
    
    if from_date:
        conditions.append("date(transaction_date) >= date(?)")
        params.append(from_date)
    if to_date:
        conditions.append("date(transaction_date) <= date(?)")
        params.append(to_date)
    if village:
        conditions.append("village LIKE ? COLLATE NOCASE")
        params.append(f"%{village}%")
    if search:
        conditions.append("building_name LIKE ? COLLATE NOCASE")
        params.append(f"%{search}%")
        
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Get total count
    count_query = f"SELECT COUNT(*) as count FROM transactions {where_clause}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()["count"]
    
    # Determine ORDER BY
    order_col = "transaction_date"
    if sort_by == 'price':
        order_col = "ppsft"
    elif sort_by == 'name':
        order_col = "building_name"
        
    order_dir = "ASC" if sort_order == 'asc' else "DESC"
    order_clause = f"ORDER BY {order_col} {order_dir}, transaction_date DESC"
    
    # Get paginated data
    data_query = f"""
        SELECT * FROM transactions
        {where_clause}
        {order_clause}
        LIMIT ? OFFSET ?
    """
    cursor.execute(data_query, params + [page_size, offset])
    
    rows = cursor.fetchall()
    conn.close()
    
    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "transactions": [dict(row) for row in rows]
    }