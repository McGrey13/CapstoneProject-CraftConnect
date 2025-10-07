import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '../Components/Context/UserContext';
import { useCart } from '../Components/Cart/CartContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, loading } = useUser();
  const { cartItems } = useCart();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
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
          <span className="cart-count">{cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}</span>
        </Link>
      </div>

      {/* User Dropdown */}
      <div className="user-account">
        <FaUser size={20} className="user-icon" onClick={toggleDropdown} />
        {isDropdownOpen && (
          <div className="dropdown-content">
            {loading ? (
              <div style={{ padding: '8px 16px' }}>Loading...</div>
            ) : !user ? (
              <>
                <Link to="/login" onClick={() => setIsDropdownOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsDropdownOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Hello, {user.userName || user.firstName || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {user.userEmail || user.email}
                  </div>
                </div>
                <Link to="/orders" onClick={() => setIsDropdownOpen(false)}>My Orders</Link>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>Settings</Link>
                <button
                  onClick={handleLogout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'inherit', 
                    padding: '8px 16px',
                    width: '100%',
                    textAlign: 'left',
                    borderTop: '1px solid #eee'
                  }}
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
