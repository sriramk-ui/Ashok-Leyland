# Ashok Leyland Smart Plant Location DSS - Unified Startup Script
# This script starts both the Python Backend and the Next.js Frontend

Write-Host "--- Starting Ashok Leyland Smart Plant Location DSS ---" -ForegroundColor Yellow

# 1. Start Backend in the background
Write-Host "Starting Backend (Mathematical Engine)..." -ForegroundColor Cyan
$BackendDir = "c:\Users\Saravanan.P\OneDrive\Documents\ANTI_GRAVITY\ASHOK_LEYLAND\backend"
$env:PYTHONPATH = $BackendDir
Start-Process -FilePath "c:\Users\Saravanan.P\OneDrive\Documents\ANTI_GRAVITY\ASHOK_LEYLAND\backend\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $BackendDir -WindowStyle Hidden

# 2. Start Frontend
Write-Host "Starting Frontend (User Interface)..." -ForegroundColor Cyan
$FrontendDir = "c:\Users\Saravanan.P\OneDrive\Documents\ANTI_GRAVITY\ASHOK_LEYLAND\frontend"
cd $FrontendDir
npm run dev
