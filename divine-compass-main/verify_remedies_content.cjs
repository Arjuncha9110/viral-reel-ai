const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'components', 'shared', 'KundaliReportTemplate.tsx');
const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Vedic Remedies block
const indexRemediesStart = content.indexOf('      {/* ─── PAGE 16: REMEDIES ─── */}');
const indexRemediesEnd = content.indexOf('      {/* ─── PAGE 17: 5-YEAR TRANSIT ROADMAP');
if (indexRemediesStart !== -1 && indexRemediesEnd !== -1) {
  console.log("=== REMEDIES BLOCK ===");
  console.log(content.substring(indexRemediesStart, indexRemediesEnd).trim());
}

// 2. Ashtakavarga block (starts at table, ends at remedies)
const indexAshtakavargaStart = content.indexOf('      {/* ─── PAGE 16.6: ASHTAKAVARGA POINTS TABLE ─── */}');
const indexAshtakavargaEnd = content.indexOf('      {/* ─── PAGE 16: REMEDIES ─── */}');
if (indexAshtakavargaStart !== -1 && indexAshtakavargaEnd !== -1) {
  console.log("=== ASHTAKAVARGA BLOCK ===");
  console.log(content.substring(indexAshtakavargaStart, indexAshtakavargaEnd).trim());
}

// 3. Transit Roadmap block
const indexTransitStart = content.indexOf('      {/* ─── PAGE 17: 5-YEAR TRANSIT ROADMAP PART 1 (DETAILED ONLY) ─── */}');
const indexTransitEnd = content.indexOf('      {/* ─── PAGE 19: DISCLAIMER & BLESSING (DETAILED ONLY) ─── */}');
if (indexTransitStart !== -1 && indexTransitEnd !== -1) {
  console.log("=== TRANSIT BLOCK ===");
  console.log(content.substring(indexTransitStart, indexTransitEnd).trim());
}
