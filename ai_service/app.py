# =============================================================
# app.py
# FastAPI main application
# =============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from preprocessing import clean_text
from analyzer import (
    predict_topics,
    predict_absa,
    predict_absa_multiple,
    predict_absa_all,
    generate_suggestion,
    TOPIC_LABELS,
)
from grouping import group_feedback
from utils import remove_duplicates

app = FastAPI(
    title="Student Feedback Analyzer API",
    description="Analyzes student feedback using BERT topic classification, ABSA sentiment, and T5 suggestion generation",
    version="1.0.0",
)


# =============================================================
# INPUT / OUTPUT SCHEMAS
# =============================================================

class AnalyzeRequest(BaseModel):
    course_name: str
    texts: list[str]

class SingleFeedbackRequest(BaseModel):
    feedback: str

class SingleABSARequest(BaseModel):
    feedback: str
    aspect: str

class MultipleABSARequest(BaseModel):
    feedback: str
    aspects: list[str]


# =============================================================
# HEALTH CHECK
# =============================================================

@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Student Feedback Analyzer API is ready",
        "endpoints": [
            "POST /analyze          — full pipeline: topics + sentiment + suggestion",
            "POST /topics           — topic classification only",
            "POST /sentiment        — single aspect sentiment",
            "POST /sentiment/all    — all aspects sentiment",
            "POST /suggestion       — generate suggestion from feedback",
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok"}


# =============================================================
# ENDPOINT 1 — FULL PIPELINE
# POST /analyze
# Input : course_name, list of feedback texts
# Output: per-topic sentiment summary + suggestions
# =============================================================

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    try:
        if not data.texts:
            raise HTTPException(status_code=400, detail="texts list cannot be empty")

        analyzed = []

        # ── Step 1: Analyze each feedback ──────────────────
        for text in data.texts:
            cleaned = clean_text(text)

            if not cleaned:
                continue

            # Predict topics
            topics = predict_topics(cleaned)

            aspects = []
            for topic_data in topics:
                topic = topic_data["topic"]

                # Predict sentiment for each detected topic
                absa_result = predict_absa(cleaned, topic)

                # Only include aspects that have a real sentiment
                if absa_result["sentiment"] != "not_mentioned":
                    aspects.append({
                        "topic":      absa_result["topic"],
                        "sentiment":  absa_result["sentiment"],
                        "confidence": absa_result["confidence"],
                    })

            analyzed.append({
                "text":    text,
                "aspects": aspects,
            })

        if not analyzed:
            raise HTTPException(
                status_code=400,
                detail="No valid feedback texts after cleaning"
            )

        # ── Step 2: Group by topic ──────────────────────────
        grouped = group_feedback(analyzed)

        # ── Step 3: Build response ──────────────────────────
        final_results = []

        for topic, items in grouped.items():

            # All feedback texts for this topic
            all_comments = remove_duplicates([x["text"] for x in items])

            # Only negative comments go to suggestion
            negative_comments = [
                x["text"] for x in items
                if x["sentiment"] == "negative"
            ]

            # Sentiment counts
            sentiment_summary = {
                "positive": sum(1 for x in items if x["sentiment"] == "positive"),
                "neutral":  sum(1 for x in items if x["sentiment"] == "neutral"),
                "negative": sum(1 for x in items if x["sentiment"] == "negative"),
            }

            # Generate suggestion only if there are negative comments
            suggestion = ""
            if negative_comments:
                suggestion = generate_suggestion(topic, negative_comments)

            final_results.append({
                "topic":            topic,
                "feedback_count":   len(items),
                "common_feedback":  all_comments[:5],
                "sentiment_summary": sentiment_summary,
                "suggestion":       suggestion,
            })

        # Sort by feedback count descending
        final_results.sort(key=lambda x: x["feedback_count"], reverse=True)

        return {
            "course":       data.course_name,
            "total_texts":  len(data.texts),
            "topics_found": len(final_results),
            "results":      final_results,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================
# ENDPOINT 2 — TOPIC CLASSIFICATION ONLY
# POST /topics
# Input : single feedback text
# Output: detected topics with confidence
# =============================================================

@app.post("/topics")
def topics_only(data: SingleFeedbackRequest):
    try:
        if not data.feedback.strip():
            raise HTTPException(status_code=400, detail="feedback cannot be empty")

        cleaned = clean_text(data.feedback)
        topics  = predict_topics(cleaned)

        return {
            "feedback": data.feedback,
            "topics":   topics,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================
# ENDPOINT 3 — SINGLE ASPECT SENTIMENT
# POST /sentiment
# Input : feedback text + ONE aspect
# Output: sentiment + confidence scores
# =============================================================

@app.post("/sentiment")
def sentiment_single(data: SingleABSARequest):
    try:
        if not data.feedback.strip():
            raise HTTPException(status_code=400, detail="feedback cannot be empty")

        if not data.aspect.strip():
            raise HTTPException(status_code=400, detail="aspect cannot be empty")

        if data.aspect not in TOPIC_LABELS:
            raise HTTPException(
                status_code=400,
                detail=f"aspect must be one of: {TOPIC_LABELS}"
            )

        cleaned = clean_text(data.feedback)
        result  = predict_absa(cleaned, data.aspect)

        return {
            "feedback":   data.feedback,
            "aspect":     result["topic"],
            "sentiment":  result["sentiment"],
            "confidence": result["confidence"],
            "scores":     result["scores"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================
# ENDPOINT 4 — ALL ASPECTS SENTIMENT
# POST /sentiment/all
# Input : single feedback text
# Output: sentiment for all aspects (skips not mentioned)
# =============================================================

@app.post("/sentiment/all")
def sentiment_all(data: SingleFeedbackRequest):
    try:
        if not data.feedback.strip():
            raise HTTPException(status_code=400, detail="feedback cannot be empty")

        cleaned = clean_text(data.feedback)
        results = predict_absa_all(cleaned)

        # Filter out not_mentioned for cleaner response
        mentioned = [r for r in results if r.get("mentioned", False)]
        not_mentioned = [r["topic"] for r in results if not r.get("mentioned", True)]

        return {
            "feedback":       data.feedback,
            "aspects_found":  len(mentioned),
            "sentiments":     mentioned,
            "not_mentioned":  not_mentioned,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================
# ENDPOINT 5 — MULTIPLE SPECIFIC ASPECTS SENTIMENT
# POST /sentiment/multiple
# Input : feedback text + list of specific aspects
# Output: sentiment for each specified aspect
# =============================================================

@app.post("/sentiment/multiple")
def sentiment_multiple(data: MultipleABSARequest):
    try:
        if not data.feedback.strip():
            raise HTTPException(status_code=400, detail="feedback cannot be empty")

        if not data.aspects:
            raise HTTPException(status_code=400, detail="aspects list cannot be empty")

        # Validate aspects
        invalid = [a for a in data.aspects if a not in TOPIC_LABELS]
        if invalid:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid aspects: {invalid}. Must be from: {TOPIC_LABELS}"
            )

        cleaned = clean_text(data.feedback)
        results = predict_absa_multiple(cleaned, data.aspects)

        return {
            "feedback":   data.feedback,
            "sentiments": results,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================
# ENDPOINT 6 — SUGGESTION GENERATION ONLY
# POST /suggestion
# Input : single feedback text
# Output: generated suggestion
# =============================================================

@app.post("/suggestion")
def suggestion_only(data: SingleFeedbackRequest):
    try:
        if not data.feedback.strip():
            raise HTTPException(status_code=400, detail="feedback cannot be empty")

        cleaned = clean_text(data.feedback)

        # Detect topics first to include in suggestion prompt
        topics  = predict_topics(cleaned)
        topic   = topics[0]["topic"] if topics else "General"

        suggestion = generate_suggestion(topic, [cleaned])

        return {
            "feedback":   data.feedback,
            "topic":      topic,
            "suggestion": suggestion,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
