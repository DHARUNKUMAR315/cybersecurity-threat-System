@echo off
REM Adaptive Honeypot System - Setup Script for Windows

cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   Adaptive Honeypot System - Complete Setup
echo ════════════════════════════════════════════════════════════════
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Install main dependencies
echo.
echo [1/3] Installing main server dependencies...
call npm install

REM Install frontend dependencies
echo.
echo [2/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ════════════════════════════════════════════════════════════════
echo   Setup Complete!
echo ════════════════════════════════════════════════════════════════
echo.
echo To start the system:
echo.
echo Terminal 1 - Main Server (Port 3000):
echo   npm run dev
echo.
echo Terminal 2 - Trap Server (Port 3001):
echo   npm run trap
echo.
echo Terminal 3 - Frontend (Port 5173):
echo   cd frontend ^&^& npm run dev
echo.
echo Open: http://localhost:5173
echo.
pause
