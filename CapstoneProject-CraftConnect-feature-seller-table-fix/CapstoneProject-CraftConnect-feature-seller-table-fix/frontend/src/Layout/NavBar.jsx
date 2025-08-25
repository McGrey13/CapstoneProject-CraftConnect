import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    onLogout && onLogout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">CraftConnect</Link>

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
        />
        <button className="search-button">Search</button>
      </div>

      <div className="navbar-cart">
        <Link to="/cart" className="cart-link">
          <FaShoppingCart size={24} />
          <span className="cart-count">0</span>
        </Link>
      </div>

      {/* User Icon + Dropdown */}
      <div className="user-account">
        <FaUser size={20} className="user-icon" onClick={toggleDropdown} />
        {isDropdownOpen && (
          <div className="dropdown-content">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setIsDropdownOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsDropdownOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>Settings</Link>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>Logout</button>
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
