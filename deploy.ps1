$ErrorActionPreference = "Stop"

# Ensure script runs in its own directory
Set-Location $PSScriptRoot

if (-Not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in the system PATH."
    exit 1
}

if (-Not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item -Path ".env.example" -Destination ".env"
    } else {
        Write-Host "Warning: No .env or .env.example found. The deployment may fail if environment variables are required." -ForegroundColor Red
    }
}

Write-Host "Starting Uprising Cofounder Deployment..." -ForegroundColor Cyan

Write-Host "Building Docker containers..." -ForegroundColor Cyan
try {
    docker compose build
} catch {
    Write-Error "Failed to build Docker containers."
    exit 1
}

Write-Host "Starting services..." -ForegroundColor Cyan
try {
    docker compose up -d
} catch {
    Write-Error "Failed to start Docker services."
    exit 1
}

Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "App successfully deployed!" -ForegroundColor Green
Write-Host "Frontend is running on port 80 (http://localhost:80)" -ForegroundColor Green
Write-Host "Backend API is running on port 3000" -ForegroundColor Green
Write-Host "Ollama is running on port 11434" -ForegroundColor Green

Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "App successfully deployed!" -ForegroundColor Green
Write-Host "Frontend is running on port 80 (http://localhost:80)" -ForegroundColor Green
Write-Host "Backend API is running on port 3000" -ForegroundColor Green
Write-Host "Ollama is running on port 11434" -ForegroundColor Green
