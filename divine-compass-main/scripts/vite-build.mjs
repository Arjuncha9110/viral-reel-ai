import { build } from "vite";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import configExport from "../vite.config.js";

const args = process.argv.slice(2);

const readFlagValue = (flagName) => {
  const index = args.findIndex((arg) => arg === flagName);
  if (index === -1) return undefined;
  return args[index + 1];
};

const mode = readFlagValue("--mode") ?? process.env.MODE ?? "production";
const ssr = readFlagValue("--ssr");
const outDir = readFlagValue("--outDir");
const skipPublicCopy = process.env.SKIP_PUBLIC_COPY === "1";

const copyPublicDir = (sourceDir, targetDir) => {
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    try {
      if (entry.isDirectory()) {
        copyPublicDir(sourcePath, targetPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EBUSY") {
        console.warn(`[vite-build] Skipped locked public asset: ${targetPath}`);
        continue;
      }
      throw error;
    }
  }
};

const loadedConfig =
  typeof configExport === "function"
    ? await configExport({ command: "build", mode })
    : configExport;

await build({
  ...loadedConfig,
  configFile: false,
  mode,
  publicDir: false,
  cacheDir: path.join(os.tmpdir(), "divine-compass-vite-cache"),
  build: {
    ...(loadedConfig.build ?? {}),
    ...(ssr ? { ssr } : {}),
    ...(outDir ? { outDir } : {}),
  },
});

if (!ssr && !skipPublicCopy) {
  const resolvedOutDir = path.resolve(
    loadedConfig.root ?? process.cwd(),
    outDir ?? loadedConfig.build?.outDir ?? "dist",
  );
  const resolvedPublicDir = path.resolve(loadedConfig.root ?? process.cwd(), "public");
  copyPublicDir(resolvedPublicDir, resolvedOutDir);
}
