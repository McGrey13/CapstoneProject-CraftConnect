import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';
import { useUser } from '../Context/UserContext';
import { useCart } from '../Cart/CartContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { cartItems } = useCart();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-brand">CraftConnect</Link>

      <div className="navbar-links">
        <Link to="/Categories">Categories</Link>
        <Link to="/Artisan">Artisans</Link>
        <Link to="/About">About</Link>
        <Link to="/Contact">Contact</Link>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search products..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>

      {/* Heart beside Cart */}
      <div className="navbar-cart">
        <Link to="/favorites" className="favorites-link" style={{ marginRight: "12px" }}>
          <FaHeart size={22} color="white" />
        </Link>
        <Link to="/cart" className="cart-link">
          <FaShoppingCart size={24} />
          <span className="cart-count">{cartItemCount}</span>
        </Link>
      </div>

      {/* User Icon + Dropdown */}
      <div className="user-account">
        <FaUser size={20} className="user-icon" onClick={toggleDropdown} />
        {isDropdownOpen && (
          <div className="profile-modal">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p>Hello, {user.userName || user.firstName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.userEmail || user.email}</p>
                </div>
                <div className="border-t border-gray-100"></div>
                <Link 
                  to="/orders" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  My Orders
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-gray-100"></div>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { 
                    navigate("/login"); 
                    setIsDropdownOpen(false); 
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </button>
                <button 
                  onClick={() => { 
                    navigate("/register"); 
                    setIsDropdownOpen(false); 
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <button className="navbar-toggle">
        <svg
          className="mobile-menu-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  );
};

export default Navbar;
