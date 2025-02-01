import { Crosshair, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-black bg-opacity-80 py-4 px-8 flex justify-between items-center">
      <Link
        to="/team"
        className="flex items-center space-x-2 hover:text-accent-color transition-colors"
      >
        <Users size={24} />
        <span>Our Team</span>
      </Link>
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-bold">Spyder</span>
        <img src="/images/spyder.png" alt="Spider Icon" className="w-12 h-12" />
      </Link>
      <Link
        to="/mission"
        className="flex items-center space-x-2 hover:text-accent-color transition-colors"
      >
        <Crosshair size={24} />
        <span>Our Mission</span>
      </Link>
    </header>
  );
};

export default Navbar;
