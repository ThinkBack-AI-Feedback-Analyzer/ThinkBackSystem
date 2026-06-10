# =============================================================
# utils.py
# =============================================================


def remove_duplicates(texts: list[str]) -> list[str]:
    """
    Removes duplicate feedback texts while preserving order.
    Uses dict.fromkeys() which maintains insertion order in Python 3.7+
    """
    if not texts:
        return []

    return list(dict.fromkeys(t.strip() for t in texts if t.strip()))
