# Wrapper PowerShell pour lancer le scraper ForexFactory
# Execute par le Task Scheduler Windows (cf. README.md)
#
# Utilisation directe pour tester :
#   powershell.exe -ExecutionPolicy Bypass -File .\run.ps1

# Se placer dans le dossier du script (parent = scraper-forexfactory/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scraperDir = Split-Path -Parent $scriptDir
Set-Location $scraperDir

# Chemin du Python du venv (adapter si venv pas dans .venv)
$pythonExe = Join-Path $scraperDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

$scraperPy = Join-Path $scraperDir "forexfactory_scraper.py"
$logFile = Join-Path $scraperDir "scraper.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Add-Content -Path $logFile -Value "[$timestamp] === Lancement forexfactory_scraper.py ===" -Encoding utf8

# Utiliser Start-Process pour rediriger stdout/stderr proprement
# (evite le piege PowerShell 5.1 ou 2>&1 sur exe natif fait croire a une erreur)
$stdoutTmp = Join-Path $env:TEMP "ff_scraper_stdout.txt"
$stderrTmp = Join-Path $env:TEMP "ff_scraper_stderr.txt"

$p = Start-Process -FilePath $pythonExe `
    -ArgumentList "`"$scraperPy`"" `
    -WorkingDirectory $scraperDir `
    -NoNewWindow `
    -Wait `
    -PassThru `
    -RedirectStandardOutput $stdoutTmp `
    -RedirectStandardError $stderrTmp

if (Test-Path $stdoutTmp) {
    Get-Content $stdoutTmp | Add-Content -Path $logFile -Encoding utf8
    Remove-Item $stdoutTmp -Force -ErrorAction SilentlyContinue
}
if (Test-Path $stderrTmp) {
    Get-Content $stderrTmp | Add-Content -Path $logFile -Encoding utf8
    Remove-Item $stderrTmp -Force -ErrorAction SilentlyContinue
}

$endStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $logFile -Value "[$endStamp] === Fin (exit=$($p.ExitCode)) ===`n" -Encoding utf8

exit $p.ExitCode
