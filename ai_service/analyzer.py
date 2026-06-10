# =============================================================
# analyzer.py
# Loads BERT Topic, BERT Sentiment, T5 Suggestion models
# Compatible with FastAPI — uses absolute paths
# =============================================================

import os
import json
import warnings
import numpy as np
import torch
import torch.nn as nn

from transformers import (
    BertTokenizer,
    BertModel,
    T5TokenizerFast,
    T5ForConditionalGeneration,
)
from transformers.modeling_outputs import SequenceClassifierOutput

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────
# PATHS — absolute, always works regardless of where uvicorn
# is launched from
# ─────────────────────────────────────────────────────────────
BASE_DIR            = os.path.dirname(os.path.abspath(__file__))
TOPIC_MODEL_DIR     = os.path.join(BASE_DIR, "models", "bert_topic_model")
SENTIMENT_MODEL_DIR = os.path.join(BASE_DIR, "models", "bert_sentiment_model")
T5_MODEL_DIR        = os.path.join(BASE_DIR, "models", "t5_suggestion_model")

# ─────────────────────────────────────────────────────────────
# VERIFY FOLDERS EXIST BEFORE LOADING
# ─────────────────────────────────────────────────────────────
for name, path in [
    ("bert_topic_model",     TOPIC_MODEL_DIR),
    ("bert_sentiment_model", SENTIMENT_MODEL_DIR),
    ("t5_suggestion_model",  T5_MODEL_DIR),
]:
    if not os.path.isdir(path):
        raise FileNotFoundError(
            f"\n[ERROR] {name} folder not found at:\n  {path}\n"
            f"Extract the downloaded zip into:\n  {os.path.join(BASE_DIR, 'models')}\n"
            f"Expected structure:\n"
            f"  ai_service/models/{name}/config.json\n"
            f"  ai_service/models/{name}/vocab.txt  (or spiece.model for T5)\n"
            f"  ai_service/models/{name}/pytorch_model.bin\n"
        )

DEVICE  = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MAX_LEN = 128

print(f"[analyzer] Device: {DEVICE}")
print(f"[analyzer] Topic model     : {TOPIC_MODEL_DIR}")
print(f"[analyzer] Sentiment model : {SENTIMENT_MODEL_DIR}")
print(f"[analyzer] T5 model        : {T5_MODEL_DIR}")

# =============================================================
# SECTION 1 — BERT MULTI-LABEL TOPIC MODEL
# =============================================================

# ── Load config ──────────────────────────────────────────────
with open(os.path.join(TOPIC_MODEL_DIR, "config_multilabel.json"), "r") as f:
    _topic_cfg      = json.load(f)

TOPIC_LABELS      = _topic_cfg["labels"]
TOPIC_THRESHOLDS  = _topic_cfg["thresholds"]
NUM_TOPIC_LABELS  = len(TOPIC_LABELS)

# ── Model class — must match training exactly ────────────────
class BERTMultiLabelClassifier(nn.Module):
    def __init__(self, num_labels, bert_path):
        super().__init__()
        self.bert       = BertModel.from_pretrained(bert_path)
        hidden          = self.bert.config.hidden_size
        self.dropout    = nn.Dropout(0.3)
        self.classifier = nn.Sequential(
            nn.Linear(hidden, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_labels),
        )

    def forward(self, input_ids=None, attention_mask=None,
                token_type_ids=None, labels=None):
        outputs    = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
        )
        cls_output = self.dropout(outputs.last_hidden_state[:, 0, :])
        logits     = self.classifier(cls_output)
        loss       = None
        if labels is not None:
            loss   = nn.BCEWithLogitsLoss()(logits, labels.float())
        return SequenceClassifierOutput(loss=loss, logits=logits)

# ── Load tokenizer ───────────────────────────────────────────
topic_tokenizer = BertTokenizer.from_pretrained(TOPIC_MODEL_DIR)

# ── Load model + classifier head ────────────────────────────
topic_model = BERTMultiLabelClassifier(NUM_TOPIC_LABELS, TOPIC_MODEL_DIR)
topic_model.classifier.load_state_dict(
    torch.load(
        os.path.join(TOPIC_MODEL_DIR, "classifier_head.pt"),
        map_location=DEVICE,
        weights_only=True,
    )
)
topic_model.to(DEVICE).eval()
print("[analyzer] Topic model loaded ✓")


# =============================================================
# SECTION 2 — BERT SENTIMENT (ABSA) MODEL
# =============================================================

SENTIMENTS    = ["positive", "negative", "neutral"]
IDX2SENTIMENT = {i: s for i, s in enumerate(SENTIMENTS)}
NUM_SENTIMENTS = len(SENTIMENTS)

