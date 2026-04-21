# Enregistre le scraper ForexFactory dans le Task Scheduler Windows
# a executer en PowerShell Administrateur une seule fois apres deploiement
#
# Execution :
#   powershell.exe -ExecutionPolicy Bypass -File .\register-task.ps1

$ErrorActionPreference = "Stop"

$taskName = "ForexFactoryScraper"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$runScript = Join-Path $scriptDir "run.ps1"

if (-not (Test-Path $runScript)) {
    Write-Error "run.ps1 introuvable a : $runScript"
    exit 1
}

# Supprimer si existe deja
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Tache existante detectee, suppression..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$runScript`""

# Trigger : toutes les 30 min, demarrage 2 min apres boot, indefiniment
$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At ((Get-Date).AddMinutes(2)) `
    -RepetitionInterval (New-TimeSpan -Minutes 30)

# Exclure la limite de duree par defaut (3 jours)
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Utilisateur : celui qui lance ce script (courant)
$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType S4U `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Scrape le calendrier ForexFactory toutes les 30 min et push dans Supabase ff_calendar"

Write-Host ""
Write-Host "OK - Tache '$taskName' enregistree."
Write-Host ""
Write-Host "Verifier / lancer manuellement :"
Write-Host "  Get-ScheduledTask -TaskName $taskName"
Write-Host "  Start-ScheduledTask -TaskName $taskName"
Write-Host "  Get-ScheduledTaskInfo -TaskName $taskName"
Write-Host ""
Write-Host "Log : $(Join-Path (Split-Path -Parent $scriptDir) 'scraper.log')"
