import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Layout/NavBar';
import Footer from './Components/Layout/Footer';
import About from './Components/About/About.jsx';
import Categories from './Components/Categories/Categories.jsx';
import Artisan from './Components/Artisans/Artisan.jsx';
import Contact from './Components/Contact/Contact.jsx';
import Login from './Components/Auth/Login.jsx';
import Register from './Components/Auth/Register.jsx';
import Home from './Components/home.jsx';
import ProductsPage from './Components/Product/ProductsPage.jsx';

import SellerLayout from './Components/Seller/SellerLayout.jsx';
import WorkshopsEvents from './Components/Seller/WorkshopsEvents.jsx';
import StorefrontCustomizer from './Components/Seller/StorefrontCustomizer.jsx';
import PaymentSettings from './Components/Seller/PaymentSettings.jsx';
import OrderInventoryManager from './Components/Seller/OrderInventoryManager.jsx';
import MarketingTools from './Components/Seller/MarketingTools.jsx';
import ShippingSettings from './Components/Seller/ShippingSettings.jsx';
import SocialMedia from './Components/Seller/SocialMedia.jsx';
import SellerSettings from './Components/Seller/SellerSettings.jsx';
import Dashboard from './Components/Admin/Dashboard';
import AdminLayout from './Components/Admin/AdminLayout';
import ShoppingCart from './Components/Cart/ShoppingCart';
import SearchResults from './Components/SearchResult/SearchResults';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/artisan" element={<Artisan />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
