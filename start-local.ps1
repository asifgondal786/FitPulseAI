Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# The two applications are separate repositories, checked out side by side beside this one. This
# repository tracks the project itself -- the plan, the docs and this launcher -- and ignores both
# app folders on purpose, so a clone of it alone is missing them.
#
# Without this check that shows up as three PowerShell windows failing on a path that is not there,
# which reads as a broken script rather than as an unfinished checkout. The fix is one clone per
# missing app, so the check prints exactly those.
$apps = @(
    [pscustomobject]@{ Name = 'Backend';  Repo = 'https://github.com/asifgondal786/FitPulseAI-Backend.git' },
    [pscustomobject]@{ Name = 'Frontend'; Repo = 'https://github.com/asifgondal786/FitPulseAI-Frontend.git' }
)

$missing = @($apps | Where-Object { -not (Test-Path (Join-Path $root "$($_.Name)\package.json")) })

if ($missing.Count -gt 0) {
    Write-Host ''
    Write-Host 'Cannot start: this checkout is missing an application.' -ForegroundColor Red
    Write-Host ''
    Write-Host 'This repository holds the project. The applications are versioned separately and'
    Write-Host 'have to sit beside it in the same folder as this script:'
    Write-Host ''
    Write-Host "  $root"
    foreach ($app in $apps) {
        $mark = if ($app.Name -in $missing.Name) { 'missing' } else { 'present' }
        Write-Host ("    {0,-9} {1}" -f $app.Name, $mark)
    }
    Write-Host ''
    Write-Host 'Clone the missing ones:'
    Write-Host ''
    foreach ($app in $missing) {
        Write-Host "  git clone $($app.Repo) `"$root\$($app.Name)`""
    }
    Write-Host ''
    exit 1
}

# A cloned app has no dependencies yet, and `npm start` in an empty tree fails on a missing module
# rather than on the fact that nothing was installed.
$uninstalled = @($apps | Where-Object { -not (Test-Path (Join-Path $root "$($_.Name)\node_modules")) })

if ($uninstalled.Count -gt 0) {
    Write-Host ''
    Write-Host 'Cannot start: the applications have no dependencies installed.' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Run these first:'
    Write-Host ''
    foreach ($app in $uninstalled) {
        Write-Host "  cd `"$root\$($app.Name)`"; npm install"
    }
    Write-Host ''
    exit 1
}

# Not fatal: the API falls back to deterministic responses when the AI service is unreachable, so
# the app runs without it. It is worth saying out loud though, because the symptom -- slightly
# blander coach answers -- looks like a bug in the coach rather than a missing runtime.
$hasPython = [bool](Get-Command python -ErrorAction SilentlyContinue)

function Stop-Port {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $connections) {
        return
    }

    foreach ($connection in $connections) {
        if ($connection.OwningProcess -gt 0) {
            try {
                Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Verbose "Process $($connection.OwningProcess) on port $Port could not be stopped."
            }
        }
    }
}

Write-Host 'Cleaning stale local services...'
Stop-Port -Port 4000
Stop-Port -Port 8001
Stop-Port -Port 5173

Write-Host 'Starting backend API...'
Start-Process PowerShell -ArgumentList "-NoExit","-Command","Set-Location '$root\Backend'; npm start" -WorkingDirectory $root

if ($hasPython) {
    Write-Host 'Starting AI service...'
    Start-Process PowerShell -ArgumentList "-NoExit","-Command","Set-Location '$root\Backend\ai-service'; python main.py" -WorkingDirectory $root
} else {
    Write-Host 'Skipping AI service: python is not on PATH.' -ForegroundColor Yellow
    Write-Host '  The API falls back to deterministic responses without it; the coach is blander, not broken.'
}

Write-Host 'Starting frontend...'
Start-Process PowerShell -ArgumentList "-NoExit","-Command","Set-Location '$root\Frontend'; npm run dev -- --host 0.0.0.0" -WorkingDirectory $root

Write-Host "Local stack started."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:4000"
if ($hasPython) {
    Write-Host "AI service: http://localhost:8001"
} else {
    Write-Host "AI service: not started"
}
