// First-run setup for social-carousel.
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { homedir } from "node:os";

const SKILL_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const HAS_GEMINI = !!process.env.GEMINI_API_KEY;
const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const BRAND_KIT_INSTALLED = fs.existsSync(
  path.join(homedir(), ".claude", "skills", "brand-kit", "lib", "render.mjs")
);

console.log("\n📐 social-carousel — setup\n");

if (!HAS_GEMINI && !HAS_OPENAI) {
  console.log("⚠ No image-gen API keys found.");
  console.log("  Set at least one before generating:");
  console.log("    Mac/Linux:   export GEMINI_API_KEY=...");
  console.log("                 export OPENAI_API_KEY=sk-...");
  console.log("    Windows PS:  $env:GEMINI_API_KEY=\"...\"");
  console.log("                 $env:OPENAI_API_KEY=\"sk-...\"");
} else {
  console.log("API keys detected:");
  if (HAS_GEMINI) console.log("  ✓ GEMINI_API_KEY  (nano-banano-pro available)");
  if (HAS_OPENAI) console.log("  ✓ OPENAI_API_KEY  (gpt-image-2 available)");
}

console.log("");
if (BRAND_KIT_INSTALLED) {
  console.log("✓ brand-kit detected — carousels will auto-pull your active brand.");
} else {
  console.log("ℹ brand-kit NOT installed.");
  console.log("  social-carousel will work standalone — it'll ask for your brand once and cache it locally.");
  console.log("  For shared brand profiles across multiple skills, install brand-kit:");
  console.log("    https://github.com/guyaga/brand-kit");
}

console.log("");
console.log("Generate your first carousel:");
console.log(`  node "${path.join(SKILL_DIR, "cli.mjs")}"`);
console.log("");
