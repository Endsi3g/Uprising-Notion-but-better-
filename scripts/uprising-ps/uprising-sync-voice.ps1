# ============================================================
# Project: Uprising CRM
# Author: Uprising Studio
# Description: uprising-sync-voice.ps1
# Last Modified: 2026-03-04
# ============================================================

$RepoPath = "C:\Users\upris\Downloads\uprising-voice-temp"

if (Test-Path $RepoPath) {
    Write-Host "Updating Uprising AI Voice Agency repository at $RepoPath..." -ForegroundColor Cyan
    Set-Location $RepoPath
    git pull origin main
    Write-Host "Update completed." -ForegroundColor Green
} else {
    Write-Host "Repository not found at $RepoPath. Please run the initial clone first." -ForegroundColor Red
}
