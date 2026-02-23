# ============================================================
# Uprising CRM — Docker Deployment Automation
# ============================================================
# Automates the setup of Twenty using Docker Compose on port 3001.
# Usage: .\uprising_docker_deploy.ps1
# ============================================================

$ErrorActionPreference = "Stop"

# Force current directory to be the script's directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

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

function Generate-Random-String($Length) {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $bytes = New-Object Byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $result = ""
    foreach ($byte in $bytes) {
        $result += $chars[$byte % $chars.Length]
    }
    return $result
}

function Set-Env-Var($Content, $Key, $Value) {
    $found = $false
    $newContent = $Content | ForEach-Object {
        if ($_ -match "^$Key=") {
            $found = $true
            "$Key=$Value"
        }
        else {
            $_
        }
    }
    if (-not $found) {
        $newContent += "$Key=$Value"
    }
    return $newContent
}

try {
    Write-Header "Étape 1 : Vérification des prérequis"
    
    if (Get-Command "docker" -ErrorAction SilentlyContinue) {
        $dockerVersion = docker --version
        Write-Success "Docker détecté : $dockerVersion"
    }
    else {
        Write-Error-Custom "Docker n'est pas installé. Veuillez l'installer sur https://docs.docker.com/get-docker/"
        exit 1
    }

    # 1.2 - Détection de la commande Docker Compose
    $DOCKER_COMPOSE_CMD = $null

    # Tentative avec le plugin (docker compose)
    docker compose version >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        $DOCKER_COMPOSE_CMD = @("docker", "compose")
        Write-Success "Docker Compose (plugin) détecté."
    }
    # Fallback sur le standalone (docker-compose)
    else {
        if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
            $DOCKER_COMPOSE_CMD = "docker-compose"
            $dcVersion = & $DOCKER_COMPOSE_CMD --version
            Write-Success "Docker Compose (standalone) détecté : $dcVersion"
        }
        else {
            Write-Error-Custom "Docker Compose n'est pas détecté. Veuillez l'installer sur https://docs.docker.com/compose/install/"
            exit 1
        }
    }

    Write-Header "Étape 2 : Configuration du fichier .env"
    
    if (-not (Test-Path ".env")) {
        Write-Host "Création du fichier .env à partir de l'exemple..."
        if (Test-Path "packages/twenty-docker/.env.example") {
            Copy-Item "packages/twenty-docker/.env.example" ".env"
        }
        elseif (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        }
        else {
            Write-Host "Téléchargement de .env.example..."
            curl -s -o .env https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/.env.example
        }
        Write-Success "Fichier .env créé."
    }

    $envContent = Get-Content ".env"

    # 2.1 - Génération des secrets si vides
    if ($envContent -match "^APP_SECRET=$" -or -not ($envContent -match "^APP_SECRET=")) {
        Write-Host "Génération de APP_SECRET..."
        $newSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 255) }))
        $envContent = Set-Env-Var $envContent "APP_SECRET" $newSecret
    }

    if ($envContent -match "^PG_DATABASE_PASSWORD=$" -or -not ($envContent -match "^PG_DATABASE_PASSWORD=")) {
        Write-Host "Génération de PG_DATABASE_PASSWORD..."
        $newPassword = Generate-Random-String 24
        $envContent = Set-Env-Var $envContent "PG_DATABASE_PASSWORD" $newPassword
    }

    # 2.2 - Configuration Google OAuth (Port 3001)
    Write-Host "Configuration de l'intégration Google OAuth (Port 3001)..."
    $envContent = Set-Env-Var $envContent "AUTH_GOOGLE_CLIENT_ID" "VOTRE_CLIENT_ID_GOOGLE"
    $envContent = Set-Env-Var $envContent "AUTH_GOOGLE_CLIENT_SECRET" "VOTRE_CLIENT_SECRET_GOOGLE"
    $envContent = Set-Env-Var $envContent "AUTH_GOOGLE_CALLBACK_URL" "https://localhost:3001/auth/google/redirect"
    $envContent = Set-Env-Var $envContent "AUTH_GOOGLE_APIS_CALLBACK_URL" "https://localhost:3001/auth/google-apis/get-access-token"
    $envContent = Set-Env-Var $envContent "MESSAGING_PROVIDER_GMAIL_ENABLED" "true"
    $envContent = Set-Env-Var $envContent "CALENDAR_PROVIDER_GOOGLE_ENABLED" "true"

    # 2.3 - Configuration SMTP (Gmail)
    Write-Host "Configuration du serveur SMTP (Gmail)..."
    $envContent = Set-Env-Var $envContent "EMAIL_DRIVER" "smtp"
    $envContent = Set-Env-Var $envContent "EMAIL_SMTP_HOST" "smtp.gmail.com"
    $envContent = Set-Env-Var $envContent "EMAIL_SMTP_PORT" "465"
    $envContent = Set-Env-Var $envContent "EMAIL_SMTP_USER" "votre_email@gmail.com"
    $envContent = Set-Env-Var $envContent "EMAIL_SMTP_PASSWORD" "votre_mot_de_passe_application"
    $envContent = Set-Env-Var $envContent "EMAIL_FROM_ADDRESS" "votre_email@gmail.com"
    $envContent = Set-Env-Var $envContent "EMAIL_FROM_NAME" "Uprising Studio"

    # 2.4 - Configuration de l'URL du serveur (Port 3001)
    $envContent = Set-Env-Var $envContent "SERVER_URL" "http://localhost:3001"
    $envContent = Set-Env-Var $envContent "FRONTEND_URL" "http://localhost:3001"

    $envContent | Set-Content ".env"
    Write-Success "Configuration .env mise à jour sur le port 3001."

    Write-Header "Étape 3 : Récupération du Docker Compose"
    
    # On force la mise à jour de docker-compose.yml pour refléter le port 3001
    Write-Host "Mise à jour de docker-compose.yml vers le port 3001..."
    if (Test-Path "packages/twenty-docker/docker-compose.yml") {
        Copy-Item "packages/twenty-docker/docker-compose.yml" "docker-compose.yml"
    }
    else {
        curl -s -o docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/docker-compose.yml
    }
    
    # Patch manuel du port si nécessaire (au cas où le fichier source n'est pas encore modifié)
    $dcContent = Get-Content "docker-compose.yml"
    $dcContent = $dcContent -replace '"3000:3000"', '"3001:3000"'
    $dcContent | Set-Content "docker-compose.yml"
    Write-Success "docker-compose.yml configuré sur le port 3001."

    Write-Header "Étape 4 : Lancement et Initialisation"
    
    Write-Host "Souhaitez-vous lancer les containers et configurer les background jobs ? (o/n)" -ForegroundColor Yellow
    $choice = Read-Host
    if ($choice -eq "o" -or $choice -eq "y") {
        Write-Host "Démarrage des containers sur le port 3001 via $DOCKER_COMPOSE_CMD..."
        & $DOCKER_COMPOSE_CMD down # On s'assure de nettoyer les restes du port 3000
        & $DOCKER_COMPOSE_CMD up -d
        Write-Success "Containers lancés sur http://localhost:3001."

        Write-Host "Attente du démarrage du serveur et des migrations (cela peut prendre quelques minutes)..." -ForegroundColor Cyan
        
        # Récupération dynamique de l'ID du conteneur serveur pour éviter les problèmes de nommage
        $containerId = & $DOCKER_COMPOSE_CMD ps -q server
        if (-not $containerId) {
            Write-Error-Custom "Le conteneur 'server' est introuvable. Vérifiez que 'docker-compose up' a réussi."
            exit 1
        }

        $timeout = 600 # 10 minutes max
        $elapsed = 0
        $isHealthy = $false
        
        while ($elapsed -lt $timeout) {
            $status = docker inspect --format '{{.State.Health.Status}}' $containerId 2>$null
            if ($status -eq "healthy") {
                $isHealthy = $true
                break
            }
            Write-Host "Démarrage en cours (Migrations)... ($elapsed s)"
            Start-Sleep -Seconds 10
            $elapsed += 10
        }

        if (-not $isHealthy) {
            Write-Error-Custom "Le serveur n'est pas devenu prêt après 10 minutes. Voici les derniers logs :"
            docker logs --tail 20 $containerId
            exit 1
        }

        Write-Success "Le serveur est prêt et les migrations sont terminées !"

        $jobs = @(
            "cron:messaging:messages-import",
            "cron:messaging:message-list-fetch",
            "cron:calendar:calendar-event-list-fetch",
            "cron:calendar:calendar-events-import",
            "cron:messaging:ongoing-stale",
            "cron:calendar:ongoing-stale",
            "cron:workflow:automated-cron-trigger"
        )

        foreach ($job in $jobs) {
            Write-Host "Enregistrement du job : $job"
            & $DOCKER_COMPOSE_CMD exec -T worker yarn command:prod $job
        }

        Write-Success "Tous les background jobs ont été enregistrés."
        Write-Host "`nL'application est prête sur http://localhost:3001" -ForegroundColor Cyan
    }
    else {
        Write-Host "Lancement annulé. Suivez DEPLOYMENT_PROMPT.md pour la suite." -ForegroundColor Yellow
    }

    Write-Header "TERMINÉ AVEC SUCCÈS"
    Write-Host "Uprising CRM est configuré sur le port 3001. 🚀" -ForegroundColor Green

}
catch {
    Write-Error-Custom "Le script a échoué."
    Write-Error-Custom $_.Exception.Message
    exit 1
}
