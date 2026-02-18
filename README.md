# Smart Meals

Personalized meal planning web app built with **React + Vite**, Tailwind CSS, and Firebase services. The planner now calls a **Vercel serverless API** that asks OpenAI for a diet-aware, budget-friendly meal plan so every generation feels intelligent and contextual.

## Local Setup

1. `npm install`
2. `npm run dev` – starts the Vite dev server.
3. In a second terminal, run `vercel dev` so `/api/generate-smart-plan` is available locally. Set `VITE_AI_ENDPOINT` (in `.env.local`) to `http://127.0.0.1:3000/api/generate-smart-plan` if Vite runs on a different port, or leave it unset so the app uses `/api/generate-smart-plan` in production.
4. `npm run build` – runs TypeScript checks and bundles for production.
5. Optionally use `npm run preview` to test the production build locally once the AI backend is deployed.

## Firebase Services

- Firestore rules are in `firestore.rules` and keep `/users/{uid}` + `/mealPlans/{planId}` accessible only to the owning user while still making the `/test` demo collection readable from the homepage.
- Deploy those rules with `firebase deploy --only firestore:rules`.

### Firebase Config

`src/firebase/config.ts` exports `auth` and `db`. Auth stays connected to Firebase, and Firestore reads/writes are protected by the new rules above.

## AI-powered Meal Planner

The React planner (`src/components/MealPlanner.tsx`) now posts the user’s preferences to `/api/generate-smart-plan`, shows loading/error states, and saves the returned summary with every saved plan. When the AI endpoint is unreachable, a fallback sample plan keeps the UX flowing.

### Vercel API

1. `api/generate-smart-plan.ts` verifies the Firebase ID token (so only signed-in users can call it) and forwards the payload to OpenAI (default model `gpt-4o-mini`).
2. The function responds with `{ meals, summary }`, which the front end renders and persists exactly like before.

### Deploying to Vercel

1. `vercel login` and `vercel` from the repo root to link the project.
2. In Vercel’s dashboard add the following environment variables (Production & Preview):
   - `OPENAI_API_KEY` – your OpenAI key (keep it secret).
   - `FIREBASE_SERVICE_ACCOUNT` – the JSON string of a Firebase service account key (Settings ? Service accounts ? Generate new private key).
   - `OPENAI_MODEL` *(optional)* – override the default LLM if you want a cheaper/specialized model.
3. Deploy with `vercel --prod`. The same repo can host both the front end and API, so the app just fetches `/api/generate-smart-plan` when published.

## Local Secret Management

- Save Firebase’s service account JSON (downloaded from the console) to `.env.local` as `FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'`.
- Add `VITE_AI_ENDPOINT='http://127.0.0.1:3000/api/generate-smart-plan'` when running `vercel dev` together with Vite so they talk to the same backend.
- Never commit `.env.local` or the OpenAI key; rotate it on OpenAI if it is ever exposed.

## Additional Notes

- The AI endpoint calls OpenAI through the new `openai` SDK dependency (`api/generate-smart-plan.ts`).
- Firebase still powers Auth + Firestore, so the `mealPlans` collection is private to each signed-in user.
- The fallback plan ensures a generated view exists even if the API or OpenAI is down, preventing UX dead-ends.
