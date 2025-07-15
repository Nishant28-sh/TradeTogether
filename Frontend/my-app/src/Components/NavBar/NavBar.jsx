import React, { useState, useEffect } from "react";
import { FaSearch, FaCommentDots, FaUser, FaBars, FaTimes, FaCog, FaExchangeAlt, FaBell } from "react-icons/fa";
import logo from "../Assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api";
import { useUser } from "../../UserContext";

const Navbar = () => {
  const { user, setUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dummyNotifications = [
    { id: 1, type: 'message', content: 'You have a new message from Rahul.', time: '2 min ago' },
    { id: 2, type: 'trade', content: 'Nishant sent you a trade request.', time: '10 min ago' },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`).then(res => {
      setProducts(res.data);
    });
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (id) => {
    setShowSuggestions(false);
    setSearch("");
    navigate(`/products/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      const matchingProducts = products.filter(p => 
        p.title && p.title.toLowerCase().includes(search.trim().toLowerCase())
      );
      if (matchingProducts.length > 0) {
        navigate(`/products/${matchingProducts[0]._id}`);
      } else {
        navigate(`/creative-treasures?search=${encodeURIComponent(search.trim())}`);
      }
      setSearch("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    setMenuOpen(false);
  };

  const filteredSuggestions = search.trim()
    ? products.filter(p => p.title && p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : [];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-orange-50/90 shadow-md sticky top-0 z-50 backdrop-blur-md">
      {/* Left: Logo */}
      <div className="flex items-center">
        <img src={logo} alt="TradeTogether Logo" className="w-12 h-12 object-contain mr-2" />
        <div className="flex flex-col items-start">
          <h1 className="m-0 text-lg font-bold text-orange-900">TradeTogether</h1>
          <p className="m-0 text-xs text-gray-500">Maker Community</p>
        </div>
      </div>

      {/* Center: Search and Chat */}
      <div className="hidden md:flex items-center relative flex-1 justify-center">
        <form className="flex items-center bg-white rounded-full shadow px-3 py-1 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-300 w-72 relative" onSubmit={handleSearchSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Search products, communities, stories..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="bg-transparent outline-none px-2 py-1 text-gray-700 w-40 md:w-56"
          />
          <button type="submit" className="text-gray-500 hover:text-orange-500 focus:outline-none">
            <FaSearch />
          </button>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto mt-2">
              {filteredSuggestions.map(p => (
                <div
                  key={p._id}
                  className="px-4 py-2 cursor-pointer hover:bg-orange-100 text-gray-800"
                  onMouseDown={() => handleSuggestionClick(p._id)}
                >
                  {p.title}
                </div>
              ))}
            </div>
          )}
        </form>
        <Link to="/chat" title="Chat">
          <FaCommentDots className="ml-4 cursor-pointer text-gray-700 text-lg hover:text-orange-500 transition" />
        </Link>
      </div>

      {/* Right: Main Menu Button */}
      <div className="flex items-center">
        <button
          className="flex items-center bg-gradient-to-r from-orange-400 to-pink-400 text-white border-none px-4 py-2 rounded-full cursor-pointer text-sm font-medium shadow hover:scale-105 hover:shadow-lg transition"
          onClick={toggleMenu}
        >
          <FaUser className="mr-2" />
          Menu
        </button>
        {/* Dropdown/Side Menu */}
        {menuOpen && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}></div>
            {/* Side Menu */}
            <div className="fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50 flex flex-col p-6 animate-slide-in border-l-4 border-orange-400" style={{ boxShadow: '0 8px 32px 0 rgba(255, 140, 0, 0.15)' }}>
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-extrabold text-orange-700 tracking-wide">Main Menu</span>
                <FaTimes className="text-2xl cursor-pointer text-gray-600 hover:text-orange-500" onClick={toggleMenu} />
              </div>
              <nav className="flex flex-col gap-4">
                <Link to="/" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Home</Link>
                <Link to="/creative-treasures" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Creative Treasures</Link>
                
                <Link to="/products" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Add Product</Link>
                <Link to="/trades" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition flex items-center gap-2" onClick={toggleMenu}>
                  <FaExchangeAlt /> My Trades
                </Link>
                <Link to="/profile" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Profile</Link>
                {/* <Link to="/communities" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Communities</Link> */}
                <Link to="/challenges" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Challenges</Link>
                <Link to="/wishlist" className="py-2 px-3 text-lg font-bold rounded text-orange-500 hover:bg-orange-100 hover:text-orange-700 transition" onClick={toggleMenu}>Wishlist</Link>
                {(user?.isAdmin || user?.role === 'admin') && (
                  <Link to="/admin" className="py-2 px-3 text-lg font-bold rounded text-red-600 hover:bg-red-100 hover:text-red-700 transition flex items-center" onClick={toggleMenu}>
                    <FaCog className="mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 text-lg font-bold rounded text-white bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 transition mt-4 shadow"
                >
                  Logout
                </button>
              </nav>
              <div className="mt-auto text-xs text-gray-400 pt-8">&copy; {new Date().getFullYear()} TradeTogether</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
