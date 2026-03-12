FROM python:3.11-slim

WORKDIR /app

# ✅ Copy ONLY requirements first
COPY requirements.txt .

# ✅ This layer gets CACHED unless requirements.txt changes
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch

RUN pip install --no-cache-dir -r requirements.txt

# ✅ Copy your actual code LAST
COPY . .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]