Write-Host "Starting backend + frontend…" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (!(Test-Path venv)) { python -m venv venv }; .\\venv\\Scripts\\Activate.ps1; pip install -r requirements.txt; python -m uvicorn main:app --reload --port 8000 --reload-exclude 'venv/*' --reload-exclude '*.db'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "Open http://localhost:5173" -ForegroundColor Green

# Made with Bob
