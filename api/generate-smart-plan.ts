import type { VercelRequest, VercelResponse } from "@vercel/node";

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
const COHERE_KEY = process.env.COHERE_API_KEY;
const COHERE_MODEL = process.env.COHERE_MODEL || "command";
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

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

const callCohere = async (prompt: string) => {
  if (!COHERE_KEY) {
    throw new Error("COHERE_API_KEY is required.");
  }

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${COHERE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a nutrition assistant that replies in JSON."
        },
        {
          role: "user",
          content: prompt.replace(/\\s+/g, " ").trim() || "Create a budget-friendly vegetarian plan."
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cohere inference failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.generations?.[0]?.message?.content ?? "";
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

  const key = req.headers["x-api-key"];
  if (!API_KEY || key !== API_KEY) {
    respond(res, 401, { error: "Invalid API key." }, req.headers.origin as string | undefined);
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
    const raw = (await callCohere(prompt)).trim();
    if (!raw) {
      throw new Error("Empty response from Cohere.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Invalid JSON from Cohere: ${err instanceof Error ? err.message : err}`);
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
