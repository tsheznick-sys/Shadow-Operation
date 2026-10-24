#!/bin/bash
set -e
echo "Shadow Unified — 1 backend + 1 frontend"
# Backend
pip install -r backend/requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend &
# Frontend
cd frontend && npm install --silent && npm run dev &
wait
