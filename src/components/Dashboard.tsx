import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // fetch name from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "User");
        }
      } else {
        navigate("/auth"); // if not logged in, redirect
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

        {/* Saved Plans Section (placeholder) */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Saved Meal Plans
          </h2>
          <p className="text-gray-600 text-sm">
            You don’t have any saved plans yet. Go to the{" "}
            <Link to="/meal-planner" className="text-emerald-600 underline">
              Meal Planner
            </Link>{" "}
            to create your first plan.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
