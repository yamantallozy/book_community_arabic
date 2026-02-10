# Book Community Startup Script
# This script checks dependencies, verifies environment, and starts both backend and frontend

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Book Community Startup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check Node.js version
Write-Host "[1/6] Checking Node.js version..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Extract version number (e.g., "v20.18.0" -> 20.18)
    $versionMatch = $nodeVersion -match 'v(\d+)\.(\d+)'
    if ($versionMatch) {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        
        # Check if version meets minimum requirements (20.19+ or 22.12+)
        if (($major -eq 20 -and $minor -lt 19) -or ($major -lt 20)) {
            Write-Host "  ⚠ WARNING: Your Node.js version is outdated!" -ForegroundColor Red
            Write-Host "  ⚠ Vite requires Node.js 20.19+ or 22.12+" -ForegroundColor Red
            Write-Host "  ⚠ Please upgrade from https://nodejs.org/" -ForegroundColor Red
            Write-Host ""
        }
    }
} else {
    Write-Host "  ✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if backend .env exists
Write-Host "[2/6] Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path ".\backend\.env") {
    Write-Host "  ✓ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend .env file not found!" -ForegroundColor Red
    Write-Host "  Please create backend\.env with database credentials" -ForegroundColor Red
    exit 1
}

# Check and install backend dependencies
Write-Host "[3/6] Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\backend\node_modules") {
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  → Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location -Path ".\backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location -Path ".."
    Write-Host "  ✓ Backend dependencies installed successfully" -ForegroundColor Green
}

# Check and install frontend dependencies
Write-Host "[4/6] Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\web\node_modules") {
    Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  → Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location -Path ".\web"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location -Path ".."
    Write-Host "  ✓ Frontend dependencies installed successfully" -ForegroundColor Green
}

# Start backend
Write-Host "[5/6] Starting backend server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD\backend
    npm run start
}
Start-Sleep -Seconds 2
Write-Host "  ✓ Backend server starting (Port 5000)..." -ForegroundColor Green

# Start frontend
Write-Host "[6/6] Starting frontend server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD\web
    npm run dev
}
Start-Sleep -Seconds 2
Write-Host "  ✓ Frontend server starting..." -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✓ All servers started!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: Check the output below for the URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        # Get backend output
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        # Get frontend output
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed") {
            Write-Host "Backend server failed!" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -eq "Failed") {
            Write-Host "Frontend server failed!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "Servers stopped." -ForegroundColor Green
}
