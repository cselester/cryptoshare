FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app/ ./app/

# Create directory for SQLite db (ephemeral - see note in deployment guide)
RUN mkdir -p /data

# Expose port
EXPOSE 8080

# Run with uvicorn on Cloud Run's expected port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
