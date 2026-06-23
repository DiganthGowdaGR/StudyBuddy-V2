FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && pip install -r requirements.txt

COPY . .
RUN mkdir -p uploads vectorstore

# Railway passes the port dynamically via the PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
