import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    onLogout && onLogout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
          <span className="cart-count">0</span>
        </Link>
      </div>


      {/* User Icon + Dropdown */}
      {/* User Icon + Dropdown */}
<div className="user-account">
  <FaUser size={20} className="user-icon" onClick={toggleDropdown} />
  {isDropdownOpen && (
    <div className="profile-modal">
      {!user ? (
        <>
          <button onClick={() => { navigate("/login"); setIsDropdownOpen(false); }}>
            Login
          </button>
          <button onClick={() => { navigate("/register"); setIsDropdownOpen(false); }}>
            Register
          </button>
        </>
      ) : (
        <>
          <button onClick={() => { navigate("/profile"); setIsDropdownOpen(false); }}>
            Profile
          </button>
          <button onClick={() => { navigate("/settings"); setIsDropdownOpen(false); }}>
            Settings
          </button>
          <button onClick={handleLogout}>Logout</button>
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
