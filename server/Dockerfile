FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY . /app/server

WORKDIR /app/server

EXPOSE 8000

CMD ["uvicorn", "app.main:socket_app", "--host", "0.0.0.0", "--port", "8000"]
