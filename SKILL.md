---
name: social-carousel
description: Generate branded multi-slide social media carousels (Instagram, LinkedIn, X, Facebook) using AI image generation. Pick your model (nano-banano-pro / gpt-image-2 / both), pulls brand colors, fonts, logo, and person photo from your active brand-kit if installed (falls back to per-skill brand JSON or inline prompt). Outputs a numbered folder of slides plus a preview grid. Use when user says "make a carousel", "create instagram carousel", "linkedin carousel", "social carousel", or wants a multi-slide post.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Social Carousel

Generate on-brand multi-slide carousel posts in one command. Pulls colors, typography, logo, and even your person photo from your active `brand-kit` (or asks inline if no brand-kit is installed).

Pairs perfectly with [`brand-kit`](https://github.com/guyaga/brand-kit) but works standalone.

## Setup

### Step 1: Install Node 20+

### Step 2: Set API keys

You need at least one of:

```bash
# Mac / Linux
export GEMINI_API_KEY=...      # for nano-banano-pro (Gemini 3 Pro Image)
export OPENAI_API_KEY=sk-...   # for gpt-image-2

# Windows PowerShell
$env:GEMINI_API_KEY="..."
$env:OPENAI_API_KEY="sk-..."
```

If you only have one key, the skill picks that model automatically.

### Step 3: Install the skill

**Windows:**
```powershell
git clone https://github.com/guyaga/social-carousel "$env:USERPROFILE\.claude\skills\social-carousel"
cd "$env:USERPROFILE\.claude\skills\social-carousel"
npm install
node setup.mjs
```

**Mac / Linux:**
```bash
git clone https://github.com/guyaga/social-carousel ~/.claude/skills/social-carousel
cd ~/.claude/skills/social-carousel
npm install
node setup.mjs
```

### Step 4 (optional but recommended): Install brand-kit

```bash
git clone https://github.com/guyaga/brand-kit ~/.claude/skills/brand-kit
npm install --prefix ~/.claude/skills/brand-kit
node ~/.claude/skills/brand-kit/cli.mjs init
```

If you skip this, the carousel asks for your brand info inline the first time and saves it locally.

## Generate a carousel

Interactive (recommended for first run):
```bash
node ~/.claude/skills/social-carousel/cli.mjs
```

The flow:
1. **Pick model** — `nano-banano-pro` / `gpt-image-2` / `both`
2. **Resolve brand** — auto-loads from `brand-kit` if installed; otherwise asks
3. **Pick template** — currently `hook-list-cta` (7 slides). More templates coming.
4. **Provide content** — hook headline, 5 list items (title + body each), CTA copy
5. **Generate** — slides fire in parallel, saved to `~/carousels/<slug>-<date>/slide-NN.png`

## Brand source fallback chain

When a carousel needs brand tokens, it tries in this order:

1. `~/.claude/brand-kits/active.txt` (brand-kit) — if installed
2. `~/.claude/skills/social-carousel/brand.json` (local fallback) — saved on first inline prompt
3. Inline interview — pastes prompts into stdin, then saves to local fallback

Once a brand is resolved, it's locked across all slides of the carousel for visual coherence.

## Coherence rules

To avoid the "slide 3 looks like a different post" problem, every slide gets:

- The same brand palette (no per-slide color drift)
- The same `visual_style.description` from the brand
- The same logo placement
- The same person identity description (if used)
- The same aspect ratio (1:1 default; switchable to 4:5 for IG/LI feed)

## Output

```
~/carousels/<your-topic-slug>-2026-05-04/
├── slide-01.png
├── slide-02.png
├── …
├── slide-07.png
├── preview-grid.png       # contact-sheet preview of all slides
└── carousel.json          # the prompts + brand snapshot used (for re-runs)
```

## Pairs with

- [`brand-kit`](https://github.com/guyaga/brand-kit) — the brand source-of-truth this skill consumes.

## License

MIT.
