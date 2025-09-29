import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Preferences = () => {
  const [diet, setDiet] = useState("normal");
  const [budget, setBudget] = useState<number>(0);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Ensure user is logged in & fetch preferences
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

  // Handle save
  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      setSaving(true);
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, {
        preferences: {
          diet,
          budget,
          mealsPerDay,
        },
      });
      alert("Preferences saved successfully ✅");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-600">
        Loading Preferences...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Preferences</h1>

        <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
          {/* Diet Type */}
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

          {/* Budget */}
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

          {/* Meals Per Day */}
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              saving
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preferences;
