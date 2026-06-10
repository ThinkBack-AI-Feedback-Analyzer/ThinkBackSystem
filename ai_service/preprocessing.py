# =============================================================
# preprocessing.py
# =============================================================

import re


def clean_text(text: str) -> str:
    """
    Cleans raw feedback text for model input.
    - Lowercases
    - Removes special characters (keeps letters, numbers, spaces)
    - Collapses multiple spaces
    - Strips leading/trailing whitespace
    """
    if not text or not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text
