import type { VercelRequest, VercelResponse } from "@vercel/node";

type AiMealRequest = {
  diet: string;
  budget: number;
  mealsPerDay: number;
  preferences?: Record<string, unknown>;
  userNotes?: string;
};

type Meal = {
  name: string;
  calories: number;
  cost: number;
  dietTags: string[];
  description: string;
};

type AiMealResponse = {
  meals: { name: string; calories: number; cost: number; description: string }[];
  summary: string;
};

const MEAL_LIBRARY: Meal[] = [
  { name: "Grilled Chicken Salad", calories: 350, cost: 1500, dietTags: ["normal", "keto"], description: "High-protein, leafy greens" },
  { name: "Spiced Lentil Stew", calories: 420, cost: 1200, dietTags: ["vegetarian", "vegan"], description: "Rich in fiber and spices" },
  { name: "Quinoa & Roasted Veggie Bowl", calories: 460, cost: 1300, dietTags: ["normal", "vegan"], description: "Whole grains + seasonal veg" },
  { name: "Avocado Egg Toast", calories: 400, cost: 1100, dietTags: ["normal", "vegetarian"], description: "Healthy fats + protein" },
  { name: "Spicy Fish Tacos", calories: 520, cost: 1600, dietTags: ["normal"], description: "Lean fish with peppers" },
  { name: "Curried Chickpea Wrap", calories: 430, cost: 1000, dietTags: ["vegetarian"], description: "Legumes + warm spices" },
  { name: "Zesty Tofu Stir-fry", calories: 380, cost: 1250, dietTags: ["vegan"], description: "Tofu + crunchy veg" },
  { name: "Grilled Steak & Kale", calories: 540, cost: 1900, dietTags: ["normal", "keto"], description: "Iron-rich with greens" },
  { name: "Sweet Plantain Porridge", calories: 480, cost: 900, dietTags: ["vegetarian"], description: "Comforting millet base" },
  { name: "Garlic Shrimp & Couscous", calories: 450, cost: 1500, dietTags: ["normal"], description: "Lean protein with grains" },
];

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

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

const API_KEY = process.env.AI_API_KEY;

const generatePlan = (payload: AiMealRequest) => {
  const filterTag = payload.diet?.toLowerCase() || "normal";
  const budgetPerMeal = payload.budget || 0;
  const pool = MEAL_LIBRARY.filter((meal) => meal.dietTags.includes(filterTag));
  const sanitizedPool = pool.length ? pool : MEAL_LIBRARY;

  const plan: AiMealResponse["meals"] = [];
  for (let i = 0; i < payload.mealsPerDay; i++) {
    const choice = sanitizedPool[(Math.random() * sanitizedPool.length) | 0];
    const adjustedCost = Math.max(350, Math.min(choice.cost, budgetPerMeal || choice.cost));
    plan.push({
      name: choice.name,
      calories: choice.calories,
      cost: adjustedCost,
      description: choice.description,
    });
  }

  const summary = `Generated ${plan.length} ${payload.diet} meal${plan.length === 1 ? "" : "s"} that stay within a daily budget of ₦${payload.budget}.`;
  return { meals: plan, summary };
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

  const generated = generatePlan(payload);
  respond(res, 200, generated, req.headers.origin as string | undefined);
}
