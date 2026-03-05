import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Navbar />

      <main className="flex-1 px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <section className="bg-white/90 border border-gray-100 shadow-xl rounded-3xl p-8 md:p-12">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-500 font-semibold">
                Smart Meal Planner
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                Smart Meal Planner based on diet, preferences, and budget
              </h1>
              <p className="text-gray-600 text-lg">
                A final-year project submitted to the Department of Computer
                Science at Babcock University. Smart Meal Planner combines
                Firebase Auth, Firestore, and a lightweight API to deliver
                customizable, cost-aware meal plans that students can defend
                with confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest">
                  React + Vite + Tailwind
                </span>
                <span className="px-4 py-2 rounded-full border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest">
                  Firebase Auth + Firestore
                </span>
                <span className="px-4 py-2 rounded-full border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest">
                  Serverless API
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="bg-white border border-gray-100 shadow-lg rounded-3xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">Design</h2>
              <p className="text-gray-600 text-sm">
                The interface follows a consistent emerald and neutral palette,
                with rounded cards, elevated CTAs, and responsive spacing that
                mirror the theme used across the homepage and planner screens.
                Every layout block uses Tailwind utility classes for margins,
                typography, and gradients to keep the experience cohesive during
                a live demo.
              </p>
            </article>
            <article className="bg-white border border-gray-100 shadow-lg rounded-3xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">Development</h2>
              <p className="text-gray-600 text-sm">
                React Router orchestrates the routed experience, while shared
                components like <em>Navbar</em> and <em>Footer</em> keep brand
                continuity. Firebase Auth gatekeeps the planner, dashboard, and
                profile screens, while Firestore stores user state and plan
                history, all wrapped inside a Vercel serverless API for
                plan-generation requests.
              </p>
            </article>
          </section>

          <section className="bg-white border border-gray-100 shadow-lg rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Firebase database deep dive
              </h2>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-emerald-50 text-emerald-600">
                rules enforced
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Collections
                </h3>
                <ul className="list-disc ml-6 text-gray-600 text-sm space-y-1">
                  <li>
                    <code>test</code> — public demo data used by the hero section
                    on the homepage. Open read access for showcasing the
                    collection without auth.
                  </li>
                  <li>
                    <code>users/{`{uid}`}</code> — every user document matches
                    the Firebase UID and acts as the root for the user’s auth
                    profile, preferences, and secure plan history.
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Security & structure
                </h3>
                <p className="text-gray-600 text-sm">
                  Firestore rules only allow the authenticated UID to read/write
                  <code>users/{`{uid}`}</code> paths, including the
                  <code>mealPlans</code> subcollection. This keeps every
                  individual’s data private during the project defense.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-2">
              <p className="text-sm text-emerald-700 font-semibold">
                Document layout
              </p>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-2">
                <li>
                  <strong>profile</strong> — stores the display name, email,
                  and metadata derived from Firebase Auth.
                </li>
                <li>
                  <strong>preferences</strong> — diet, budget, and meals-per-day
                  values that prefill the planner and guide each plan request.
                </li>
                <li>
                  <strong>mealPlans (subcollection)</strong> — every saved plan
                  includes the originating budget/diet, the generated meal array,
                  the summary text, and a timestamp for ordering.
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white border border-gray-100 shadow-lg rounded-3xl p-8 space-y-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-gray-900">How the API responds</h2>
              <p className="text-gray-600 text-sm">
                The <code>/api/generate-smart-plan</code> endpoint exposes a
                consistent JSON payload: an array of meals with <code>name</code>,
                <code>cost</code>, <code>calories</code>, and <code>description</code>,
                plus a <code>summary</code> string. The frontend speaks to this
                contract via a shared <code>X-API-KEY</code> header, which keeps
                the planner responsive even while a more advanced model could be
                introduced later.
              </p>
              <p className="text-gray-600 text-sm">
                During the defense you can explain that the API encapsulates the
                “smart” part of the project — the same structure can later be
                wired to a paid or open-source model without requiring any
                UI changes.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center w-fit rounded-2xl bg-emerald-600 text-white px-6 py-3 text-sm font-semibold shadow hover:bg-emerald-700 transition"
            >
              Review dashboard data
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
