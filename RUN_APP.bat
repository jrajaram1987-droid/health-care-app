@echo off
echo ========================================
echo Healthcare App - Starting...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo After installation:
    echo 1. Close this window
    echo 2. Reopen it
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies (first time only)...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Starting development server...
echo.
echo ========================================
echo App will be available at:
echo http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause



