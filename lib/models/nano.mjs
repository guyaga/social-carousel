// nano-banano-pro generator (Gemini 3 Pro Image Preview).
// Returns a Buffer with the generated PNG.
import * as fs from "node:fs";
import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export const isAvailable = !!ai;

export async function generate({ prompt, aspect = "1:1", refs = [] }) {
  if (!ai) throw new Error("GEMINI_API_KEY not set");

  const contents = [{ text: prompt }];
  for (const ref of refs) {
    if (!ref || !fs.existsSync(ref)) continue;
    const data = fs.readFileSync(ref).toString("base64");
    const mimeType = ref.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    contents.push({ inlineData: { mimeType, data } });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: aspect, imageSize: "2K" },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && !part.thought) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  throw new Error("nano-banano-pro returned no image");
}
