import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Login = () => {
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
      setError("Please provide both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      setError("Unable to log in. Confirm your credentials or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/90 shadow-2xl rounded-3xl border border-emerald-100 p-8 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-500 font-semibold">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Log in to Smart Meals
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Securely access your plans, preferences, and dashboard insights.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              {loading ? "Signing in..." : "Continue with email"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            New to Smart Meals?{" "}
            <Link to="/signup" className="text-emerald-600 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
