param(
  [string]$OutputDir = "D:\Ai reel Agent\instagram-carousel-first-post\exports"
)

$ErrorActionPreference = "Stop"

$browserCandidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$browserPath = $browserCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $browserPath) {
  throw "No supported browser binary found. Checked Chrome and Edge."
}

$htmlPath = "D:\Ai reel Agent\instagram-carousel-first-post\carousel.html"
if (-not (Test-Path -LiteralPath $htmlPath)) {
  throw "Carousel HTML not found at $htmlPath"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

for ($i = 1; $i -le 7; $i++) {
  $uriBuilder = [System.UriBuilder]::new(([System.Uri]$htmlPath))
  $uriBuilder.Query = "slide=$i"
  $url = $uriBuilder.Uri.AbsoluteUri
  $screenshotPath = Join-Path $OutputDir ("slide-{0}.png" -f $i.ToString("00"))

  & $browserPath `
    --headless=new `
    --disable-gpu `
    --disable-software-rasterizer `
    --disable-features=VizDisplayCompositor `
    --hide-scrollbars `
    --window-size=1080,1350 `
    "--screenshot=$screenshotPath" `
    $url | Out-Null
}

Write-Host "Exported slides to $OutputDir using $browserPath"
