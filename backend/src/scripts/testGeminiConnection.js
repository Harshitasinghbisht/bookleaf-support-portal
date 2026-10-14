import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file.");
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    console.log("Testing Gemini Interactions API...");

    const result = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input:
        "Classify this BookLeaf support ticket. " +
        "Subject: Royalty payment delayed. " +
        "Description: I have not received royalty payments for six months. " +
        "Reply with a suggested category, priority, and one-sentence reason.",
    });

    console.log("\nGemini response:");
    console.log(result.output_text);
  } catch (error) {
    console.error("\nGemini request failed.");
    console.error("Status:", error.status ?? "Unknown");
    console.error("Message:", error.message);
  }
}

main();