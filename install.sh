#!/usr/bin/env bash
# social-carousel one-line installer (Mac / Linux)
set -e

DEST="$HOME/.claude/skills/social-carousel"

if [ -d "$DEST" ]; then
  echo "→ social-carousel already installed at $DEST. Pulling latest…"
  git -C "$DEST" pull --ff-only
else
  echo "→ Cloning social-carousel to $DEST…"
  git clone https://github.com/guyaga/social-carousel "$DEST"
fi

echo "→ Installing dependencies…"
npm install --prefix "$DEST"

echo "→ Running setup…"
node "$DEST/setup.mjs"

echo
echo "✓ social-carousel installed."
echo "  Generate a carousel:  node $DEST/cli.mjs"
