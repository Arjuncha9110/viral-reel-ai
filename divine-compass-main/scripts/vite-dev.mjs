import { createServer } from "vite";
import os from "node:os";
import path from "node:path";
import configExport from "../vite.config.js";

const args = process.argv.slice(2);

const readFlagValue = (flagName) => {
  const index = args.findIndex((arg) => arg === flagName);
  if (index === -1) return undefined;
  return args[index + 1];
};

const hasFlag = (flagName) => args.includes(flagName);

const mode = process.env.MODE || "development";
const loadedConfig =
  typeof configExport === "function"
    ? await configExport({ command: "serve", mode })
    : configExport;

const host = readFlagValue("--host") ?? process.env.HOST ?? "127.0.0.1";
const portValue = readFlagValue("--port") ?? process.env.PORT;
const port = portValue ? Number(portValue) : undefined;
const open = hasFlag("--open") ? true : undefined;

const server = await createServer({
  ...loadedConfig,
  configFile: false,
  mode,
  cacheDir: path.join(os.tmpdir(), "divine-compass-vite-cache"),
  server: {
    ...(loadedConfig.server ?? {}),
    host,
    ...(Number.isFinite(port) ? { port } : {}),
    ...(open !== undefined ? { open } : {}),
  },
});

await server.listen();
server.printUrls();
server.bindCLIShortcuts?.({ print: true });

const shutdown = async () => {
  await server.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
