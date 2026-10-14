import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file.");
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    const models = await ai.models.list();

    console.log("Models available to this API key:\n");

    for await (const model of models) {
      console.log(model.name);
    }
  } catch (error) {
    console.error("Could not list models.");
    console.error("Status:", error.status ?? "Unknown");
    console.error("Message:", error.message);
  }
}

main();