# Uprising AI Voice Agency Sync Script
# This script pulls the latest changes from the Uprising AI Voice Agency repository.

$RepoPath = "C:\Users\upris\Downloads\uprising-voice-temp"

if (Test-Path $RepoPath) {
    Write-Host "Updating Uprising AI Voice Agency repository at $RepoPath..." -ForegroundColor Cyan
    Set-Location $RepoPath
    git pull origin main
    Write-Host "Update completed." -ForegroundColor Green
} else {
    Write-Host "Repository not found at $RepoPath. Please run the initial clone first." -ForegroundColor Red
}
