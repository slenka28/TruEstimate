import numpy as np

def compute_truestimate(ppsft_list):
    prices = np.array(ppsft_list)

    if len(prices) == 0:
        return 0.0, 0.0, [0.0, 0.0], 0

    n = len(prices)

    # 🔥 NEW RULE (ADD THIS BLOCK)
    if n <= 4:
        estimate = np.max(prices)
        confidence = (n / 4) * 100   # optional scaling
        rng = [float(np.min(prices)), float(np.max(prices))]

        return round(float(estimate), 2), round(confidence, 2), rng, n

    # --------------------------------
    # EXISTING LOGIC (UNCHANGED BELOW)
    # --------------------------------

    # Step 1
    M1 = np.median(prices)

    # Step 2
    S2 = prices[prices >= M1]
    if len(S2) == 0:
        return round(float(M1), 2), 0.0, [float(M1), float(M1)], 0
        
    M2 = np.median(S2)

    # Step 3 & 4 (IQR)
    Q1 = np.percentile(S2, 25)
    Q3 = np.percentile(S2, 75)
    IQR = Q3 - Q1

    lower = M2 - 1.5 * IQR
    upper = M2 + 1.5 * IQR

    S3 = S2[(S2 >= lower) & (S2 <= upper)]

    # Step 5 (fallback)
    if len(S3) >= 3:
        estimate = np.median(S3)
    else:
        estimate = M2

    # Step 6 (confidence & range)
    confidence = len(S3) / len(prices)
    rng = [float(np.min(S3)), float(np.max(S3))] if len(S3) > 0 else [float(M2), float(M2)]

    return round(float(estimate), 2), round(confidence * 100, 2), rng, len(S3)