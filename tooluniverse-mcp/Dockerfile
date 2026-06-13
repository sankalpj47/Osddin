FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TOOLUNIVERSE_LOG_LEVEL=WARNING

RUN pip install --no-cache-dir tooluniverse

EXPOSE 8000

CMD ["tooluniverse-smcp-server", "--host", "0.0.0.0", "--port", "8000"]