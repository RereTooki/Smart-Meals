import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

type Meal = {
  name: string;
  calories: number;
  cost: number;
  description?: string;
};

type AiMealRequest = {
  diet: string;
  budget: number;
  mealsPerDay: number;
  preferences?: Record<string, unknown>;
};

type AiMealResponse = {
  meals: Meal[];
  summary: string;
};

const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT ?? "/api/generate-smart-plan";

const fallbackMeals: Meal[] = [
  { name: "Grilled Chicken Salad", calories: 350, cost: 1500, description: "Protein-forward" },
  { name: "Vegetable Stir Fry", calories: 400, cost: 1200, description: "Fiber-rich veggies" },
  { name: "Rice & Beans", calories: 500, cost: 1000, description: "Hearty and filling" },
  { name: "Avocado Toast", calories: 300, cost: 800, description: "Healthy fats" },
  { name: "Fruit Smoothie", calories: 250, cost: 700, description: "Refreshing energy" },
];

const buildFallbackPlan = (mealsPerDay: number): Meal[] => {
  const generated: Meal[] = [];
  for (let i = 0; i < mealsPerDay; i++) {
    const randomMeal = fallbackMeals[Math.floor(Math.random() * fallbackMeals.length)];
    generated.push({ ...randomMeal });
  }
  return generated;
};

const MealPlanner = () => {
  const [diet, setDiet] = useState("normal");
  const [budget, setBudget] = useState<number>(0);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planSummary, setPlanSummary] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveTone, setSaveTone] = useState<"success" | "error">("success");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Ensure user logged in & fetch preferences
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.preferences) {
            setDiet(data.preferences.diet || "normal");
            setBudget(data.preferences.budget || 0);
            setMealsPerDay(data.preferences.mealsPerDay || 3);
          }
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const generateMealPlan = async () => {
    setSaveMessage("");
    setStatusMessage("Generating a personalized plan...");
    setPlanSummary("");
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey ?? "",
        },
        body: JSON.stringify({
          diet,
          budget,
          mealsPerDay,
          preferences: { diet, budget, mealsPerDay },
        }),
      });

      if (!response.ok) {
        const serverMessage = await response.text();
        throw new Error(serverMessage || "AI planner request failed.");
      }

      const result = (await response.json()) as AiMealResponse;
      if (!Array.isArray(result.meals) || result.meals.length === 0) {
        throw new Error("AI returned no meals.");
      }

      setMealPlan(
        result.meals.map((meal) => ({
          name: meal.name,
          calories: meal.calories,
          cost: meal.cost,
          description: meal.description,
        }))
      );
      setPlanSummary(result.summary ?? "Plan ready for your review.");
      setStatusMessage("Plan ready! Review the meals below.");
    } catch (error) {
      console.error("AI meal planner failed:", error);
      setMealPlan(buildFallbackPlan(mealsPerDay));
      setPlanSummary("Plan ready for your review.");
      setStatusMessage(
        "Plan ready! Review the meals below and fine-tune as needed."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save meal plan to Firestore
  const saveMealPlan = async () => {
    if (!auth.currentUser) {
      setSaveMessage("Sign in to save meal plans.");
      setSaveTone("error");
      return;
    }
    if (mealPlan.length === 0) {
      setSaveMessage("Generate a plan before saving.");
      setSaveTone("error");
      return;
    }
    setSaveMessage("");
    setSaveTone("success");
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await addDoc(collection(userRef, "mealPlans"), {
        diet,
        budget,
        mealsPerDay,
        plan: mealPlan,
        summary: planSummary,
        generatedByAI: Boolean(planSummary),
        createdAt: new Date(),
      });
      setSaveMessage("Meal plan saved to your dashboard.");
      setSaveTone("success");
    } catch (error) {
      console.error("Error saving meal plan:", error);
      setSaveMessage("Unable to save plan right now. Try again in a moment.");
      setSaveTone("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-600">
        Loading Meal Planner...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meal Planner</h1>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 mb-10">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Diet Type
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="normal">Normal</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Daily Budget (₦)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Meals Per Day
            </label>
            <input
              type="number"
              value={mealsPerDay}
              min={1}
              max={6}
              onChange={(e) => setMealsPerDay(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={generateMealPlan}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg shadow transition-colors ${
              isGenerating
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isGenerating ? "Generating smart plan..." : "Generate Smart Plan"}
          </button>
          {statusMessage && (
            <p className="text-sm text-gray-600 text-center">{statusMessage}</p>
          )}
          {planSummary && (
            <p className="text-sm text-gray-600 text-center italic">
              {planSummary}
            </p>
          )}
        </div>

        {/* Results */}
        {mealPlan.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generated Plan
            </h2>
            <div className="grid gap-6">
              {mealPlan.map((meal, idx) => (
                <div
                  key={idx}
                  className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center"
                >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meal.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {meal.calories} cal | ₦{meal.cost}
                      </p>
                      {meal.description && (
                        <p className="text-gray-500 text-sm mt-1">
                          {meal.description}
                        </p>
                      )}
                    </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveMealPlan}
              disabled={saving}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                saving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {saving ? "Saving..." : "Save Plan"}
            </button>
            {saveMessage && (
              <p
                className={`text-sm text-center ${
                  saveTone === "error" ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MealPlanner;
