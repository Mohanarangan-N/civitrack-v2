FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML dataset generator & server application
COPY ml /app/ml
COPY server /app/server

WORKDIR /app/server

# Expose FastAPI port
EXPOSE 8000

# Train ML model on startup if needed and run Uvicorn
CMD ["sh", "-c", "python ../ml/train_and_eval.py && uvicorn app.main:socket_app --host 0.0.0.0 --port 8000"]
