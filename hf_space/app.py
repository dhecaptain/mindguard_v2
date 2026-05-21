import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "kopiyodiana/mindguard-mental-roberta"

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()
print("Model ready.")


def predict(texts: list) -> list:
    """Return P(suicidal) for each text in the input list."""
    if not texts:
        return []
    if isinstance(texts, str):
        texts = [texts]
    inputs = tokenizer(
        texts,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256,
    )
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1)
    return probs[:, 1].tolist()


demo = gr.Interface(
    fn=predict,
    inputs=gr.JSON(label="texts"),
    outputs=gr.JSON(label="probabilities"),
    title="MindGuard Classifier",
    description="Pass a JSON list of strings; returns a list of suicidal-ideation probabilities.",
)

demo.launch()
