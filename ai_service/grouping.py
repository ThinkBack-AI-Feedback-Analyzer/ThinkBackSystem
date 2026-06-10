# =============================================================
# grouping.py
# Groups analyzed feedback results by topic
# =============================================================

from collections import defaultdict


def group_feedback(analyzed: list[dict]) -> dict:
    """
    Groups a list of analyzed feedback items by topic.

    Input format:
        [
            {
                "text": "LMS keeps crashing...",
                "aspects": [
                    {"topic": "LMS", "sentiment": "negative", "confidence": 0.97},
                    {"topic": "Teaching", "sentiment": "positive", "confidence": 0.91},
                ]
            },
            ...
        ]

    Output format:
        {
            "LMS": [
                {"text": "LMS keeps crashing...", "sentiment": "negative", "confidence": 0.97},
                ...
            ],
            "Teaching": [
                {"text": "LMS keeps crashing...", "sentiment": "positive", "confidence": 0.91},
                ...
            ],
        }
    """
    grouped = defaultdict(list)

    for item in analyzed:
        text    = item.get("text", "")
        aspects = item.get("aspects", [])

        for aspect in aspects:
            topic = aspect.get("topic", "")

            if not topic:
                continue

            grouped[topic].append({
                "text":       text,
                "sentiment":  aspect.get("sentiment", "neutral"),
                "confidence": aspect.get("confidence", 0.0),
            })

    return dict(grouped)
