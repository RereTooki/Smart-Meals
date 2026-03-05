import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

type MealRecord = {
  name: string;
  calories: number;
  cost: number;
  description?: string;
};

type SavedPlan = {
  id: string;
  diet: string;
  budget: number;
  mealsPerDay: number;
  summary?: string;
  plan: MealRecord[];
  createdAtLabel?: string;
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for auth state
  useEffect(() => {
    let unsubscribePlans: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "SmartMeal user");
        }

        setPlansLoading(true);
        const plansRef = collection(db, "users", currentUser.uid, "mealPlans");
        const plansQuery = query(plansRef, orderBy("createdAt", "desc"));
        unsubscribePlans = onSnapshot(
          plansQuery,
          (snapshot) => {
            const plans = snapshot.docs.map((planDoc) => {
              const planData = planDoc.data();
              const rawCreated = planData.createdAt;
              let createdAtLabel = "";
              if (rawCreated?.toDate) {
                createdAtLabel = rawCreated
                  .toDate()
                  .toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  });
              } else if (rawCreated instanceof Date) {
                createdAtLabel = rawCreated.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
              }

              return {
                id: planDoc.id,
                diet: planData.diet ?? "normal",
                budget: planData.budget ?? 0,
                mealsPerDay: planData.mealsPerDay ?? 0,
                summary: planData.summary ?? "",
                plan: Array.isArray(planData.plan)
                  ? planData.plan.map((meal: any) => ({
                      name: meal.name ?? "Meal",
                      calories: Number(meal.calories ?? 0),
                      cost: Number(meal.cost ?? 0),
                      description: meal.description,
                    }))
                  : [],
                createdAtLabel,
              };
            });
            setSavedPlans(plans);
            setPlansLoading(false);
          },
          (error) => {
            console.error("Error loading saved plans:", error);
            setPlansLoading(false);
          }
        );
      } else {
        navigate("/login");
        setPlansLoading(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribePlans) {
        unsubscribePlans();
      }
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome back, <span className="text-emerald-600">{name}</span> 👋
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Link Cards */}
          <Link
            to="/meal-planner"
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🍽️ Meal Planner
            </h2>
            <p className="text-gray-600 text-sm">
              Generate meal plans tailored to your budget and preferences.
            </p>
          </Link>

          <Link
            to="/preferences"
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ⚙️ Preferences
            </h2>
            <p className="text-gray-600 text-sm">
              Set your diet type, daily budget, and meals per day.
            </p>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              👤 Profile
            </h2>
            <p className="text-gray-600 text-sm">
              Manage your account details and sign out securely.
            </p>
          </Link>
        </div>

        {/* Saved Plans */}
        <section className="mt-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Saved Meal Plans
            </h2>
            <Link
              to="/meal-planner"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Generate another plan → 
            </Link>
          </div>
          {plansLoading ? (
            <p className="text-gray-600 text-sm mt-3">
              Loading meal plan history…
            </p>
          ) : savedPlans.length === 0 ? (
            <p className="text-gray-600 text-sm mt-3">
              You don’t have any saved plans yet. Use the{" "}
              <Link to="/meal-planner" className="text-emerald-600 underline">
                Meal Planner
              </Link>{" "}
              to capture a plan and it will appear here instantly.
            </p>
          ) : (
            <div className="grid gap-6 mt-6">
              {savedPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4 group transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        {plan.createdAtLabel || "Saved plan"}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {plan.summary || `${plan.diet} meal plan`}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                      {plan.mealsPerDay} meals/day
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-sm text-gray-600">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Diet
                      </p>
                      <p className="font-semibold text-gray-900">{plan.diet}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Budget
                      </p>
                      <p className="font-semibold text-gray-900">
                        ₦{plan.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Generated
                      </p>
                      <p className="font-semibold text-gray-900">
                        {plan.createdAtLabel || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Meals included
                    </p>
                    {plan.plan.length === 0 ? (
                      <p className="text-gray-500">No meal detail recorded.</p>
                    ) : (
                      <ul className="space-y-1">
                        {plan.plan.slice(0, 3).map((meal, idx) => (
                          <li
                            key={`${plan.id}-${meal.name}-${idx}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                          >
                            <span className="font-semibold text-gray-900">
                              {meal.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {meal.calories} cal • ₦{meal.cost}
                            </span>
                          </li>
                        ))}
                        {plan.plan.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{plan.plan.length - 3} more meals saved
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
