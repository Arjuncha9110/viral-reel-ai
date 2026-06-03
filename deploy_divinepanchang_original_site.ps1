$ErrorActionPreference = "Stop"

$siteRoot = "D:\Ai reel Agent\divine-compass-main"
$projectName = "divine-compass"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$wranglerCmd = Join-Path $env:APPDATA "npm\wrangler.cmd"

function Write-Step($message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Require-Path($path, $label) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "$label not found: $path"
    }
}

Write-Step "Checking site workspace"
Require-Path $siteRoot "Site folder"
Require-Path (Join-Path $siteRoot "package.json") "package.json"
Require-Path $npmCmd "npm.cmd"
Require-Path $wranglerCmd "wrangler.cmd"

Set-Location $siteRoot

Write-Step "Checking Cloudflare auth"
& $wranglerCmd whoami
if ($LASTEXITCODE -ne 0) {
    throw "Wrangler is not authenticated. Run 'wrangler login' first."
}

Write-Step "Checking required Pages secrets"
$secretNames = @(
    "PROKERALA_CLIENT_ID",
    "PROKERALA_CLIENT_SECRET"
)

$secretList = & $wranglerCmd pages secret list --project-name $projectName 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Could not read Pages secrets for project '$projectName'."
}

$missingSecrets = @()
foreach ($secretName in $secretNames) {
    if ($secretList -notmatch $secretName) {
        $missingSecrets += $secretName
    }
}

if ($missingSecrets.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing Pages secrets:" -ForegroundColor Yellow
    $missingSecrets | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Add them before deploy, for example:" -ForegroundColor Yellow
    $missingSecrets | ForEach-Object {
        Write-Host "wrangler pages secret put $_ --project-name $projectName" -ForegroundColor DarkYellow
    }
    throw "Required Pages secrets are missing."
}

$siteConfigPath = Join-Path $siteRoot "src\lib\siteConfig.ts"
if (Test-Path -LiteralPath $siteConfigPath) {
    $siteConfig = Get-Content $siteConfigPath -Raw
    if ($siteConfig -match 'instagramUrl:\s*""') {
        Write-Host ""
        Write-Host "Warning: instagramUrl is still empty in src\\lib\\siteConfig.ts" -ForegroundColor Yellow
        Write-Host "The site will deploy, but Instagram links will stay hidden." -ForegroundColor Yellow
    }
}

Write-Step "Installing dependencies"
& $npmCmd install
if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
}

Write-Step "Building production site"
& $npmCmd run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed."
}

Require-Path (Join-Path $siteRoot "dist") "Build output"

Write-Step "Deploying to Cloudflare Pages project '$projectName'"
& $wranglerCmd pages deploy dist --project-name $projectName
if ($LASTEXITCODE -ne 0) {
    throw "Cloudflare Pages deploy failed."
}

Write-Step "Deploy finished"
Write-Host "Site deploy command completed for https://www.divinepanchang.space/" -ForegroundColor Green
