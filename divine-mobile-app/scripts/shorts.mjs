/**
 * Runner for the Daily Panchang Shorts generator.
 *
 * Bundles scripts/generate-shorts.ts with esbuild (same engine Vite uses, so
 * the CommonJS astronomy-engine dependency resolves correctly), then runs it.
 * Args after `npm run shorts --` are passed straight through.
 *
 *   npm run shorts                 # today, Bengaluru
 *   npm run shorts -- mumbai       # today, Mumbai
 *   npm run shorts -- delhi 2026-06-20
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const entry = path.join(root, "scripts", "generate-shorts.ts");
const outFile = path.join(os.tmpdir(), `dp-shorts-${Date.now()}.mjs`);

await build({
  entryPoints: [entry],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  logLevel: "error",
});

// Forward CLI args (everything after the script name) to the bundled program.
process.argv = [process.argv[0], outFile, ...process.argv.slice(2)];
await import(pathToFileURL(outFile).href);
fs.unlink(outFile, () => {});
