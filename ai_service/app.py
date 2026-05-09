from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from preprocessing import clean_text
from analyzer import predict_sentiment, predict_topic
from grouping import group_feedback
from suggestions import generate_suggestion
from utils import remove_duplicates

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    T5Tokenizer,
    T5ForConditionalGeneration
)

app = FastAPI()

# LOAD MODELS
sent_tokenizer = AutoTokenizer.from_pretrained("./models/bert_sentiment")
sent_model = AutoModelForSequenceClassification.from_pretrained("./models/bert_sentiment")

topic_tokenizer = AutoTokenizer.from_pretrained("./models/bert_topic")
topic_model = AutoModelForSequenceClassification.from_pretrained("./models/bert_topic")

t5_tokenizer = T5Tokenizer.from_pretrained("./models/t5_model")

t5_model = T5ForConditionalGeneration.from_pretrained("./models/t5_model")


class InputData(BaseModel):
    course_name: str
    texts: list[str]


@app.post("/analyze")
def analyze(data: InputData):

    try:

        analyzed = []

        for text in data.texts:

            cleaned = clean_text(text)

            sentiment = predict_sentiment(
                cleaned,
                sent_tokenizer,
                sent_model
            )

            topic = predict_topic(
                cleaned,
                topic_tokenizer,
                topic_model
            )

            analyzed.append({
                "text": text,
                "sentiment": sentiment,
                "topic": topic
            })

        grouped = group_feedback(analyzed)

        final_results = []

        for topic, items in grouped.items():

            comments = [x["text"] for x in items]

            comments = remove_duplicates(comments)

            negative_comments = [
                x["text"]
                for x in items
                if x["sentiment"] == "negative"
            ]

            suggestion = ""

            if negative_comments:

                suggestion = generate_suggestion(
    negative_comments,
    t5_tokenizer,
    t5_model
)

            sentiment_summary = {
                "positive": sum(
                    1 for x in items
                    if x["sentiment"] == "positive"
                ),

                "neutral": sum(
                    1 for x in items
                    if x["sentiment"] == "neutral"
                ),

                "negative": sum(
                    1 for x in items
                    if x["sentiment"] == "negative"
                )
            }

            final_results.append({
                "topic": topic,
                "feedback_count": len(items),
                "common_feedback": comments[:5],
                "sentiment_summary": sentiment_summary,
                "suggestion": suggestion
            })

        return {
    "course": data.course_name,
    "results": final_results
}

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))