import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, type DocumentData } from "firebase/firestore";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DocumentData | null>(null);
  const [createdAtLabel, setCreatedAtLabel] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        const rawCreated = data.createdAt;
        let label = "";
        if (rawCreated?.toDate) {
          label = rawCreated
            .toDate()
            .toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
        } else if (rawCreated instanceof Date) {
          label = rawCreated.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        }
        setCreatedAtLabel(label);
      } else {
        setProfile({
          name: currentUser.displayName || "SmartMeal user",
          email: currentUser.email,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-16 space-y-8">
        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">
              Account overview
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.name || "SmartMeal user"}
            </h1>
            <p className="text-sm text-gray-600">{profile.email}</p>
            {createdAtLabel && (
              <p className="text-xs text-gray-500">
                Member since {createdAtLabel}
              </p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-500">
                Preferences
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Diet:{" "}
                <span className="font-semibold text-gray-900">
                  {profile.preferences?.diet || "normal"}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Budget:{" "}
                <span className="font-semibold text-gray-900">
                  ₦{profile.preferences?.budget?.toLocaleString() ?? 0}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Meals per day:{" "}
                <span className="font-semibold text-gray-900">
                  {profile.preferences?.mealsPerDay || 3}
                </span>
              </p>
              <Link
                to="/preferences"
                className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-emerald-600"
              >
                Update preferences →
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Security
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Your email is protected with Firebase Auth and Firestore rules keep
                data scoped to your user id.
              </p>
              <button
                onClick={handleSignOut}
                className="mt-4 w-full rounded-2xl bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-3xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">What's next</h2>
          <p className="text-gray-600 text-sm">
            Manage your meal history on the dashboard, update your preferences, and
            run the planner to build more smart, cost-aware menus.
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 font-semibold text-sm text-center"
            >
              View dashboard
            </Link>
            <Link
              to="/meal-planner"
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm text-center"
            >
              Build new plan
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
