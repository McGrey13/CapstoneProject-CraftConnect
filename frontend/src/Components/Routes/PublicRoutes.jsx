import React from 'react';
import { Route } from 'react-router-dom';
import PublicLayout from './PublicLayout';

import Home from '../home.jsx';
import ShoppingCart from '../Cart/ShoppingCart';
import SearchResults from '../SearchResult/SearchResults';
import About from '../About/About.jsx';
import Contact from '../Contact/Contact.jsx';
import Categories from '../Categories/Categories.jsx';
import CategoryProducts from '../Categories/CategoryProducts';
import Artisan from '../Artisans/Artisan.jsx';
import ArtisanDetail from '../Artisans/ArtisanDetail';
import Register from '../Auth/Register.jsx';
import Login from '../Auth/Login.jsx';
import ProductsPage from '../Product/ProductsPage.jsx';
import ProductDetails from '../product/ProductDetails';

function PublicRoutes() {
  return (
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<Home />} />
      <Route path="cart" element={<ShoppingCart />} />
      <Route path="search" element={<SearchResults />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="categories" element={<Categories />} />
      <Route path="category/:id" element={<CategoryProducts />} />
      <Route path="artisan" element={<Artisan />} />
      <Route path="artisans/:id" element={<ArtisanDetail />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="products/:id" element={<ProductDetails />} />
    </Route>
  );
}

export default PublicRoutes;
