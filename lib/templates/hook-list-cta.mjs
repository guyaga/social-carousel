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
    usePerson: false,
    body: `MASSIVE bold headline filling most of the slide: "${content.hook}". Below it in smaller mono signal-red: "Swipe →". Pure typography only — no people, no portraits, no faces. Brand-locked palette only.`,
  });

  for (const pt of content.points) {
    slides.push({
      role: `point-${pt.n}`,
      n: pt.n + 1,
      usePerson: false,
      body: `Top-left massive bold numeral "0${pt.n}" in signal accent color. Below it bold headline in primary text color: "${pt.title}". Below the headline, body copy in mono/sans, smaller: "${pt.body}". Pure typography and brand geometric shapes only — NO people, NO portraits, NO faces, NO photographic elements. Brand-locked palette only.`,
    });
  }

  slides.push({
    role: "cta",
    n: 7,
    usePerson: true,
    body: `Personal closer slide. Photorealistic portrait of the brand owner from the person Reference Image on the right half, three-quarter body, looking at camera with confident inviting expression — preserve the EXACT face from Reference Image with 100% likeness. On the left half: bold headline in primary text color "${content.cta}". Below the headline, small mono signal-red label: "Save · Follow · Share". Brand logo Reference Image bottom-right at tasteful size. Brand-locked palette only.`,
  });

  return slides;
}
