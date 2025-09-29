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
};

const MealPlanner = () => {
  const [diet, setDiet] = useState("normal");
  const [budget, setBudget] = useState<number>(0);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Dummy meal generator
  const generateMealPlan = () => {
    const sampleMeals: Meal[] = [
      { name: "Grilled Chicken Salad", calories: 350, cost: 1500 },
      { name: "Vegetable Stir Fry", calories: 400, cost: 1200 },
      { name: "Rice & Beans", calories: 500, cost: 1000 },
      { name: "Avocado Toast", calories: 300, cost: 800 },
      { name: "Fruit Smoothie", calories: 250, cost: 700 },
    ];

    const generated = [];
    for (let i = 0; i < mealsPerDay; i++) {
      const randomMeal =
        sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
      generated.push(randomMeal);
    }
    setMealPlan(generated);
  };

  // Save meal plan to Firestore
  const saveMealPlan = async () => {
    if (!auth.currentUser) return;
    try {
      setSaving(true);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await addDoc(collection(userRef, "mealPlans"), {
        diet,
        budget,
        mealsPerDay,
        plan: mealPlan,
        createdAt: new Date(),
      });
      alert("Meal plan saved successfully ✅");
    } catch (error) {
      console.error("Error saving meal plan:", error);
      alert("Failed to save meal plan ❌");
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
            className="w-full bg-emerald-600 text-white py-3 rounded-lg shadow hover:bg-emerald-700 transition-colors"
          >
            Generate Meal Plan
          </button>
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MealPlanner;
