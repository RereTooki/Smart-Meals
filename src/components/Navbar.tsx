import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-emerald-600">
          SmartMeal
        </Link>

        {/* Links */}
        <div className="hidden md:flex space-x-6 font-medium text-gray-700">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <Link
            to="/about"
            className="hover:text-emerald-600 transition-colors"
          >
            About
          </Link>
          <Link
            to="/meal-planner"
            className="hover:text-emerald-600 transition-colors"
          >
            Meal Planner
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-emerald-600 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* CTA */}
        <Link
          to="/auth"
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
