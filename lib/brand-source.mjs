// Brand source fallback chain:
//   1. ~/.claude/brand-kits/active.txt (brand-kit)
//   2. <skill>/brand.json (local cache)
//   3. inline interview, saved to local cache
import * as fs from "node:fs";
import * as path from "node:path";
import { homedir } from "node:os";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const BRAND_KIT_DIR = path.join(homedir(), ".claude", "brand-kits");
const BRAND_KIT_LIB = path.join(homedir(), ".claude", "skills", "brand-kit", "lib", "render.mjs");

export async function resolveBrand({ skillDir }) {
  // 1. Try brand-kit
  if (fs.existsSync(BRAND_KIT_LIB)) {
    try {
      const url = "file:///" + BRAND_KIT_LIB.replace(/\\/g, "/");
      const mod = await import(url);
      const active = await mod.getActiveBrand();
      if (active) {
        return { ...active, source: "brand-kit" };
      }
    } catch (err) {
      console.warn("(brand-kit found but failed to load:", err.message + ")");
    }
  }

  // 2. Try local fallback
  const localFile = path.join(skillDir, "brand.json");
  if (fs.existsSync(localFile)) {
    const brand = JSON.parse(fs.readFileSync(localFile, "utf8"));
    return { brand, source: "local", sourcePath: localFile, resolved: { logo: null, person: null } };
  }

  // 3. Inline interview
  const brand = await runInlineInterview();
  fs.writeFileSync(localFile, JSON.stringify(brand, null, 2) + "\n");
  console.log(`✓ Saved brand to ${localFile}`);
  return { brand, source: "inline", sourcePath: localFile, resolved: { logo: null, person: null } };
}

async function runInlineInterview() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ask = async (q, def) => {
    const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
    return a || def;
  };

  console.log("\nNo brand-kit found. Quick brand setup (you only do this once).\n");

  const brand = {
    schema_version: 1,
    name: await ask("Brand name (slug)", "my-brand"),
    colors: {
      primary: await ask("Primary color (hex)", "#111111"),
      accent: await ask("Accent color (hex)", "#E63B2E"),
      secondary: await ask("Secondary color (hex)", "#E8E4DD"),
      text: await ask("Text color (hex)", "#F5F3EE"),
    },
    typography: {
      headline: await ask("Headline font", "DM Serif Display"),
      body: await ask("Body font", "Space Grotesk"),
      mono: await ask("Mono font", "Space Mono"),
      rtl: await ask("RTL font (optional)", "Rubik"),
    },
    voice: {
      tone: await ask("Voice tone", "direct, confident"),
      rules: ["no emojis"],
    },
    visual_style: {
      description: await ask("Visual style (one sentence)", "minimal editorial"),
      do: [],
      dont: [],
    },
    assets: { logo: "", logo_alt: "", person: "", person_identity: "" },
  };

  rl.close();
  return brand;
}
