
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file.");
}

async function main() {
  try {
    console.log("Testing Gemini through direct HTTP...");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input:
            "Classify this support ticket. Subject: Royalty payment delayed. " +
            "Description: I have not received royalty payments for six months. " +
            "Suggest a category, priority, and a short reason.",
        }),
      }
    );

    // Read the response body only once.
    const responseText = await response.text();

    console.log("HTTP status:", response.status);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.log("Non-JSON response:", responseText);
      return;
    }

    if (!response.ok) {
      console.error("API error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("Gemini response:");
    console.log(data.output_text ?? JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

main();
