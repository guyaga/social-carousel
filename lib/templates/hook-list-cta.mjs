// Template: 7-slide carousel — hook + 5 numbered list items + CTA.

export const TEMPLATE_NAME = "hook-list-cta";
export const TEMPLATE_LABEL = "Hook + 5 numbered points + CTA (7 slides)";

export async function collectContent(rl) {
  const ask = async (q, def) => {
    const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
    return a || def;
  };

  console.log("\n— Carousel content —\n");
  const topic = await ask("Topic / slug (used for the output folder)", "my-carousel");
  const hook = await ask("Slide 1 — hook headline (≤8 words)");
  const cta = await ask("Slide 7 — CTA copy", "Save this. Follow @your-handle for more.");

  const points = [];
  for (let i = 1; i <= 5; i++) {
    console.log(`\n— Point ${i} —`);
    const title = await ask(`Title (≤6 words)`);
    const body = await ask(`One-sentence body`);
    points.push({ n: i, title, body });
  }

  return { topic, hook, points, cta };
}

export function buildSlideSpecs(content) {
  const slides = [];

  slides.push({
    role: "hook",
    n: 1,
    body: `MASSIVE bold headline filling most of the slide: "${content.hook}". Below it in smaller mono signal-red: "Swipe →". No imagery — pure typography. Brand-locked palette only.`,
  });

  for (const pt of content.points) {
    slides.push({
      role: `point-${pt.n}`,
      n: pt.n + 1,
      body: `Top-left massive bold numeral "0${pt.n}" in signal accent color. Below it bold headline in primary text color: "${pt.title}". Below the headline, body copy in mono/sans, smaller: "${pt.body}". Brand-locked palette only. No people in this slide unless the body explicitly mentions a person.`,
    });
  }

  slides.push({
    role: "cta",
    n: 7,
    body: `Centered bold headline: "${content.cta}". Below it a small mono label: "Save · Follow · Share". Bottom-right: brand logo from Reference Image (if provided). Brand-locked palette only.`,
  });

  return slides;
}
