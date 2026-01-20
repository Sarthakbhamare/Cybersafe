@echo off
title CyberSafe - All Services
color 0A

echo ========================================
echo    CyberSafe Full Stack Launcher
echo ========================================
echo.

:: Kill any existing processes on our ports
echo [1/6] Stopping existing services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000.*LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173.*LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8004.*LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

:: Start ML Service (Python FastAPI on port 8004)
echo [2/6] Starting ML Service (port 8004)...
start "ML Service" cmd /k "cd /d e:\CyberSafe1\Model\Deploy && python app.py"
timeout /t 3 /nobreak >nul

:: Start Backend API (Node.js on port 5000)
echo [3/6] Starting Backend API (port 5000)...
start "Backend API" cmd /k "cd /d e:\CyberSafe1\backend && node server.js"
timeout /t 3 /nobreak >nul

:: Start Frontend (Vite dev server on port 5173)
echo [4/6] Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd /d e:\CyberSafe1\frontend && npm run dev -- --host --port 5173"
timeout /t 5 /nobreak >nul

:: Verify services
echo [5/6] Verifying services...
echo.

:: Check ports
netstat -aon | findstr ":5000.*LISTENING" >nul && (echo    [OK] Backend API on port 5000) || (echo    [FAIL] Backend not running)
netstat -aon | findstr ":8004.*LISTENING" >nul && (echo    [OK] ML Service on port 8004) || (echo    [FAIL] ML Service not running)
netstat -aon | findstr ":5173.*LISTENING" >nul && (echo    [OK] Frontend on port 5173) || (echo    [FAIL] Frontend not running)

echo.
echo [6/6] Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173/api-tool

echo.
echo ========================================
echo    All services started!
echo    Frontend: http://localhost:5173
echo    API:      http://localhost:5000
echo    ML:       http://localhost:8004
echo ========================================
echo.
echo Press any key to close this window (services will keep running)...
pause >nul
