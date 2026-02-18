# Smart Meals

Personalized meal planning web app built with **React + Vite**, Tailwind CSS, and Firebase services. The planner now calls a **Vercel serverless API** that samples from a curated meal library to generate diet- and budget-aware plans without relying on an external AI quota.

## Local Setup

1. 
pm install
2. 
pm run dev – starts the Vite dev server.
3. Open another terminal and run ercel dev so /api/generate-smart-plan is available locally. Keep VITE_AI_ENDPOINT pointed at http://127.0.0.1:3000/api/generate-smart-plan (set it in .env.local).
4. 
pm run build – runs TypeScript checks and bundles for production.
5. Optionally use 
pm run preview to verify the production build locally once the API is deployed.

## Firebase Services

- Firestore rules (irestore.rules) allow the public /test collection but restrict /users/{uid} and /mealPlans to only the owning user.
- Deploy the rules via irebase deploy --only firestore:rules whenever they change.

## AI-powered Meal Planner

src/components/MealPlanner.tsx now posts user preferences to /api/generate-smart-plan, shows load/error states, and saves the returned summary with every plan. When the backend fails it still shows the fallback sample plan so the UI stays responsive.

## Vercel API

1. pi/generate-smart-plan.ts trusts a shared X-API-KEY header, then picks meals from a local catalog while respecting the requested diet, budget, and calories.
2. The handler wraps the generated plan in { meals, summary } before replying to the front end.

## Deploying to Vercel

1. ercel login + ercel from the repo root.
2. Add this env var in Vercel (Preview + Production):
   - AI_API_KEY – header secret required by the API (used by the planner).
3. Run ercel --prod; the repo now hosts both the front end and API, so the planner hits /api/generate-smart-plan automatically.

## Local Secret Management

- In .env.local define the key you added to Vercel plus the local endpoint, e.g.:
  `
  VITE_AI_ENDPOINT=http://127.0.0.1:3000/api/generate-smart-plan
  VITE_API_KEY=<matches AI_API_KEY>
  AI_API_KEY=<shared secret>
  `
- Restart ercel dev after editing .env.local so the API uses the updated values.
- Keep .env.local out of source control; rotate the secret if it ever leaks.

## Additional Notes

- The local meal library runs inside pi/generate-smart-plan.ts, so no paid AI quota is required.
- Firebase Auth/Firestore continue to protect user data while the API relies only on the shared header secret.
- The planner falls back to hardcoded sample meals if the API becomes unavailable.

