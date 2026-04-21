# Wrapper PowerShell pour lancer le scraper ForexFactory
# Execute par le Task Scheduler Windows (cf. README.md)
#
# Utilisation directe pour tester :
#   powershell.exe -ExecutionPolicy Bypass -File .\run.ps1

$ErrorActionPreference = "Stop"

# Se placer dans le dossier du script (parent = scraper-forexfactory/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scraperDir = Split-Path -Parent $scriptDir
Set-Location $scraperDir

# Chemin du Python du venv (adapter si venv pas dans .venv)
$pythonExe = Join-Path $scraperDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    # Fallback : python global sur le VPS
    $pythonExe = "python"
}

# Log file a cote du script
$logFile = Join-Path $scraperDir "scraper.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    "[$timestamp] === Lancement forexfactory_scraper.py ===" | Out-File -FilePath $logFile -Append -Encoding utf8
    & $pythonExe (Join-Path $scraperDir "forexfactory_scraper.py") 2>&1 | Out-File -FilePath $logFile -Append -Encoding utf8
    $exitCode = $LASTEXITCODE
    "[$timestamp] === Fin (exit=$exitCode) ===`n" | Out-File -FilePath $logFile -Append -Encoding utf8
    exit $exitCode
} catch {
    "[$timestamp] [ERROR] $_" | Out-File -FilePath $logFile -Append -Encoding utf8
    exit 1
}
