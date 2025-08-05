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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SellerLayout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/artisan" element={<Artisan />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductsPage />} />

          {/* Seller routes with layout */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<Dashboard/>} /> 
            <Route path="workshops" element={<WorkshopsEvents />} />
            <Route path="storefront" element={<StorefrontCustomizer />} />
            <Route path="payments" element={<PaymentSettings />} />
            <Route path="orders-inventory" element={<OrderInventoryManager />} />
            <Route path="marketing" element={<MarketingTools />} />
            <Route path="shipping" element={<ShippingSettings />} />
            <Route path="social" element={<SocialMedia />} />
            <Route path="settings" element={<SellerSettings />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
