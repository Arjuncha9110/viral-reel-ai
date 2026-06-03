const fs = require("fs");
const path = require("path");

const base = "D:/Ai reel Agent/_pod_xlsx_inspect/unzipped";

function read(rel) {
  return fs.readFileSync(path.join(base, rel), "utf8");
}

function decodeXml(value) {
  if (!value) return "";
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripTags(value) {
  return decodeXml(value.replace(/<[^>]*>/g, ""));
}

function getSharedStrings() {
  const file = path.join(base, "xl/sharedStrings.xml");
  if (!fs.existsSync(file)) return [];
  const xml = fs.readFileSync(file, "utf8");
  const out = [];
  for (const match of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
    const text = [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map((m) => decodeXml(m[1]))
      .join("");
    out.push(text || stripTags(match[1]));
  }
  return out;
}

function workbookMap() {
  const wb = read("xl/workbook.xml");
  const rels = read("xl/_rels/workbook.xml.rels");
  const relMap = new Map();
  for (const m of rels.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    relMap.set(m[1], m[2]);
  }
  const sheets = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    sheets.push({
      name: decodeXml(m[1]),
      sheetId: m[2],
      rid: m[3],
      target: relMap.get(m[3]),
    });
  }
  return sheets;
}

function parseCells(sheetTarget, shared) {
  const xml = read(`xl/${sheetTarget}`);
  const cells = [];
  for (const m of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
    const attrs = m[1];
    const body = m[2];
    const ref = /r="([^"]+)"/.exec(attrs)?.[1] || "";
    const type = /t="([^"]+)"/.exec(attrs)?.[1] || "";
    const formula = /<f\b[^>]*>([\s\S]*?)<\/f>/.exec(body)?.[1];
    const rawValue = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
    const inline = /<is\b[^>]*>([\s\S]*?)<\/is>/.exec(body)?.[1];
    let value = rawValue == null ? "" : decodeXml(rawValue);
    if (type === "s" && value !== "") value = shared[Number(value)] ?? value;
    if (type === "inlineStr" && inline) value = stripTags(inline);
    cells.push({
      ref,
      type,
      value,
      formula: formula == null ? "" : decodeXml(formula),
    });
  }
  return cells;
}

function summarizeSheet(sheet, shared) {
  const xml = read(`xl/${sheet.target}`);
  const dim = /<dimension ref="([^"]+)"/.exec(xml)?.[1] || "";
  const formulaCount = (xml.match(/<f\b/g) || []).length;
  const protectedSheet = /<sheetProtection\b/.test(xml);
  return {
    sheetId: sheet.sheetId,
    name: sheet.name,
    target: sheet.target,
    dimension: dim,
    formulaCount,
    protectedSheet,
    bytes: Buffer.byteLength(xml),
  };
}

function column(ref) {
  return /^[A-Z]+/.exec(ref)?.[0] || "";
}

function row(ref) {
  return Number(/[0-9]+$/.exec(ref)?.[0] || 0);
}

function sampleImportantCells(cells) {
  return cells
    .filter((c) => c.value !== "" || c.formula !== "")
    .filter((c) => row(c.ref) <= 80 || c.formula)
    .slice(0, 260);
}

function main() {
  const shared = getSharedStrings();
  const sheets = workbookMap();
  const summaries = sheets.map((s) => summarizeSheet(s, shared));
  const interesting = sheets.filter((s) =>
    /pob|pod|forex|one hour|gann intraday|time cycle|inference/i.test(s.name)
  );

  const report = {
    workbook: {
      sheetCount: sheets.length,
      sharedStringCount: shared.length,
    },
    sheets: summaries,
    interesting: {},
  };

  for (const sheet of interesting) {
    const cells = parseCells(sheet.target, shared);
    const formulas = cells.filter((c) => c.formula);
    const labels = cells.filter((c) => /pod|pob|buy|sell|time|cycle|target|date|price|entry|sl|stop|tp|prob/i.test(String(c.value)));
    report.interesting[sheet.name] = {
      target: sheet.target,
      nonEmptyCells: cells.filter((c) => c.value !== "" || c.formula !== "").length,
      formulaCount: formulas.length,
      sampleCells: sampleImportantCells(cells),
      labels: labels.slice(0, 120),
      formulas: formulas.slice(0, 220),
    };
  }

  const outPath = "D:/Ai reel Agent/_pod_xlsx_inspect/pod_report.json";
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(outPath);
  for (const s of summaries) {
    console.log(`${s.sheetId}\t${s.name}\t${s.target}\tprotected=${s.protectedSheet}\tformulas=${s.formulaCount}\tdim=${s.dimension}\tbytes=${s.bytes}`);
  }
}

main();
