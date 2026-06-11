FROM python:3.11-alpine
WORKDIR /app
RUN pip install --no-cache-dir openai requests fastapi uvicorn
COPY node_core.py .
CMD ["python", "node_core.py"]
