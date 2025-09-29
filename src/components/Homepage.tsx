import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero-meal.jpg"; // make sure you add an image
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const Homepage = () => {
  // 🔥 Firebase test setup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "test")); // "test" is your Firestore collection name
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data());
        });
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 pt-32 pb-16 gap-10">
        {/* Left Text */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Plan Smarter,{" "}
            <span className="text-emerald-600">Eat Healthier</span>
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized, budget-friendly meal plans tailored to your
            lifestyle and preferences. Save time, eat better, and stay healthy.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/meal-planner"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow hover:bg-emerald-700 transition-colors"
            >
              Try Meal Planner
            </Link>
            <Link
              to="/about"
              className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={heroImg}
            alt="Healthy Meal"
            className="w-full max-w-md rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="bg-white shadow-md rounded-2xl p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personalized Meals
            </h3>
            <p className="text-gray-600">
              Get meal suggestions based on your diet, preferences, and
              lifestyle.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-2xl p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Budget Friendly
            </h3>
            <p className="text-gray-600">
              Stay healthy without breaking the bank. Plans adapt to your
              budget.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-2xl p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy to Use
            </h3>
            <p className="text-gray-600">
              Simple, user-friendly interface for fast and stress-free meal
              planning.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
