@echo off
echo Starting PashuBazaar Project Components...

echo 1. Starting Backend...
start "Backend Server" cmd /k "cd backend && npm install && npm run dev"

echo 2. Starting Frontend...
start "Frontend Web" cmd /k "cd frontend && npm install && npm run dev"

echo 3. Starting AI Service...
start "AI Service" cmd /k "cd ai-service && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) else (echo No venv found, running globally...) && pip install -r requirements.txt && python app.py"

echo 4. Starting Mobile App...
start "Mobile App" cmd /k "cd mobile && npm install && npx expo start -c"

echo All services are launching in separate windows!
echo Please check each window for any errors that may occur during startup.
