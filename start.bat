@echo off
echo =====================================
echo   Book Community Startup Script
echo =====================================
echo.

echo [1/6] Checking Node.js version...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   X Node.js is not installed!
    echo   Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   OK Node.js version: %NODE_VERSION%
echo.

echo [2/6] Checking backend configuration...
if not exist "backend\.env" (
    echo   X Backend .env file not found!
    echo   Please create backend\.env with database credentials
    pause
    exit /b 1
)
echo   OK Backend .env file found
echo.

echo [3/6] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo   Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo   X Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
)
echo   OK Backend dependencies installed
echo.

echo [4/6] Checking frontend dependencies...
if not exist "web\node_modules" (
    echo   Installing frontend dependencies...
    cd web
    call npm install
    if %errorlevel% neq 0 (
        echo   X Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)
echo   OK Frontend dependencies installed
echo.

echo [5/6] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul
echo   OK Backend server starting (Port 5000)...
echo.

echo [6/6] Starting frontend server...
start "Frontend Server" cmd /k "cd web && npm run dev"
timeout /t 2 /nobreak >nul
echo   OK Frontend server starting...
echo.

echo =====================================
echo   OK All servers started!
echo =====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: Check the Frontend Server window for URL
echo.
echo Press any key to exit (servers will keep running)
pause >nul
