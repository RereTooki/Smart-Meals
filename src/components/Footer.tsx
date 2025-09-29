const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} SmartMeal. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-emerald-600">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-emerald-600">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