# ── Model class — must match training exactly ────────────────
class BERTSentimentClassifier(nn.Module):
    def __init__(self, num_labels, bert_path):
        super().__init__()
        self.bert       = BertModel.from_pretrained(bert_path)
        hidden          = self.bert.config.hidden_size
        self.dropout    = nn.Dropout(0.3)
        self.classifier = nn.Sequential(
            nn.Linear(hidden, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_labels),
        )

    def forward(self, input_ids=None, attention_mask=None,
                token_type_ids=None, labels=None):
        outputs    = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
        )
        cls_output = self.dropout(outputs.last_hidden_state[:, 0, :])
        logits     = self.classifier(cls_output)
        loss       = None
        if labels is not None:
            loss   = nn.CrossEntropyLoss()(logits, labels)
        return SequenceClassifierOutput(loss=loss, logits=logits)

# ── Load tokenizer ───────────────────────────────────────────
sent_tokenizer = BertTokenizer.from_pretrained(SENTIMENT_MODEL_DIR)

# ── Load model + classifier head ────────────────────────────
sent_model = BERTSentimentClassifier(NUM_SENTIMENTS, SENTIMENT_MODEL_DIR)
sent_model.classifier.load_state_dict(
    torch.load(
        os.path.join(SENTIMENT_MODEL_DIR, "classifier_head.pt"),
        map_location=DEVICE,
        weights_only=True,
    )
)
sent_model.to(DEVICE).eval()
print("[analyzer] Sentiment model loaded ✓")


# =============================================================
# SECTION 3 — T5 SUGGESTION GENERATION MODEL
# =============================================================

t5_tokenizer = T5TokenizerFast.from_pretrained(T5_MODEL_DIR)
t5_model     = T5ForConditionalGeneration.from_pretrained(T5_MODEL_DIR).to(DEVICE)
t5_model.eval()
print("[analyzer] T5 model loaded ✓")

TASK_PREFIX = "generate suggestion: "

# =============================================================
# ASPECT KEYWORD MAP
# Used by predict_all_aspects() to skip aspects not mentioned
# =============================================================
ASPECT_KEYWORDS = {
    "Teaching":        ["lecturer","teacher","instructor","teaching","explains","lecture","delivery","pace","session"],
    "Assignment":      ["assignment","coursework","submission","deadline","brief","marks","feedback","rubric","workload"],
    "Exam":            ["exam","test","questions","marking","results","revision","paper","grade","assessment"],
    "LMS":             ["lms","portal","log in","system","platform","crashes","slow","upload","interface","online system"],
    "Labs":            ["lab","laboratory","practical","equipment","reagents","computers","experiment","practicals"],
    "CourseMaterials": ["materials","slides","notes","course pack","reading list","content","resources","course materials"],
    "DaySchoolOnline": ["online","day school","session","recorded","live","disconnect","remote","audio","video","hybrid"],
}


# =============================================================
# INFERENCE FUNCTIONS
# =============================================================

def predict_topics(text: str) -> list[dict]:
    """
    Multi-label topic classification.
    Returns list of detected topics with confidence scores.

    Example:
        predict_topics("LMS crashes and lecturer is unclear")
        → [{"topic": "LMS", "confidence": 0.97},
           {"topic": "Teaching", "confidence": 0.88}]
    """
    topic_model.eval()
    enc = topic_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LEN,
    )
    enc = {k: v.to(DEVICE) for k, v in enc.items()}

    with torch.no_grad():
        outputs = topic_model(**enc)

    probs = torch.sigmoid(outputs.logits).squeeze(0).cpu().numpy()

    results = []
    for i, prob in enumerate(probs):
        label     = TOPIC_LABELS[i]
        threshold = TOPIC_THRESHOLDS.get(label, 0.5)
        if prob >= threshold:
            results.append({
                "topic":      label,
                "confidence": round(float(prob), 4),
            })

    # Fallback: return highest scoring label if nothing passes
    if not results:
        max_idx = int(np.argmax(probs))
        results = [{
            "topic":      TOPIC_LABELS[max_idx],
            "confidence": round(float(probs[max_idx]), 4),
        }]

    return results


def predict_absa(text: str, topic: str) -> dict:
    """
    Aspect-Based Sentiment Analysis.
    Pass ONE topic at a time — never multiple in one string.

    Example:
        predict_absa("LMS keeps crashing", "LMS")
        → {"topic": "LMS", "sentiment": "negative", "confidence": 0.98}
    """
    sent_model.eval()
    enc = sent_tokenizer(
        text,
        topic,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LEN,
    )
    enc = {k: v.to(DEVICE) for k, v in enc.items()}

    with torch.no_grad():
        outputs = sent_model(**enc)

    probs    = torch.softmax(outputs.logits, dim=-1).squeeze(0).cpu().numpy()
    pred_idx = int(np.argmax(probs))

    return {
        "topic":      topic,
        "sentiment":  IDX2SENTIMENT[pred_idx],
        "confidence": round(float(probs[pred_idx]), 4),
        "scores": {
            IDX2SENTIMENT[i]: round(float(probs[i]), 4)
            for i in range(NUM_SENTIMENTS)
        },
    }


