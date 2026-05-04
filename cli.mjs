#!/usr/bin/env node
// social-carousel CLI — interactive flow.
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { resolveBrand } from "./lib/brand-source.mjs";
import { buildSlidePrompt } from "./lib/coherence.mjs";
import { makeOutputDir, saveSlide, writeManifest } from "./lib/output.mjs";
import {
  TEMPLATE_NAME,
  TEMPLATE_LABEL,
  collectContent,
  buildSlideSpecs,
} from "./lib/templates/hook-list-cta.mjs";

import * as nano from "./lib/models/nano.mjs";
import * as gpt2 from "./lib/models/gpt2.mjs";

const SKILL_DIR = path.dirname(url.fileURLToPath(import.meta.url));

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ask = async (q, def) => {
    const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
    return a || def;
  };

  console.log("\n📐 social-carousel\n");

  // ── 1. Pick model ──
  const available = [];
  if (nano.isAvailable) available.push("nano");
  if (gpt2.isAvailable) available.push("gpt2");
  if (!available.length) {
    console.error("No image-gen API keys found. Set GEMINI_API_KEY and/or OPENAI_API_KEY.");
    process.exit(1);
  }

  let model;
  if (available.length === 1) {
    model = available[0];
    console.log(`Model: ${model} (only one available)`);
  } else {
    console.log("Pick image model:");
    console.log("  1) nano-banano-pro (Gemini 3 Pro)");
    console.log("  2) gpt-image-2 (OpenAI)");
    console.log("  3) both (compare)");
    const pick = await ask("Choice", "1");
    model = pick === "2" ? "gpt2" : pick === "3" ? "both" : "nano";
  }

  // ── 2. Resolve brand ──
  const { brand, resolved, source } = await resolveBrand({ skillDir: SKILL_DIR });
  console.log(`✓ Brand "${brand.name}" loaded from ${source}`);

  // ── 3. Pick template (only one for v0.1) ──
  console.log(`\nTemplate: ${TEMPLATE_LABEL}`);

  // ── 4. Collect content ──
  const content = await collectContent(rl);
  rl.close();

  // ── 5. Build slide specs ──
  const specs = buildSlideSpecs(content);
  const total = specs.length;

  const outDir = makeOutputDir(content.topic);
  console.log(`\n✓ Output dir: ${outDir}\n`);

  // ── 6. Generate slides ──
  const tasks = [];
  for (const spec of specs) {
    // Per-slide reference filtering: drop the person photo on slides that
    // explicitly opt out (most listicle-style content slides). Defaults to
    // including the person if a spec doesn't set `usePerson`.
    const slideRefs = [
      resolved?.logo,
      spec.usePerson === false ? null : resolved?.person,
    ].filter(Boolean);

    const slideResolved = {
      ...resolved,
      person: spec.usePerson === false ? null : resolved?.person,
    };

    const prompt = buildSlidePrompt({
      slideRole: spec.role,
      slideContent: spec.body,
      brand,
      resolved: slideResolved,
      slideNumber: spec.n,
      totalSlides: total,
    });

    if (model === "nano" || model === "both") {
      tasks.push(genOne({ outDir, spec, prompt, refs: slideRefs, modelName: "nano", modelTag: model === "both" ? "nano" : null }));
    }
    if (model === "gpt2" || model === "both") {
      tasks.push(genOne({ outDir, spec, prompt, refs: slideRefs, modelName: "gpt2", modelTag: model === "both" ? "gpt2" : null }));
    }
  }
  console.log(`Firing ${tasks.length} slide generation(s) in parallel…`);
  const results = await Promise.allSettled(tasks);

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const fail = results.length - ok;
  console.log(`\n✓ ${ok} slide(s) generated, ${fail} failed.`);

  // ── 7. Write manifest ──
  writeManifest({
    outDir,
    payload: {
      created_at: new Date().toISOString(),
      template: TEMPLATE_NAME,
      model,
      brand: brand.name,
      brand_source: source,
      content,
      results: results.map((r, i) => ({
        slide: specs[Math.floor(i / (model === "both" ? 2 : 1))].n,
        status: r.status,
        ...(r.status === "fulfilled" ? { file: r.value } : { error: String(r.reason) }),
      })),
    },
  });

  console.log(`\n📂 Open ${outDir}\n`);
}

async function genOne({ outDir, spec, prompt, refs, modelName, modelTag }) {
  const mod = modelName === "nano" ? nano : gpt2;
  try {
    const buf = await mod.generate({ prompt, aspect: "1:1", refs });
    return saveSlide({ outDir, slideNumber: spec.n, modelTag, buffer: buf });
  } catch (err) {
    throw new Error(`slide ${spec.n} (${modelName}): ${err.message}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
