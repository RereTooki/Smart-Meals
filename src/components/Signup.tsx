import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user && name.trim()) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name || email.split("@")[0],
        email,
        preferences: {
          diet: "normal",
          budget: 0,
          mealsPerDay: 3,
        },
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Unable to create account", err);
      setError("Something went wrong while creating your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/95 shadow-2xl rounded-3xl border border-emerald-100 p-8 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 font-semibold">
              Create account
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Join Smart Meals
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Start tracking your budget-friendly meal plans straight from the dashboard.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full name</span>
              <input
                type="text"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Mosope Oluwafemi"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input
                type="password"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 text-left">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-2xl font-semibold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Creating your account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
