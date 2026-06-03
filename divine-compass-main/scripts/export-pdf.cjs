/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Premium PDF Export Flow via Puppeteer
 * Navigates to Vite HTML Preview routes headless and prints pristine A4 documents
 * ──────────────────────────────────────────────────────────────────────────────
 */

const puppeteer = require("puppeteer");
const path = require("path");

async function exportReport(url, outputPath) {
  console.log(`\n🪐 Initializing Headless PDF Export Flow...`);
  console.log(`🔗 Target URL: ${url}`);
  console.log(`📂 Output Path: ${outputPath}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set high-end print viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // High DPI rendering
    });

    console.log(`⏳ Navigating to report preview route...`);
    await page.goto(url, {
      waitUntil: "networkidle0", // Wait for all charts, assets and fonts to load
      timeout: 60000,
    });

    console.log(`🎨 Formatting CSS media type print...`);
    await page.emulateMediaType("print");

    console.log(`🖨️ Generating A4 print-layout PDF document...`);
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true, // Crucial for retaining cream backgrounds & gold textures
      preferCSSPageSize: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
    });

    console.log(`✅ Success! High-Value Premium PDF saved to: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Export Failed:`, error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI parameters extraction
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("\n⚠️ Usage:");
  console.log("node export-pdf.js <preview_url> <output_pdf_path>");
  console.log("\n💡 Example:");
  console.log('node export-pdf.js "http://localhost:8081/kundali-report-preview?name=Arjun" "./output/kundali.pdf"\n');
  process.exit(1);
}

const targetUrl = args[0];
const finalPath = path.resolve(args[1]);

exportReport(targetUrl, finalPath);
