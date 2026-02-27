# Smart Meals

Personalized meal planning web app built with **React + Vite**, Tailwind CSS, and Firebase services. The planner now calls a **Vercel serverless API** that asks Cohere's free-tier `command` model for diet-aware, budget-friendly meal plans and renders the structured JSON response.

## Local Setup

1. `npm install`
2. `npm run dev` – starts the Vite dev server.
3. Open another terminal and run `vercel dev` so `/api/generate-smart-plan` is available locally. Keep `VITE_AI_ENDPOINT` pointed at `http://127.0.0.1:3000/api/generate-smart-plan` (set it in `.env.local`).
4. `npm run build` – runs TypeScript checks and bundles for production.
5. Optionally use `npm run preview` to verify the production build locally once the API is deployed.

## Firebase Services

- Firestore rules (`firestore.rules`) allow the public `/test` collection but restrict `/users/{uid}` and `/mealPlans` to only the owning user.
- Deploy the rules via `firebase deploy --only firestore:rules` whenever they change.

## AI-powered Meal Planner

`src/components/MealPlanner.tsx` now posts user preferences to `/api/generate-smart-plan`, shows load/error states, and saves the returned summary with every plan. When the backend fails it still shows the fallback sample plan so the UI stays responsive.

## Vercel API

1. `api/generate-smart-plan.ts` trusts a shared `X-API-KEY` header, then calls Cohere's text generation API (default `command`) to get a structured JSON meal plan.
2. The handler wraps the response in `{ meals, summary }` before replying to the front end.

## Deploying to Vercel

1. `vercel login` + `vercel` from the repo root.
2. Add these env vars in Vercel (Preview + Production):
   - `AI_API_KEY` – header secret required by the API (used by the planner).
   - `COHERE_API_KEY` – your Cohere inference key (free tier available).
   - `COHERE_MODEL` *(optional)* – override the default `command` model.
3. Run `vercel --prod`; the repo now hosts both the front end and API, so the planner hits `/api/generate-smart-plan` automatically.

## Local Secret Management

- In `.env.local` define the keys you added to Vercel plus the local endpoint, e.g.:
  ```
  VITE_AI_ENDPOINT=http://127.0.0.1:3000/api/generate-smart-plan
  VITE_API_KEY=<matches AI_API_KEY>
  AI_API_KEY=<shared secret>
  COHERE_API_KEY=<your Cohere key>
  COHERE_MODEL=command
  ```
- Restart `vercel dev` after editing `.env.local` so the API uses the updated values.
- Keep `.env.local` out of source control; rotate the keys if they ever leak.

## Additional Notes

- The Cohere call happens in `api/generate-smart-plan.ts` via fetch and enforces the shared header secret.
- Firebase Auth/Firestore stay private while the backend only validates the shared key.
- The planner falls back to hardcoded sample meals if the API becomes unavailable.
