<#
.SYNOPSIS
    Starts the VeriNews FastAPI backend locally with English inference enabled for this process.

.DESCRIPTION
    Sets process-level environment variables:
      - VERINEWS_ENABLE_ENGLISH_INFERENCE = true
      - VERINEWS_ENABLE_HINDI_INFERENCE   = false
    Checks for port conflicts on 8000, validates the virtual environment, and starts Uvicorn.
    Does NOT edit .env, production configuration, or expose any secrets.

.NOTES
    Frontend startup command (run in a separate terminal):
      cd frontend
      npm run dev
#>

[CmdletBinding()]
param (
    [string]$HostAddress = "127.0.0.1",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

# 1. Resolve project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
Set-Location $ProjectRoot

# 2. Check for virtual environment Python
$VenvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    $VenvPython = "python"
    Write-Warning "Virtual environment python not found at .venv\Scripts\python.exe; falling back to system PATH python."
}

# 3. Check for existing process on the target port
$PortInUse = $false
try {
    $ExistingConn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    if ($ExistingConn) {
        $PortInUse = $true
        $ProcessId = $ExistingConn.OwningProcess
        Write-Warning "Port $Port is already in use by process PID $ProcessId."
        Write-Warning "Please terminate the existing process before launching a new backend instance."
        exit 1
    }
} catch {
    # If Get-NetTCPConnection is unavailable or restricted, proceed with standard Uvicorn socket bind
}

# 4. Set temporary process-level environment variables only
$env:VERINEWS_ENABLE_ENGLISH_INFERENCE = "true"
$env:VERINEWS_ENABLE_HINDI_INFERENCE = "false"

# 5. Display configuration banner (Zero secrets exposed)
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "                VeriNews Local Backend Server                          " -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " Project Root:       $ProjectRoot"
Write-Host " Python Environment: $VenvPython"
Write-Host " Host & Port:        http://${HostAddress}:${Port}"
Write-Host " Health Endpoint:    http://${HostAddress}:${Port}/api/health"
Write-Host " Predict Endpoint:   http://${HostAddress}:${Port}/api/predict"
Write-Host " API Documentation:  http://${HostAddress}:${Port}/api/docs"
Write-Host " English Inference:  ENABLED (Process-level: `$env:VERINEWS_ENABLE_ENGLISH_INFERENCE=true)" -ForegroundColor Green
Write-Host " Hindi Inference:    DISABLED (Gated: `$env:VERINEWS_ENABLE_HINDI_INFERENCE=false)" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " Frontend Startup (in another terminal):" -ForegroundColor Gray
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " Starting Uvicorn ASGI server... Press Ctrl+C to stop." -ForegroundColor White
Write-Host ""

# 6. Launch Uvicorn in the foreground
& $VenvPython -m uvicorn backend.app.main:app --host $HostAddress --port $Port

