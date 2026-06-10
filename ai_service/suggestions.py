import torch


def clean_comments(comments):

    cleaned = []

    for c in comments:

        c = c.strip()

        if len(c.split()) < 3:
            continue

        cleaned.append(c)

    return list(set(cleaned))


def generate_suggestion(
    topic,
    comments,
    tokenizer,
    model
):

    if not comments:
        return ""

    comments = clean_comments(comments)

    if not comments:
        return ""

    combined_feedback = ". ".join(comments[:3])

    input_text = (
        f"generate suggestion: "
        f"{topic}: {combined_feedback}"
    )

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )

    model.eval()

    with torch.no_grad():

        outputs = model.generate(
            **inputs,
            max_new_tokens=80,
            num_beams=5,
            no_repeat_ngram_size=3,
            repetition_penalty=2.5,
            early_stopping=True
        )

    suggestion = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return suggestion