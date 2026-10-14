
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

// Replace with a model currently available to your API key.
const MODEL = "gemini-3.8-flash";

async function generateWithRetry(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model: MODEL,
        contents: `
          Classify this BookLeaf support ticket.

          Subject: Royalty payment delayed
          Description: I have not received royalty for six months.

          Return JSON containing category, priority, and reason.
        `,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (error) {
      const status = error.status;
      const retryable = [429, 500, 502, 503, 504].includes(status);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = attempt * 2000;

      console.log(
        `Temporary AI error (${status}). Retrying in ${delayMs / 1000}s...`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

try {
  const response = await generateWithRetry();

  console.log("Gemini response:");
  console.log(response.text);
} catch (error) {
  console.error("Gemini API request failed.");

  if (error.status === 503) {
    console.error("The model is temporarily unavailable after retries.");
  } else {
    console.error(error.message);
  }

  process.exitCode = 1;
}
