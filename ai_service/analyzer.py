import torch

def predict_sentiment(text, tokenizer, model):

    inputs = tokenizer(text, return_tensors="pt", truncation=True)

    with torch.no_grad():
        outputs = model(**inputs)

    label = torch.argmax(outputs.logits).item()

    mapping = {
        0: "negative",
        1: "positive",
        2: "neutral"
    }

    return mapping[label]


def predict_topic(text, tokenizer, model):

    inputs = tokenizer(text, return_tensors="pt", truncation=True)

    with torch.no_grad():
        outputs = model(**inputs)

    label = torch.argmax(outputs.logits).item()

    topic_map = {
         0: "Teaching",
    1: "Assignments",
    2: "LMS",
    3: "Labs",
    4: "Assessment",
    5: "CourseMaterials",
    6: "CAT",
    7: "DaySchoolOnline"
    }

    return topic_map.get(label, "Other")