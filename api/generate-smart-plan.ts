import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { OpenAI } from 'openai';

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
  cuisine?: string;
  description?: string;
};

type AiMealResponse = {
  meals: AiMeal[];
  summary: string;
};

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const getOpenAI = () => {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }
  return new OpenAI({ apiKey: openaiKey });
};

const initFirebaseAdmin = () => {
  if (admin.apps.length) return;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be set before verifying tokens.');
  }
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });
};

const buildPrompt = (data: AiMealRequest) => {
  const preferenceList = data.preferences
    ? Object.entries(data.preferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : 'None';

  return `Create ${data.mealsPerDay} balanced meals for a ${data.diet} diet that satisfies a daily budget of ${data.budget} Naira. Include cost and calories for each meal, keep descriptions concise, and respect any user preferences: ${preferenceList}. ${
    data.userNotes ? `Extra notes: ${data.userNotes}.` : ''
  } Output strictly valid JSON of the form {"meals": [{"name": "", "calories": 0, "cost": 0, "description": ""}], "summary": ""}.`;
};

const validatePayload = (body: unknown): body is AiMealRequest => {
  if (!body || typeof body !== 'object') return false;
  const payload = body as Record<string, unknown>;
  const isNumber = (value: unknown) => typeof value === 'number' && !Number.isNaN(value);
  return (
    typeof payload.diet === 'string' &&
    isNumber(payload.budget) &&
    isNumber(payload.mealsPerDay)
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    res.status(401).json({ error: 'Missing authentication token.' });
    return;
  }

  let payload: AiMealRequest;
  if (!validatePayload(req.body)) {
    res.status(400).json({ error: 'Required parameters missing (diet, budget, mealsPerDay).' });
    return;
  }
  payload = req.body;

  try {
    initFirebaseAdmin();
    await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Token verification failed', error);
    res.status(401).json({ error: 'Invalid or expired Firebase token.' });
    return;
  }

  const prompt = buildPrompt(payload);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful nutrition assistant that creates affordable, culturally aware meal plans. Always return JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.65,
      max_tokens: 900,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      throw new Error('Empty response from OpenAI.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Invalid JSON from OpenAI: ${err instanceof Error ? err.message : err}`);
    }

    const parsedObj = parsed as { meals?: AiMeal[]; summary?: string };
    const meals = (Array.isArray(parsedObj.meals) ? parsedObj.meals : []).map((meal) => ({
      name: String(meal.name ?? 'Meal'),
      calories: Number(meal.calories ?? 0),
      cost: Number(meal.cost ?? 0),
      cuisine: meal.cuisine ? String(meal.cuisine) : undefined,
      description: meal.description ? String(meal.description) : undefined,
    }));

    const summary = String(
      parsedObj.summary ?? `Customized ${meals.length} meal(s) for a ${payload.diet} diet.`
    );

    res.status(200).json({ meals, summary });
  } catch (error) {
    console.error('AI plan generation failed', error);
    res.status(500).json({ error: 'Unable to generate a smart plan at the moment.' });
  }
}
