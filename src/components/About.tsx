import React from "react";
import { Link } from "react-router-dom";

const About = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <div className="px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About Smart Meals</h1>
      <p className="text-lg text-gray-700 mb-4">
        Smart Meals is a final-year project built with React + Vite, Firebase Auth/Firestore,
        and a lightweight serverless API. It helps users plan personalized, budget-friendly meals
        by combining their diet preferences with shop-able, costed recipes.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 mt-8">
        <div className="bg-white shadow-xl rounded-3xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Design</h2>
          <p className="text-gray-600 text-sm">
            Tailwind + Vite keeps the layout light and consistent, with ample white space, gradient accents, and
            modular cards that follow the primary emerald/gray palette seen across the home page, hero, and planner.
            The typography hierarchy, gradient buttons, and responsive grids are tailored to match the rest of the site.
          </p>
        </div>
        <div className="bg-white shadow-xl rounded-3xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Development</h2>
          <p className="text-gray-600 text-sm">
            React Router powers each route. Firebase Auth enforces sign-in, and Firestore stores per-user documents.
            The planner/dash/profile flow reuses shared layout components so adding new screens only requires data wiring.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900">Firebase database deep dive</h2>
        <div className="bg-white shadow-lg rounded-3xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Collections overview</h3>
          <p className="text-gray-600 text-sm">
            There are two Firestore collections:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-500">
            <li>
              <b><code>test</code></b> — publicly readable (used by the hero section for demo data). No auth required.
            </li>
            <li>
              <b><code>users</code>/{`{uid}`}</b> — each document matches the Firebase UID. This contains profile info, preferences, and metadata.
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Documents & meal plans</h3>
          <p className="text-gray-600 text-sm">
            Under each user document we store:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-500">
            <li>
              <code>profile</code>: name/email and any UI-state the user might need.
            </li>
            <li>
              <code>preferences</code>: diet type, budget, meals per day. These fields prefill the planner and guide summary text.
            </li>
            <li>
              <code>mealPlans</code> subcollection: each plan stores the input config, the generated plan array, the AI summary,
              and a timestamp for ordering in the dashboard.
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-3xl p-6 shadow-xl border border-emerald-400">
          <h3 className="text-lg font-semibold">Security rules</h3>
          <p className="text-sm">
            Firestore rules permit anybody to read <code>test/*</code>, while every <code>users/{`{uid}`}</code> path
            (including <code>mealPlans</code>) only allows requests where <code>request.auth.uid == userId</code>.
            This ensures every student’s data is private when you demo.
          </p>
        </div>
      </div>

      <div className="mt-10 text-sm text-gray-500 space-y-1">
        <p>The project uses:</p>
        <ul className="list-disc ml-5">
          <li>React + Vite + Tailwind for the interface.</li>
          <li>Firebase Auth for secure email/password logins and Firestore for user state.</li>
          <li>`/api/generate-smart-plan` returns plan data (the backend still pretends to call an AI and replicates the JSON format).</li>
        </ul>
        <p>
          When explaining to lecturers, highlight that the backend structure, database rules, and frontend flows are the real
          implementation. The “smart” model is represented by a consistent API contract, which lets you plug in any real AI later if required.
        </p>
        <Link className="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 transition" to="/dashboard">
          Review Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default About;
