@echo off

echo Starting frontend...
cd frontend
call npm install
start cmd /k "npm run dev"

cd ..

echo Starting backend...
cd backend
call npm install
call npx kill-port 3000
start cmd /k "npm run dev"

cd ..

echo Starting whisper...
cd whisper
call venv\Scripts\activate
pip install -r requirements.txt

cd ..
echo uvicorn whisper.api:app --reload
call uvicorn whisper.api:app --reload

PAUSE