def predict_absa_multiple(text: str, topics: list[str]) -> list[dict]:
    """
    Predict sentiment for a specific list of topics.
    Each topic is predicted separately.

    Example:
        predict_absa_multiple("LMS slow but teaching good", ["LMS","Teaching"])
        → [{"topic":"LMS","sentiment":"negative",...},
           {"topic":"Teaching","sentiment":"positive",...}]
    """
    return [predict_absa(text, topic) for topic in topics]


def predict_absa_all(text: str) -> list[dict]:
    """
    Predict sentiment for all aspects.
    Only predicts aspects that are actually mentioned in the text.
    Aspects not mentioned are returned as 'not_mentioned'.

    Example:
        predict_absa_all("The LMS is slow and lecturer rushes")
        → [{"topic":"Teaching","sentiment":"negative",...},
           {"topic":"LMS","sentiment":"negative",...},
           {"topic":"Assignment","sentiment":"not_mentioned",...}, ...]
    """
    text_lower = text.lower()
    results    = []

    for topic in TOPIC_LABELS:
        keywords  = ASPECT_KEYWORDS.get(topic, [])
        mentioned = any(kw in text_lower for kw in keywords)

        if mentioned:
            result             = predict_absa(text, topic)
            result["mentioned"] = True
            results.append(result)
        else:
            results.append({
                "topic":      topic,
                "sentiment":  "not_mentioned",
                "confidence": 0.0,
                "mentioned":  False,
            })

    return results


def generate_suggestion(
    topic: str,
    comments: list[str],
) -> str:
    """
    Generates a descriptive, actionable improvement suggestion
    for a topic based on negative feedback comments.
    Uses the same input format as the training dataset.
    """

    # ── Topic-specific fallback descriptions ─────────────────
    # Used when student feedback is very short (1-3 words)
    # so T5 has enough context to generate a relevant suggestion
    topic_fallback = {
        "Teaching": "the lecturer does not engage students effectively and the delivery quality needs improvement.",
        "Assignment": "students are overwhelmed by the assignment workload and the instructions are not clear enough.",
        "Exam": "students find the exam too difficult and questions do not reflect the content taught in lectures.",
        "LMS": "students cannot access materials reliably and the learning management system is not functioning properly.",
        "Labs": "lab sessions are too difficult and the equipment and support available to students are inadequate.",
        "CourseMaterials": "course materials are outdated, poorly organised, and do not support student learning effectively.",
        "DaySchoolOnline": "online sessions are not engaging and students are experiencing technical difficulties during delivery.",
    }

    # ── Clean and combine feedback ────────────────────────────
    cleaned = list({
        c.strip() for c in comments
        if c.strip()
    })

    if not cleaned:
        return ""

    # Build combined feedback string
    # If feedback is very short, enrich it with topic context
    combined_raw = ". ".join(cleaned[:3])

    if len(combined_raw.split()) < 6:
        # Short feedback — add topic fallback so T5 has enough signal
        feedback_text = (
            f"Student feedback indicates that {topic_fallback.get(topic, combined_raw)} "
            f"Specifically students said: {combined_raw}."
        )
    else:
        feedback_text = f"Student feedback indicates that {combined_raw}."

    # ── Format exactly like training data ─────────────────────
    # Training input format: "Topic: X. Student feedback indicates that..."
    # This is critical — T5 learned from this exact format
    input_text = f"generate suggestion: Topic: {topic}. {feedback_text}"

    # ── Tokenize with higher max_length for t5-base ───────────
    t5_model.eval()
    inputs = t5_tokenizer(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=192,          # higher than MAX_LEN — prompt needs space
    ).to(DEVICE)

    # ── Generate with t5-base optimised settings ──────────────
    with torch.no_grad():
        outputs = t5_model.generate(
            **inputs,
            max_new_tokens       = 150,   # allow longer output
            num_beams            = 4,     # beam search for coherence
            no_repeat_ngram_size = 3,     # prevents repetition
            repetition_penalty   = 1.4,   # penalise repeated phrases
            length_penalty       = 1.0,   # neutral — don't force length
            early_stopping       = True,
        )

    suggestion = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)

    # ── Post-process ──────────────────────────────────────────
    suggestion = suggestion.strip()

    # Ensure ends with full stop
    if suggestion and not suggestion.endswith((".", "!", "?")):
        # Cut at last complete sentence
        last_period = max(
            suggestion.rfind("."),
            suggestion.rfind("!"),
            suggestion.rfind("?"),
        )
        if last_period > len(suggestion) // 2:
            suggestion = suggestion[:last_period + 1]
        else:
            suggestion = suggestion + "."

    return suggestion
