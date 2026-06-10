import requests

url = "http://127.0.0.1:8001/analyze"

data = {
    "texts": [
        "Lectures are boring",
        "Too many assignments",
        "Exams were fair"
    ]
}

response = requests.post(url, json=data)

print(response.json())