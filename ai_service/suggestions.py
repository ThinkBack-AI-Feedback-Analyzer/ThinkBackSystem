import torch

def generate_suggestion(comments, tokenizer, model):

    if not comments:
        return ""

    # Remove duplicates
    comments = list(set(comments))

    # Merge feedbacks
    combined_feedback = " ".join(comments[:5])

    # IMPORTANT:
    # SAME PROMPT STYLE USED DURING TRAINING
    input_text = "generate suggestion: " + combined_feedback

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

    max_new_tokens=250,

    num_beams=5,

    early_stopping=True,

    no_repeat_ngram_size=3,

    repetition_penalty=3.0
)

    suggestion = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    return suggestion