
import { classifyTicket } from "../services/aiService.js";

async function main() {
  const result = await classifyTicket({
    subject: "Royalty payment delayed",
    description: "I have not received royalty payments for six months.",
  });

  console.log("Classification result:");
  console.log(result);
}

main().catch(console.error);
