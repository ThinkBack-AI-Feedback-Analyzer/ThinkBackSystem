# =============================================================
# grouping.py
# Groups analyzed feedback results by topic
# =============================================================

from collections import defaultdict
import re
from typing import Callable


ASPECT_KEYWORDS = {
    "Teaching": [
        "lecturer", "teacher", "instructor", "teaching", "explains", "explain",
        "lecture", "delivery", "pace", "concept", "concepts",
    ],
    "Assignment": [
        "assignment", "assignments", "coursework", "submission", "deadline",
        "deadlines", "brief", "marks", "feedback", "rubric", "workload",
        "time-consuming", "time consuming",
    ],
    "Exam": [
        "exam", "exams", "test", "questions", "marking", "results",
        "revision", "paper", "grade", "assessment",
    ],
    "LMS": [
        "lms", "portal", "log in", "login", "system", "platform", "crashes",
        "crash", "slow", "upload", "interface", "online system",
    ],
    "Labs": [
        "lab", "labs", "laboratory", "practical", "equipment", "reagents",
        "computers", "experiment", "practicals",
    ],
    "CourseMaterials": [
        "materials", "slides", "notes", "course pack", "reading list",
        "content", "resources", "course materials",
    ],
    "DaySchoolOnline": [
        "online", "day school", "session", "recorded", "live", "disconnect",
        "remote", "audio", "video", "hybrid",
    ],
}


def _get_answer_text(text: str) -> str:
    answer_match = re.search(r"Answer:\s*(.+)", text, flags=re.IGNORECASE | re.DOTALL)
    if answer_match:
        return answer_match.group(1).strip()

    qa_split = re.split(r"\s+-\s+", text, maxsplit=1)
    if len(qa_split) == 2:
        return qa_split[1].strip()

    return text


def _keyword_pattern(keyword: str) -> re.Pattern:
    escaped = re.escape(keyword).replace(r"\ ", r"\s+")
    return re.compile(rf"(?<!\w){escaped}(?!\w)", flags=re.IGNORECASE)


def _has_topic_keyword(text: str, keywords: list[str]) -> bool:
    return any(_keyword_pattern(keyword).search(text) for keyword in keywords)


def _split_comment_parts(text: str) -> list[str]:
    return [
        part.strip(" .")
        for part in re.split(
            r"[.!?;]+|,\s+|\bbut\b|\bhowever\b|\band\b|\n+",
            text,
            flags=re.IGNORECASE,
        )
        if part.strip(" .")
    ]


def _find_model_matched_parts(
    parts: list[str],
    topic: str,
    topic_predictor: Callable[[str], list[dict]] | None,
) -> list[str]:
    if not topic_predictor:
        return []

    matched = []
    for part in parts:
        predicted_topics = topic_predictor(part)
        if any(predicted.get("topic") == topic for predicted in predicted_topics):
            matched.append(part)

    return matched


def extract_topic_comment(
    text: str,
    topic: str,
    fallback_to_answer: bool = True,
    topic_predictor: Callable[[str], list[dict]] | None = None,
) -> str:
    """
    Returns only the sentence/clause that talks about the given topic.
    Falls back to the answer text when no topic-specific part is found.
    """
    keywords = ASPECT_KEYWORDS.get(topic, [])
    if not text or not keywords:
        return text

    # Suggestion generation should focus on the answer, not the question prompt.
    searchable_text = _get_answer_text(text)

    parts = _split_comment_parts(searchable_text)

    matched = []
    for part in parts:
        if _has_topic_keyword(part, keywords):
            matched.append(part)

    if matched:
        return ". ".join(matched)

    model_matched = _find_model_matched_parts(parts, topic, topic_predictor)
    if model_matched:
        return ". ".join(model_matched)

    return searchable_text if fallback_to_answer else ""


def group_feedback(
    analyzed: list[dict],
    topic_predictor: Callable[[str], list[dict]] | None = None,
) -> dict:
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
                {"text": "LMS keeps crashing", "sentiment": "negative", "confidence": 0.97},
                ...
            ],
            "Teaching": [
                {"text": "lecturer explains well", "sentiment": "positive", "confidence": 0.91},
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

            # Use clause-splitting only to pick the nicest text to display —
            # never to decide whether to KEEP the feedback. When no topic
            # clause is found (e.g. a bare "Yes"/"No" or a short answer whose
            # keyword lived in the question), fall back to the answer text so
            # the response is still counted under the model-detected topic.
            topic_text = extract_topic_comment(
                text,
                topic,
                fallback_to_answer=True,
                topic_predictor=topic_predictor,
            )

            if not topic_text:
                continue

            grouped[topic].append({
                "text":       topic_text,
                "original":   text,
                "sentiment":  aspect.get("sentiment", "neutral"),
                "confidence": aspect.get("confidence", 0.0),
            })

    return dict(grouped)
