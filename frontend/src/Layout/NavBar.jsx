import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    onLogout && onLogout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">CraftConnect</Link>

      {/* Desktop & Mobile Links */}
      <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
        <Link to="/artisan" onClick={() => setIsMobileMenuOpen(false)}>Artisans</Link>
        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
      </div>

      {/* Search */}
      <div className="navbar-search">
        <input type="text" placeholder="Search products..." className="search-input" />
        <button className="search-button">Search</button>
      </div>

      {/* Cart */}
      <div className="navbar-cart">
        <Link to="/cart" className="cart-link">
          <FaShoppingCart size={24} />
          <span className="cart-count">{cartCount}</span>
        </Link>
      </div>

      {/* User Dropdown */}
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
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button className="navbar-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;
