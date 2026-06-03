param(
  [string]$OutputDir = "D:\Ai reel Agent\instagram-carousel-first-post\final"
)

$ErrorActionPreference = "Stop"

function Xml([string]$text) {
  if ($null -eq $text) { return "" }
  return $text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

function Build-Slide([int]$slideNumber, [string]$bodyMarkup, [string]$swipeText = "Swipe right") {
  @"
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffaf4"/>
      <stop offset="100%" stop-color="#f5eee2"/>
    </linearGradient>
    <linearGradient id="navyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#112348"/>
      <stop offset="100%" stop-color="#0c1730"/>
    </linearGradient>
    <linearGradient id="saffronGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8c1a"/>
      <stop offset="100%" stop-color="#ffb44d"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f1f3d" flood-opacity="0.10"/>
    </filter>
  </defs>

  <rect width="1080" height="1350" fill="url(#bgGrad)"/>
  <circle cx="930" cy="195" r="220" fill="#ffb044" fill-opacity="0.08"/>
  <circle cx="120" cy="1115" r="220" fill="#0f1f3d" fill-opacity="0.06"/>

  <g fill="#d8bc7a" fill-opacity="0.10">
    <circle cx="80" cy="150" r="2.4"/><circle cx="140" cy="150" r="2.4"/><circle cx="200" cy="150" r="2.4"/><circle cx="260" cy="150" r="2.4"/>
    <circle cx="820" cy="1210" r="2.4"/><circle cx="880" cy="1210" r="2.4"/><circle cx="940" cy="1210" r="2.4"/><circle cx="1000" cy="1210" r="2.4"/>
  </g>

  <g>
    <rect x="68" y="68" width="78" height="78" rx="22" fill="#0f1f3d" stroke="#d8bc7a" stroke-opacity="0.45" stroke-width="3"/>
    <circle cx="107" cy="107" r="22" fill="none" stroke="#ff8c1a" stroke-width="4"/>
    <circle cx="107" cy="107" r="10" fill="#d8bc7a"/>
    <text x="172" y="106" fill="#0f1f3d" font-family="Georgia" font-size="31" font-weight="700">Divine Panchang</text>
    <text x="172" y="136" fill="#6b5d55" font-family="Segoe UI" font-size="18">Daily Guidance and Numerology</text>
    <rect x="852" y="78" width="160" height="40" rx="20" fill="#ff8c1a" fill-opacity="0.10"/>
    <text x="887" y="104" fill="#ff8c1a" font-family="Segoe UI" font-size="18" font-weight="700">Slide $slideNumber of 7</text>
  </g>

$bodyMarkup

  <text x="68" y="1298" fill="#0f1f3d" font-family="Segoe UI" font-size="22" font-weight="700">@divinepanchang.space</text>
  <rect x="860" y="1255" width="152" height="50" rx="25" fill="#0f1f3d" fill-opacity="0.08"/>
  <text x="900" y="1288" fill="#0f1f3d" font-family="Segoe UI" font-size="22" font-weight="700">$([Xml]$swipeText)</text>
</svg>
"@
}

function Write-Slide([int]$number, [string]$svgContent, [string]$outputDir) {
  $svgPath = Join-Path $outputDir ("slide-{0}.svg" -f $number.ToString("00"))
  $pngPath = Join-Path $outputDir ("slide-{0}.png" -f $number.ToString("00"))
  [System.IO.File]::WriteAllText($svgPath, $svgContent, [System.Text.UTF8Encoding]::new($false))
  magick $svgPath $pngPath | Out-Null
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$slide1 = @"
  <text x="68" y="270" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">WELCOME TO THE PAGE</text>
  <text x="68" y="390" fill="#0f1f3d" font-family="Georgia" font-size="82" font-weight="700">Daily Panchang,</text>
  <text x="68" y="480" fill="#0f1f3d" font-family="Georgia" font-size="82" font-weight="700">Kundali and</text>
  <text x="68" y="570" fill="#ff8c1a" font-family="Georgia" font-size="82" font-weight="700">Numerology</text>
  <text x="68" y="650" fill="#6b5d55" font-family="Segoe UI" font-size="31">Practical Vedic guidance for everyday clarity.</text>
  <rect x="68" y="745" width="944" height="250" rx="34" fill="url(#navyGrad)" filter="url(#softShadow)"/>
  <text x="118" y="835" fill="#d8bc7a" font-family="Segoe UI" font-size="20" font-weight="700" letter-spacing="3">WHAT MAKES THIS DIFFERENT</text>
  <text x="118" y="905" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">Not fear-based astrology. Not clutter.</text>
  <text x="118" y="960" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">Just clear timing, chart insight,</text>
  <text x="118" y="1015" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">and daily spiritual reflection.</text>
"@

$slide2 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">WHY FOLLOW DIVINE PANCHANG?</text>
  <text x="68" y="372" fill="#0f1f3d" font-family="Georgia" font-size="78" font-weight="700">For daily clarity,</text>
  <text x="68" y="458" fill="#ff8c1a" font-family="Georgia" font-size="78" font-weight="700">better timing,</text>
  <text x="68" y="544" fill="#0f1f3d" font-family="Georgia" font-size="78" font-weight="700">and grounded guidance.</text>
  <rect x="68" y="630" width="944" height="465" rx="34" fill="white" fill-opacity="0.86" stroke="#d8bc7a" stroke-opacity="0.32" filter="url(#softShadow)"/>
  <circle cx="118" cy="717" r="7" fill="#ff8c1a"/><text x="144" y="726" fill="#2c221e" font-family="Segoe UI" font-size="28">Know the day&apos;s spiritual rhythm before major actions or decisions.</text>
  <circle cx="118" cy="817" r="7" fill="#ff8c1a"/><text x="144" y="826" fill="#2c221e" font-family="Segoe UI" font-size="28">Understand Kundali, Dasha, and Sade Sati with calmer explanations.</text>
  <circle cx="118" cy="917" r="7" fill="#ff8c1a"/><text x="144" y="926" fill="#2c221e" font-family="Segoe UI" font-size="28">Build a repeatable daily ritual around awareness, remedies, and timing.</text>
"@

$slide3 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">WHAT IS PANCHANG?</text>
  <text x="68" y="372" fill="#0f1f3d" font-family="Georgia" font-size="72" font-weight="700">Your daily cosmic</text>
  <text x="68" y="450" fill="#0f1f3d" font-family="Georgia" font-size="72" font-weight="700">calendar</text>
  <text x="68" y="525" fill="#6b5d55" font-family="Segoe UI" font-size="30">Panchang helps you understand the day through five key layers of Vedic timing.</text>
  <rect x="68" y="605" width="944" height="505" rx="34" fill="white" fill-opacity="0.86" stroke="#d8bc7a" stroke-opacity="0.32" filter="url(#softShadow)"/>
  <circle cx="118" cy="692" r="7" fill="#ff8c1a"/><text x="144" y="701" fill="#2c221e" font-family="Segoe UI" font-size="28">Tithi - the lunar day and emotional tone</text>
  <circle cx="118" cy="792" r="7" fill="#ff8c1a"/><text x="144" y="801" fill="#2c221e" font-family="Segoe UI" font-size="28">Nakshatra - the star-field influence</text>
  <circle cx="118" cy="892" r="7" fill="#ff8c1a"/><text x="144" y="901" fill="#2c221e" font-family="Segoe UI" font-size="28">Yoga - the day&apos;s combined energetic pattern</text>
  <circle cx="118" cy="992" r="7" fill="#ff8c1a"/><text x="144" y="1001" fill="#2c221e" font-family="Segoe UI" font-size="28">Karana - the action quality of the moment</text>
  <circle cx="118" cy="1092" r="7" fill="#ff8c1a"/><text x="144" y="1101" fill="#2c221e" font-family="Segoe UI" font-size="28">Muhurat context - when to move carefully or confidently</text>
"@

$slide4 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">WHAT YOU WILL GET HERE</text>
  <text x="68" y="372" fill="#0f1f3d" font-family="Georgia" font-size="74" font-weight="700">One page for your</text>
  <text x="68" y="452" fill="#ff8c1a" font-family="Georgia" font-size="74" font-weight="700">daily Vedic toolkit</text>
  <rect x="68" y="540" width="944" height="520" rx="34" fill="white" fill-opacity="0.86" stroke="#d8bc7a" stroke-opacity="0.32" filter="url(#softShadow)"/>
  <circle cx="118" cy="632" r="7" fill="#ff8c1a"/><text x="144" y="641" fill="#2c221e" font-family="Segoe UI" font-size="29">Daily Panchang guidance</text>
  <circle cx="118" cy="730" r="7" fill="#ff8c1a"/><text x="144" y="739" fill="#2c221e" font-family="Segoe UI" font-size="29">Janam Kundali chart insights</text>
  <circle cx="118" cy="828" r="7" fill="#ff8c1a"/><text x="144" y="837" fill="#2c221e" font-family="Segoe UI" font-size="29">Sade Sati timing awareness</text>
  <circle cx="118" cy="926" r="7" fill="#ff8c1a"/><text x="144" y="935" fill="#2c221e" font-family="Segoe UI" font-size="29">Dasha cycle understanding</text>
  <circle cx="118" cy="1024" r="7" fill="#ff8c1a"/><text x="144" y="1033" fill="#2c221e" font-family="Segoe UI" font-size="29">Name and birth numerology</text>
"@

$slide5 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">WHO THIS IS FOR</text>
  <text x="68" y="372" fill="#0f1f3d" font-family="Georgia" font-size="74" font-weight="700">Practical Vedic guidance</text>
  <text x="68" y="452" fill="#ff8c1a" font-family="Georgia" font-size="74" font-weight="700">without the noise</text>
  <rect x="68" y="560" width="944" height="170" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <rect x="96" y="595" width="74" height="74" rx="20" fill="url(#navyGrad)"/>
  <text x="123" y="644" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">1</text>
  <text x="208" y="624" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">You want timing guidance before</text>
  <text x="208" y="664" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">important actions, travel, or rituals.</text>
  <rect x="68" y="760" width="944" height="170" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <rect x="96" y="795" width="74" height="74" rx="20" fill="url(#navyGrad)"/>
  <text x="123" y="844" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">2</text>
  <text x="208" y="824" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">You want spiritual structure without</text>
  <text x="208" y="864" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">manipulative fear-based predictions.</text>
  <rect x="68" y="960" width="944" height="170" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <rect x="96" y="995" width="74" height="74" rx="20" fill="url(#navyGrad)"/>
  <text x="123" y="1044" fill="#fff8eb" font-family="Segoe UI" font-size="34" font-weight="700">3</text>
  <text x="208" y="1024" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">You want a page you can return to daily</text>
  <text x="208" y="1064" fill="#2c221e" font-family="Segoe UI" font-size="29" font-weight="700">for clarity, pattern, and perspective.</text>
"@

$slide6 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">HOW TO USE IT DAILY</text>
  <text x="68" y="372" fill="#0f1f3d" font-family="Georgia" font-size="74" font-weight="700">A simple 3-minute ritual</text>
  <rect x="68" y="510" width="944" height="136" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <text x="118" y="568" fill="#ff8c1a" font-family="Segoe UI" font-size="22" font-weight="700">STEP 1</text>
  <text x="118" y="610" fill="#2c221e" font-family="Segoe UI" font-size="28" font-weight="700">Check the day&apos;s Panchang before your schedule gets busy.</text>
  <rect x="68" y="680" width="944" height="136" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <text x="118" y="738" fill="#ff8c1a" font-family="Segoe UI" font-size="22" font-weight="700">STEP 2</text>
  <text x="118" y="780" fill="#2c221e" font-family="Segoe UI" font-size="28" font-weight="700">Notice one caution and one favorable direction.</text>
  <rect x="68" y="850" width="944" height="136" rx="30" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <text x="118" y="908" fill="#ff8c1a" font-family="Segoe UI" font-size="22" font-weight="700">STEP 3</text>
  <text x="118" y="950" fill="#2c221e" font-family="Segoe UI" font-size="28" font-weight="700">Follow one remedy: prayer, silence, journaling, or diya.</text>
  <rect x="68" y="1020" width="944" height="142" rx="30" fill="url(#navyGrad)"/>
  <text x="118" y="1108" fill="#fff8eb" font-family="Segoe UI" font-size="28" font-weight="700">Repeat daily for spiritual rhythm and clearer timing.</text>
"@

$slide7 = @"
  <text x="68" y="260" fill="#ff8c1a" font-family="Segoe UI" font-size="19" font-weight="700" letter-spacing="3">START HERE</text>
  <rect x="68" y="340" width="944" height="330" rx="38" fill="url(#navyGrad)" filter="url(#softShadow)"/>
  <text x="118" y="446" fill="#fff8eb" font-family="Georgia" font-size="82" font-weight="700">Follow</text>
  <text x="118" y="534" fill="#d8bc7a" font-family="Georgia" font-size="82" font-weight="700">Divine Panchang</text>
  <text x="118" y="612" fill="#fff8eb" fill-opacity="0.90" font-family="Segoe UI" font-size="30">Save this post, share it with family, and come back daily for</text>
  <text x="118" y="652" fill="#fff8eb" fill-opacity="0.90" font-family="Segoe UI" font-size="30">Panchang, Kundali, Dasha, Sade Sati, and numerology guidance.</text>
  <rect x="68" y="742" width="944" height="220" rx="34" fill="white" fill-opacity="0.88" stroke="#d8bc7a" stroke-opacity="0.32"/>
  <text x="118" y="815" fill="#ff8c1a" font-family="Segoe UI" font-size="22" font-weight="700" letter-spacing="3">CALL TO ACTION</text>
  <text x="118" y="882" fill="#2c221e" font-family="Georgia" font-size="52" font-weight="700">Save | Share | Follow</text>
  <text x="118" y="936" fill="#6b5d55" font-family="Segoe UI" font-size="28">Daily spiritual guidance for modern life - calm, clear, and rooted.</text>
"@

Write-Slide 1 (Build-Slide 1 $slide1) $OutputDir
Write-Slide 2 (Build-Slide 2 $slide2) $OutputDir
Write-Slide 3 (Build-Slide 3 $slide3) $OutputDir
Write-Slide 4 (Build-Slide 4 $slide4) $OutputDir
Write-Slide 5 (Build-Slide 5 $slide5) $OutputDir
Write-Slide 6 (Build-Slide 6 $slide6) $OutputDir
Write-Slide 7 (Build-Slide 7 $slide7 "Save and follow") $OutputDir

Write-Host "Generated 7 SVG and PNG carousel slides in $OutputDir"
