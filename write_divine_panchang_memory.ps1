param(
    [string]$AutomationId = "divine-panchang-growth-monitor",
    [string]$CodexHome = "C:\Users\win\.codex",
    [string]$Entry
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Entry)) {
    $Entry = @"
2026-05-25 19:05 IST

- Created a safe staging deploy script at `D:\Ai reel Agent\divine-compass-pages-test\deploy_divine_compass_staging.ps1`.
- Preserved the original source and created isolated backup/test workspaces before staging deploys.
- Deployed the isolated staging site to `divine-compass-staging.pages.dev`.
- Confirmed the remaining issue is not Cloudflare deployment but an astrology-engine mismatch: the staged Sade Sati result does not match the current live site's expected calculation.
- Recommended next step: inspect the live site's Network/XHR request for `/sade-sati` and recover the real calculator backend or API path before replacing production logic.
- Runtime: about 10 minutes.
"@
}

$memoryDir = Join-Path $CodexHome "automations\$AutomationId"
$memoryFile = Join-Path $memoryDir "memory.md"

if (-not (Test-Path $memoryDir)) {
    New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
}

$prefix = ""
if ((Test-Path $memoryFile) -and ((Get-Item $memoryFile).Length -gt 0)) {
    $prefix = "`r`n"
}

Add-Content -Path $memoryFile -Value ($prefix + $Entry) -Encoding UTF8

Write-Host "Memory updated:" -ForegroundColor Green
Write-Host $memoryFile
