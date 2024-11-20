#!/bin/bash

echo "Starting frontend..."
cd frontend
npm install
npm run dev &

echo "Starting backend..."
cd ../backend

if [[ "$OS" != "Windows_NT" ]]; then
  kill -9 $(lsof -t -i:3000)
fi

npm install
npm run dev &

echo "Starting whisper..."
cd ../whisper

source venv/bin/activate


pip install -r requirements.txt
cd ..
uvicorn whisper.api:app --reload

wait
