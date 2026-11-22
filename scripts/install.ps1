# Installateur Sobre pour Windows (PowerShell 5.1+)
# Usage : irm https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.ps1 | iex
$ErrorActionPreference = 'Stop'
$Depot = 'TeddyF39/sobre'
$Dir   = Join-Path $env:USERPROFILE '.sobre'
$Bin   = Join-Path $Dir 'bin'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js 22+ est requis : https://nodejs.org puis relance cette commande.' -ForegroundColor Red
    return
}

New-Item -ItemType Directory -Force $Bin | Out-Null
Write-Host "Telechargement de Sobre..." -ForegroundColor Cyan
Invoke-WebRequest "https://raw.githubusercontent.com/$Depot/main/sobre.mjs" -OutFile (Join-Path $Dir 'sobre.mjs') -UseBasicParsing

# Raccourci "sobre" utilisable dans PowerShell et cmd
Set-Content -Path (Join-Path $Bin 'sobre.cmd') -Value '@node "%USERPROFILE%\.sobre\sobre.mjs" %*' -Encoding ASCII

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not $userPath) { $userPath = '' }
if (($userPath -split ';') -notcontains $Bin) {
    [Environment]::SetEnvironmentVariable('Path', ($userPath.TrimEnd(';') + ';' + $Bin).TrimStart(';'), 'User')
}
if (($env:Path -split ';') -notcontains $Bin) { $env:Path += ";$Bin" }

node (Join-Path $Dir 'sobre.mjs') @args
