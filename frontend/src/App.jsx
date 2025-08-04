import './App.css';
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
import ProductsPage from './Components/Product/ProductsPage.jsx'; // ✅ Add this
import React from 'react';
import Dashboard from './Components/Admin/Dashboard';

import AdminLayout from './Components/Admin/AdminLayout.jsx';
import AdminDetail from './Components/Admin/AdminDetail';
import AdminNavbar from './Components/Admin/AdminNavbar';
import AdminTable from './Components/Admin/AdminTable';
import ArtisanTable from './Components/Admin/ArtisanTable';
import CustomerDetail from './Components/Admin/CustomerDetail';
import CustomerTable from './Components/Admin/CustomerTable';
import EditableSellerDetail from './Components/Admin/EditableSellerDetail';
import OrdersOverview from './Components/Admin/OrdersOverview';
import ProductsTable from './Components/Admin/ProductsTable';
import SellerDetail from './Components/Admin/SellerDetail';
import SellersTable from './Components/Admin/SellersTable';
import { Sidebar } from 'lucide-react';
import SimplifiedCustomerDetail from './Components/Admin/SimplifiedCustomerDetail';
import SimplifiedCustomerTable from './Components/Admin/SimplifiedCustomerTable';
import MarketingTools from './Components/Seller/MarketingTools';
import OrderInventoryManager from './Components/Seller/OrderInventoryManager';
import PaymentSettings from './Components/Seller/PaymentSettings';
import SellerLayout from './Components/Seller/SellerLayout';
import SellerSettings from './Components/Seller/SellerSettings';
import ShippingSettings from './Components/Seller/ShippingSettings';
import SocialMedia from './Components/Seller/SocialMedia';
import StorefrontCustomizer from './Components/Seller/StorefrontCustomizer';
import WorkshopsEvents from './Components/Seller/WorkshopsEvents';


function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<WorkshopsEvents />} />
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
    </>
  );
}

export default App;
