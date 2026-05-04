// Manage output folder + manifest.
import * as fs from "node:fs";
import * as path from "node:path";
import { homedir } from "node:os";

export function makeOutputDir(topic) {
  const slug = String(topic || "carousel")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const today = new Date().toISOString().slice(0, 10);
  const root = path.join(homedir(), "carousels", `${slug}-${today}`);
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function saveSlide({ outDir, slideNumber, modelTag, buffer }) {
  const num = String(slideNumber).padStart(2, "0");
  const file = path.join(outDir, modelTag ? `slide-${num}-${modelTag}.png` : `slide-${num}.png`);
  fs.writeFileSync(file, buffer);
  return file;
}

export function writeManifest({ outDir, payload }) {
  const file = path.join(outDir, "carousel.json");
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n");
  return file;
}
