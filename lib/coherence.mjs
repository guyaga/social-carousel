// Builds the shared "style preamble" injected into every slide prompt
// to keep visual coherence across slides.

export function buildStylePreamble(brand) {
  const c = brand.colors;
  const v = brand.visual_style;
  const doRules = (v.do || []).join(", ");
  const dontRules = (v.dont || []).join(", ");
  return `
DESIGN STYLE (locked across all slides):
${v.description}.
Use ONLY these 4 brand colors:
  - primary background: ${c.primary}
  - signal accent: ${c.accent}
  - secondary/paper: ${c.secondary}
  - text/off-white: ${c.text}

DO: ${doRules || "geometric shapes, generous negative space"}
DON'T: ${dontRules || "gradients, 3D, drop shadows"}

Square 1:1 composition. Brutalist Swiss typography. Asymmetric grid. Crisp text rendering.
`.trim();
}

export function buildAssetBlock(brand, resolved) {
  const lines = [];
  if (resolved?.logo) {
    lines.push(`- Reference Image (logo): ${brand.assets.logo_alt || "wordmark"}. Place in bottom-right corner, white/off-white at tasteful small size.`);
  }
  if (resolved?.person && brand.assets.person_identity) {
    lines.push(`- Reference Image (person): A real photograph of the brand owner. Identity to preserve with 100% photographic likeness: ${brand.assets.person_identity}. Do NOT alter face, beard, hair, age. Must be instantly recognizable.`);
  }
  return lines.join("\n");
}

export function buildSlidePrompt({ slideRole, slideContent, brand, resolved, slideNumber, totalSlides }) {
  const style = buildStylePreamble(brand);
  const assets = buildAssetBlock(brand, resolved);
  return `
${style}

SLIDE ${slideNumber} of ${totalSlides} — role: ${slideRole}.

${slideContent}

${assets ? "REFERENCE IMAGES PROVIDED:\n" + assets : ""}
`.trim();
}
