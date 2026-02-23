# ============================================================
# Uprising CRM — Automation Script (Setup, Test, Git)
# ============================================================
# Ce script automatise l'installation, les tests et le git.
# Usage: .\uprising_automation.ps1
# ============================================================

$ErrorActionPreference = "Stop"

# Force current directory to be the script's directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Verify we are in the correct root (look for package.json)
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur : package.json non trouvé dans $ScriptDir" -ForegroundColor Red
    Write-Host "Veuillez vous assurer de lancer le script depuis la racine du projet 'twenty-main'." -ForegroundColor Yellow
    exit 1
}

function Write-Header($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "✅ $msg" -ForegroundColor Green
}

function Write-Warning-Custom($msg) {
    Write-Host "⚠️ $msg" -ForegroundColor Yellow
}

function Write-Error-Custom($msg) {
    Write-Host "❌ $msg" -ForegroundColor Red
}

function Invoke-NativeCommand($Command) {
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        throw "La commande a échoué avec le code de sortie $LASTEXITCODE : $Command"
    }
}

try {
    Write-Header "Étape 1 : Installation des dépendances (Yarn)"
    if (Get-Command "yarn" -ErrorAction SilentlyContinue) {
        # --json might avoid some interactive prompts, but --immutable is better if we have a lockfile.
        # However, we want to allow new installs on the user's machine.
        # We add --no-immutable to ensure it updates if needed, and try to force non-interactive.
        yarn install --no-immutable
        Write-Success "Dépendances installées."
    }
    else {
        Write-Error-Custom "Yarn n'est pas installé. Veuillez l'installer (Yarn 4+ requis)."
        exit 1
    }

    Write-Header "Étape 2 : Vérification de la Qualité du Code (Linting)"
    # We use --no-daemon to avoid issues if the daemon is stuck
    Invoke-NativeCommand "yarn nx run-many -t lint --no-daemon"
    Write-Success "Qualité du code vérifiée."

    Write-Header "Étape 3 : Compilation du Projet (Build)"
    # Some builds might fail (like canvas on Windows), we want to proceed if the core server/front build
    Invoke-NativeCommand "yarn nx run-many -t build --exclude twenty-docs --no-daemon"
    Write-Success "Compilation réussie (certains packages optionnels peuvent avoir été ignorés)."

    Write-Header "Étape 4 : Exécution des Tests Unitaires"
    Invoke-NativeCommand "yarn nx run-many -t test"
    Write-Success "Tous les tests sont passés."

    Write-Header "Étape 5 : Vérification de l'Infrastructure"
    # Vérification .env
    if (Test-Path ".env") {
        Write-Success "Fichier .env présent."
    }
    else {
        Write-Warning-Custom "Fichier .env manquant. Utilisez .env.uprising comme modèle."
    }

    # Vérification Ollama
    try {
        $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction SilentlyContinue
        Write-Success "Ollama est en ligne et accessible."
    }
    catch {
        Write-Warning-Custom "Ollama n'est pas détecté (http://localhost:11434). Assurez-vous qu'il tourne."
    }

    # Vérification Browserless
    try {
        # Browserless utilise WebSocket, on teste juste le port
        $t = New-Object Net.Sockets.TcpClient
        $t.Connect("localhost", 3333)
        $t.Close()
        Write-Success "Browserless est détecté sur le port 3333."
    }
    catch {
        Write-Warning-Custom "Browserless n'est pas détecté sur le port 3333."
    }

    Write-Header "Étape 6 : Accès à l'Application"
    if (Test-Path ".env") {
        $envVars = Get-Content ".env"
        $frontendUrl = $envVars | Where-Object { $_ -match "^FRONTEND_URL=" } | ForEach-Object { $_.Split("=")[1].Trim() }
        if ($frontendUrl) {
            Write-Host "Ouverture de l'application : $frontendUrl" -ForegroundColor Cyan
            Start-Process $frontendUrl
            Write-Success "Navigateur lancé."
        }
        else {
            Write-Warning-Custom "FRONTEND_URL non trouvé dans le fichier .env."
        }
    }
    else {
        Write-Warning-Custom "Fichier .env manquant. Impossible d'identifier l'URL."
    }

    Write-Header "Étape 7 : Automatisation Git (Commit & Push)"
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Changements détectés. Préparation du commit..."
        git add .
        $commitMsg = "chore: automation sync - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        git commit -m $commitMsg
        Write-Success "Changements commités : $commitMsg"
    }
    else {
        Write-Host "Aucun changement à commiter."
    }

    # Gestion du Push
    $remotes = git remote
    if ($remotes) {
        Write-Host "Push vers l'origine..."
        git push
        Write-Success "Code poussé vers le dépôt distant."
    }
    else {
        Write-Warning-Custom "Aucun dépôt distant configuré. Étape Push ignorée."
    }

    Write-Header "TERMINÉ AVEC SUCCÈS"
    Write-Host "Uprising CRM est prêt à l'emploi. 🚀" -ForegroundColor Green

}
catch {
    Write-Error-Custom "Le script a échoué à l'étape actuelle."
    Write-Error-Custom $_.Exception.Message
    exit 1
}
