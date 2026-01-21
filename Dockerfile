# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app/ /app/app/

# Copy built frontend from builder stage
COPY --from=frontend-builder /frontend/build /app/static

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 8000

# Environment variable for database path
ENV DATA_DIR=/data

# Run with uvicorn
CMD ["/bin/sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
