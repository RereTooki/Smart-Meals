import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

type AiMealRequest = {
  diet: string;
  budget: number;
  mealsPerDay: number;
  preferences?: Record<string, unknown>;
  userNotes?: string;
};

type AiMeal = {
  name: string;
  calories: number;
  cost: number;
  description: string;
};

type AiMealResponse = {
  meals: AiMeal[];
  summary: string;
};

const API_KEY = process.env.AI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://smart-meals-eight.vercel.app",
];

const client = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

const buildPrompt = (data: AiMealRequest) => {
  const preferenceList = data.preferences
    ? Object.entries(data.preferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "None";

  return `Create ${data.mealsPerDay} balanced meals for a ${data.diet} diet that satisfies a daily budget of ${data.budget} Naira. Include cost and calories for each meal, keep descriptions concise, and respect any user preferences: ${preferenceList}. ${data.userNotes ? `Extra notes: ${data.userNotes}.` : ""} Output strictly valid JSON of the form {"meals": [{"name": "", "calories": 0, "cost": 0, "description": ""}], "summary": ""}.`;
};

const buildCorsHeaders = (origin?: string) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-KEY",
  };
};

const respond = (res: VercelResponse, status: number, body: unknown, origin?: string) => {
  Object.entries(buildCorsHeaders(origin)).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(body);
};

const callOpenAI = async (prompt: string) => {
  if (!client) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a nutrition assistant. Reply with strict JSON only.",
      },
      {
        role: "user",
        content:
          prompt.replace(/\s+/g, " ").trim() ||
          "Create a budget-friendly vegetarian plan.",
      },
    ],
    temperature: 0.4,
    max_output_tokens: 600,
  });

  const text =
    response.output
      ?.map((item) => {
        if (item.type === "output_text") {
          return item.text;
        }
        return "";
      })
      .join("")
      .trim() || "";

  return text;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    Object.entries(buildCorsHeaders(req.headers.origin as string | undefined)).forEach(([key, value]) =>
      res.setHeader(key, value)
    );
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    respond(res, 405, { error: "Method not allowed" }, req.headers.origin as string | undefined);
    return;
  }

  const payload = req.body as AiMealRequest;
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.diet !== "string" ||
    typeof payload.budget !== "number" ||
    typeof payload.mealsPerDay !== "number"
  ) {
    respond(
      res,
      400,
      { error: "Required parameters missing (diet, budget, mealsPerDay)." },
      req.headers.origin as string | undefined
    );
    return;
  }

  const prompt = buildPrompt(payload);

  try {
    const raw = (await callOpenAI(prompt)).trim();
    if (!raw) {
      throw new Error("Empty response from OpenAI.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Invalid JSON from OpenAI: ${err instanceof Error ? err.message : err}`);
    }

    const parsedObj = parsed as { meals?: AiMeal[]; summary?: string };
    const meals = (Array.isArray(parsedObj.meals) ? parsedObj.meals : []).map((meal) => ({
      name: String(meal.name ?? "Meal"),
      calories: Number(meal.calories ?? 0),
      cost: Number(meal.cost ?? 0),
      description: meal.description ? String(meal.description) : "",
    }));

    const summary = String(parsedObj.summary ?? `Customized ${meals.length} meal(s) for a ${payload.diet} diet.`);
    respond(res, 200, { meals, summary }, req.headers.origin as string | undefined);
  } catch (error) {
    console.error("AI plan generation failed", error);
    respond(res, 500, { error: "Unable to generate a smart plan at the moment." }, req.headers.origin as string | undefined);
  }
}
