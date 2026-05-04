// gpt-image-2 generator (OpenAI). Returns a Buffer with the generated PNG.
import * as fs from "node:fs";
import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY ? new OpenAI() : null;
export const isAvailable = !!client;

const SIZE_MAP = {
  "1:1": "1024x1024",
  "4:5": "1024x1280",
  "16:9": "1536x1024",
};

export async function generate({ prompt, aspect = "1:1", refs = [], quality = "high" }) {
  if (!client) throw new Error("OPENAI_API_KEY not set");
  const size = SIZE_MAP[aspect] || "1024x1024";

  const opts = {
    model: "gpt-image-2",
    prompt,
    size,
    quality,
    n: 1,
  };

  let result;
  if (refs && refs.length) {
    const images = refs
      .filter((r) => r && fs.existsSync(r))
      .map((r) => fs.createReadStream(r));
    if (images.length) opts.image = images;
    result = await client.images.edit(opts);
  } else {
    result = await client.images.generate(opts);
  }

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("gpt-image-2 returned no image");
  return Buffer.from(b64, "base64");
}
