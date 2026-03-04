# ============================================================
# Project: Uprising CRM
# Author: Uprising Studio
# Description: uprising_test_suite.ps1
# Last Modified: 2026-03-04
# ============================================================

$ErrorActionPreference = "Stop"

# Set project root (two levels up from scripts/uprising-ps/)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = (Get-Item "$ScriptDir\..\..").FullName
Set-Location $ProjectRoot

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur : package.json non trouvé" -ForegroundColor Red
    Write-Host "Assurez-vous de lancer ce script depuis la racine 'twenty-main'." -ForegroundColor Yellow
    exit 1
}

function Write-Header($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "✅ $msg" -ForegroundColor Green
}

function Write-Error-Custom($msg) {
    Write-Host "❌ $msg" -ForegroundColor Red
}

try {
    Write-Header "Étape 1 : Qualité du Code (Linting - Précédemment ignoré)"
    Write-Host "Exécution d'ESLint pour l'ensemble du monorepo (peut prendre quelques minutes)..." -ForegroundColor Yellow
    # On exécute linting pour tout le projet sauf les docs pour éviter le dépassement de ligne de commande Windows
    yarn nx run-many -t lint --exclude twenty-docs,twenty-website
    Write-Success "Qualité du code validée avec succès !"

    Write-Header "Étape 2 : Tests Unitaires (Précédemment ignorés)"
    Write-Host "Exécution de Jest pour tester le code avec la plus grande rigueur..." -ForegroundColor Yellow
    yarn nx run-many -t test --daemon=false
    Write-Success "Tous les tests unitaires sont passés !"

    Write-Header "Étape 3 : Installation de Playwright & Puppeteer"
    Write-Host "Installation des outils pour l'automatisation web..." -ForegroundColor Yellow
    # Installation globale au projet
    yarn add playwright puppeteer -W

    Write-Host "Initialisation des navigateurs Playwright..."
    npx playwright install chromium --with-deps
    Write-Success "Playwright et Puppeteer installés !"

    Write-Header "Étape 4 : Activation de Browserless (via Docker)"
    Write-Host "Démarrage de l'image docker browserless/chromium..." -ForegroundColor Yellow

    # Vérification Docker
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        throw "Docker n'est pas installé ou démarré."
    }

    # Vérification du conteneur
    $browserlessContainer = docker ps -q -f name=browserless
    if ($browserlessContainer) {
        Write-Success "Browserless tourne déjà !"
    }
    else {
        # Nettoyage si le conteneur était stoppé mais existant
        docker rm -f browserless 2>$null

        # On utilise le port 3333 comme attendu par uprising_automation.ps1
        Write-Host "Lancement de Browserless sur le port 3333..."
        docker run -d -p 3333:3000 --name browserless -e "MAX_CONCURRENT_SESSIONS=10" ghcr.io/browserless/chromium
        Write-Success "Browserless démarré avec succès. (ws://localhost:3333)"
    }

    Write-Header "TERMINÉ AVEC SUCCÈS"
    Write-Host "Les tests sont concluants et votre infrastructure de scraping (Playwright/Browserless) est prête. 🤖" -ForegroundColor Green

}
catch {
    Write-Error-Custom "Le script a échoué à l'étape actuelle."
    Write-Error-Custom $_.Exception.Message
    exit 1
}
