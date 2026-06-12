$ErrorActionPreference = "Stop"

# Root of the repo relative to this script
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Stop-Port($Port) {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}

# Stop anything already holding the target ports
Stop-Port 5000
Stop-Port 5173
Stop-Port 8004
Stop-Port 11434

# Start Ollama in CPU mode (avoids GPU runner instability on some Windows setups)
Start-Process -FilePath "cmd" `
    -ArgumentList "/c","set CUDA_VISIBLE_DEVICES=-1 && set OLLAMA_LLM_LIBRARY=cpu && ollama serve" `
    -WorkingDirectory $Root `
    -RedirectStandardOutput (Join-Path $LogDir "ollama.out.log") `
    -RedirectStandardError (Join-Path $LogDir "ollama.err.log") `
    -NoNewWindow

Start-Sleep -Seconds 2

# Start ML service
Start-Process -FilePath "python" `
    -ArgumentList "app.py" `
    -WorkingDirectory (Join-Path $Root "Model/Deploy") `
    -RedirectStandardOutput (Join-Path $LogDir "ml.out.log") `
    -RedirectStandardError (Join-Path $LogDir "ml.err.log") `
    -NoNewWindow

# Start backend API
Start-Process -FilePath "node" `
    -ArgumentList "server.js" `
    -WorkingDirectory (Join-Path $Root "backend") `
    -RedirectStandardOutput (Join-Path $LogDir "backend.out.log") `
    -RedirectStandardError (Join-Path $LogDir "backend.err.log") `
    -NoNewWindow

# Start frontend (Vite dev server)
Start-Process -FilePath "cmd" `
    -ArgumentList "/c","npm run dev -- --host --port 5173" `
    -WorkingDirectory (Join-Path $Root "frontend") `
    -RedirectStandardOutput (Join-Path $LogDir "frontend.out.log") `
    -RedirectStandardError (Join-Path $LogDir "frontend.err.log") `
    -NoNewWindow

Start-Sleep -Seconds 3

Write-Host "Services launched. Logs -> $LogDir" -ForegroundColor Green

# Quick health checks (non-fatal)
try {
    $api = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 2
    Write-Host "API health: $($api.status)" -ForegroundColor Cyan
} catch { Write-Host "API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow }

try {
    $ml = Invoke-RestMethod -Uri "http://localhost:8004/health" -TimeoutSec 2
    Write-Host "ML health: $($ml.status)" -ForegroundColor Cyan
} catch { Write-Host "ML health check failed: $($_.Exception.Message)" -ForegroundColor Yellow }

try {
    $ollama = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2
    Write-Host "Ollama models: $($ollama.models.Count)" -ForegroundColor Cyan
} catch { Write-Host "Ollama check failed: $($_.Exception.Message)" -ForegroundColor Yellow }

try {
    $front = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 2
    Write-Host "Frontend status: $($front.StatusCode)" -ForegroundColor Cyan
} catch { Write-Host "Frontend check failed: $($_.Exception.Message)" -ForegroundColor Yellow }
