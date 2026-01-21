# Simple Python backend with static HTML
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code and static files
COPY app/ /app/app/
COPY static/ /app/static/

# Create data directory
RUN mkdir -p /data

EXPOSE 8000

ENV DATA_DIR=/data

CMD ["/bin/sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
