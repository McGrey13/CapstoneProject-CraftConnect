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
import EditableSellerDetail from './Components/Seller/EditableSellerDetail';


import Dashboard from './Components/Admin/AdminDashboard';
import AdminLayout from './Components/Admin/AdminLayout';
import AdminDetails from './Components/Admin/AdminDetail';
import AdminNavbar from './Components/Admin/AdminNavbar';
import AdminTable from './Components/Admin/AdminTable';
import ArtisanTable from './Components/Admin/ArtisanTable';
import CustomerDetail from './Components/Admin/CustomerDetail';
import CustomerTable from './Components/Admin/CustomerTable';
import EditableaAdminDetail from './Components/Admin/EditableAdminDetail';
import OrdersOverview from './Components/Admin/OrdersOverview';
import ProductsTable from './Components/Admin/ProductsTable';
import SellerDetail from './Components/Admin/SellerDetail';
import SellersTable from './Components/Admin/SellersTable';
import AdminProfilePage from './Components/Admin/AdminSettings';
import { Sidebar } from 'lucide-react';
import SimplifiedCustomerDetail from './Components/Admin/SimplifiedCustomerDetail';
import SimplifiedCustomerTable from './Components/Admin/SimplifiedCustomerTable';
import ProfilePage from './Components/Seller/ProfilePage';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} /> 
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/artisan" element={<Artisan />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductsPage />} />
          {/* Seller routes */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route path="/seller/marketing-tools" element={<MarketingTools />} />
            <Route path="/seller/order-inventory-manager" element={<OrderInventoryManager />} />
            <Route path="/seller/payment-settings" element={<PaymentSettings />} />
            <Route path="/seller/seller-settings" element={<SellerSettings />} />
            <Route path="/seller/shipping-settings" element={<ShippingSettings />} />
            <Route path="/seller/social-media" element={<SocialMedia />} />
            <Route path="/seller/storefront-customizer" element={<StorefrontCustomizer />} />
            <Route path="/seller/workshops-events" element={<WorkshopsEvents />} />
            <Route path="/seller/profile" elements={<ProfilePage />} />
            <Route path="/seller/EditableSellerDetail" elements={<EditableSellerDetail />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/navbar" element={<AdminNavbar />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/detail" element={<AdminDetails />} />
            <Route path="/admin/table" element={<AdminTable />} />
            <Route path="/admin/profile" elements={<AdminProfilePage />} />
            <Route path="/admin/artisan-table" element={<ArtisanTable />} />
            <Route path="/admin/customer-detail" element={<CustomerDetail />} />
            <Route path="/admin/customer-table" element={<CustomerTable />} />
            <Route path="/admin/editable-seller-detail" element={<EditableaAdminDetail />} />
            <Route path="/admin/orders-overview" element={<OrdersOverview />} />
            <Route path="/admin/products-table" element={<ProductsTable />} />
            <Route path="/admin/seller-detail" element={<SellerDetail />} />
            <Route path="/admin/sellers-table" element={<SellersTable />} />
            <Route path="/admin/simplified-customer-detail" element={<SimplifiedCustomerDetail />} />
            <Route path="/admin/simplified-customer-table" element={<SimplifiedCustomerTable />} />
            
          </Route>
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;


