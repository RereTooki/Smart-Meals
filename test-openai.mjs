import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  try {
    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: "Say hi",
    });
    console.log("status", response.status);
    console.log(response.output_text);
  } catch (err) {
    console.error("error", err);
  }
})();
