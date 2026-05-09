# ThinkBack — Local Dev Starter
# Runs DB + Redis in Docker; backend, celery, and frontend run locally.
# Usage: .\start-dev.ps1

$Root    = $PSScriptRoot
$Venv    = "$Root\.venv\Scripts\Activate.ps1"
$Backend = "$Root\backend"
$Frontend = "$Root\frontend"

Write-Host ""
Write-Host "=== ThinkBack Dev ===" -ForegroundColor Cyan

# 1. Start DB + Redis in Docker (background)
Write-Host "`n[1/4] Starting PostgreSQL + Redis in Docker..." -ForegroundColor Yellow
docker compose -f "$Root\docker-compose.db-only.yml" up -d
if ($LASTEXITCODE -ne 0) { Write-Host "Docker failed. Is Docker Desktop running?" -ForegroundColor Red; exit 1 }

# Wait a moment for DB to be ready
Write-Host "      Waiting 3 s for DB to be ready..."
Start-Sleep -Seconds 3

# 2. Install/update Python packages
Write-Host "`n[2/4] Installing Python requirements..." -ForegroundColor Yellow
& "$Root\.venv\Scripts\pip.exe" install -r "$Backend\requirements.txt" -q

# 3. Run migrations
Write-Host "`n[3/4] Running Django migrations..." -ForegroundColor Yellow
& "$Root\.venv\Scripts\python.exe" "$Backend\manage.py" migrate
if ($LASTEXITCODE -ne 0) { Write-Host "Migration failed. Check DB connection." -ForegroundColor Red; exit 1 }

# 4. Open separate windows
Write-Host "`n[4/4] Opening terminal windows..." -ForegroundColor Yellow

# Django dev server
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
  cd '$Backend'
  & '$Venv'
  Write-Host 'Django dev server' -ForegroundColor Cyan
  python manage.py runserver
"@

# Celery worker (Windows needs --pool=solo)
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
  cd '$Backend'
  & '$Venv'
  Write-Host 'Celery worker' -ForegroundColor Magenta
  celery -A core worker --loglevel=info --pool=solo
"@

# React frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
  cd '$Frontend'
  Write-Host 'React dev server' -ForegroundColor Green
  npm run dev
"@

Write-Host ""
Write-Host "All services started:" -ForegroundColor Green
Write-Host "  Django   -> http://localhost:8000" -ForegroundColor White
Write-Host "  React    -> http://localhost:5173" -ForegroundColor White
Write-Host "  DB       -> localhost:5433 (Docker)" -ForegroundColor White
Write-Host "  Redis    -> localhost:6379 (Docker)" -ForegroundColor White
Write-Host ""
Write-Host "To stop Docker:  docker compose -f docker-compose.db-only.yml down" -ForegroundColor DarkGray
Write-Host ""
