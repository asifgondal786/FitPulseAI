Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

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

Write-Host 'Starting AI service...'
Start-Process PowerShell -ArgumentList "-NoExit","-Command","Set-Location '$root\Backend\ai-service'; python main.py" -WorkingDirectory $root

Write-Host 'Starting frontend...'
Start-Process PowerShell -ArgumentList "-NoExit","-Command","Set-Location '$root\Frontend'; npm run dev -- --host 0.0.0.0" -WorkingDirectory $root

Write-Host "Local stack started."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:4000"
Write-Host "AI service: http://localhost:8001"
