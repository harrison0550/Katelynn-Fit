import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const serviceWorker = readFileSync(join(root, "public", "sw.js"), "utf8");
const program = readFileSync(join(root, "app", "program.ts"), "utf8");
const cachedPaths = [...serviceWorker.matchAll(/^\s*"(assets\/[^"\n]+)"/gm)].map((match) => match[1]);
const programPaths = [...program.matchAll(/src:\s*"(assets\/[^"\n]+)"/g)].map((match) => match[1]);
const missingFiles = cachedPaths.filter((path) => !existsSync(join(root, "public", ...path.split("/"))));
const uncachedProgramMedia = programPaths.filter((path) => !cachedPaths.includes(path));

if (missingFiles.length || uncachedProgramMedia.length) {
  if (missingFiles.length) console.error(`Missing cached media:\n${missingFiles.join("\n")}`);
  if (uncachedProgramMedia.length) console.error(`Program media absent from offline cache:\n${uncachedProgramMedia.join("\n")}`);
  process.exit(1);
}

console.log(`Validated ${cachedPaths.length} offline media files and ${programPaths.length} program references.`);
