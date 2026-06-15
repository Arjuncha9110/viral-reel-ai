/**
 * Google Apps Script — Divine Panchang Website Leads Logger
 * Writes incoming website lead data to the "Website Data" sheet
 * in the same spreadsheet as your WhatsApp data.
 *
 * DEPLOY STEPS:
 *  1. Open your Google Spreadsheet (Divinepanchang Whats app data)
 *  2. Extensions → Apps Script → paste this code → Save
 *  3. Click Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy the deployment URL
 *  5. In Cloudflare Pages → Settings → Environment variables,
 *     add:  LEADS_SHEETS_WEBHOOK_URL = <paste URL here>
 *  6. Redeploy your Cloudflare Pages site
 */

var SHEET_NAME = "Website Data";

// Column order in the "Website Data" sheet
var HEADERS = [
  "Timestamp",
  "Source",
  "Name",
  "Email",
  "Phone",
  "DOB",
  "Birth Time",
  "City",
  "Gender",
  "Type",
  "Extra"
];

function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    // If sheet exists but has no headers yet, add them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    // Build "Extra" column from any remaining fields
    var knownKeys = ["sheet","source","timestamp","name","email","phone","dob","birthTime","city","gender","type","stateCode","countryCode","timezone","lat","lon","chartStyle","page"];
    var extra = {};
    for (var key in data) {
      if (knownKeys.indexOf(key) === -1) {
        extra[key] = data[key];
      }
    }

    var row = [
      data.timestamp  || new Date().toISOString(),
      data.source     || "",
      data.name       || "",
      data.email      || "",
      data.phone      || "",
      data.dob        || "",
      data.birthTime  || "",
      data.city       || "",
      data.gender     || "",
      data.type       || "",
      Object.keys(extra).length > 0 ? JSON.stringify(extra) : ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET handler — health check
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, route: "leads-webhook" }))
    .setMimeType(ContentService.MimeType.JSON);
}
