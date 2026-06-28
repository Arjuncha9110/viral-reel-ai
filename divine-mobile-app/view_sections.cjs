const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'components', 'shared', 'KundaliReportTemplate.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

function printRange(start, end, title) {
  console.log(`\n========================================`);
  console.log(`=== ${title} (Lines ${start} to ${end}) ===`);
  console.log(`========================================`);
  for (let i = start - 1; i < end; i++) {
    if (i >= 0 && i < lines.length) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
}

// Let's print out lines around the Mahadasha/Antardasha (around line 1400-1800), Lucky Elements, Vedic Remedies, Ashtakavarga, and Transit.
// We can locate them by finding their comments or keywords:
// - Mahadasha section start: let's find the first page or code block containing Mahadasha
// - Let's find "PAGE 11" or "PAGE 12" etc. or we can search for sectionTitle="..."
lines.forEach((line, idx) => {
  if (line.includes('<ReportPage') && (line.includes('Mahadasha') || line.includes('Antardasha') || line.includes('Lucky Elements') || line.includes('Vedic Remedies') || line.includes('Ashtakavarga') || line.includes('Transit') || line.includes('Dasha'))) {
    printRange(idx - 2, idx + 50, `ReportPage at line ${idx + 1}`);
  }
});
