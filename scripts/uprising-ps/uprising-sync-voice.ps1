param(
    [string]$VoiceRepoPath = $env:UPRISING_VOICE_PATH
)

# ============================================================
# Project: Uprising CRM
# Author: Uprising Studio
# Description: uprising-sync-voice.ps1
# Last Modified: 2026-03-04
# ============================================================

# Default path if not provided via param or env var
if ([string]::IsNullOrWhiteSpace($VoiceRepoPath)) {
    $VoiceRepoPath = Join-Path $HOME "Downloads\uprising-voice-temp"
}

if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

if (Test-Path $VoiceRepoPath) {
    Write-Host "Updating Uprising AI Voice Agency repository at $VoiceRepoPath..." -ForegroundColor Cyan
    $currentDir = Get-Location
    try {
        Set-Location $VoiceRepoPath
        git pull origin main
        Write-Host "Update completed." -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to update repository: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Set-Location $currentDir
    }
} else {
    Write-Host "Repository not found at $VoiceRepoPath." -ForegroundColor Yellow
    Write-Host "Please ensure the path is correct or run the initial clone." -ForegroundColor Gray
    Write-Host "You can set the path via: .\uprising-sync-voice.ps1 -VoiceRepoPath 'C:\path\to\repo'" -ForegroundColor Gray
}
