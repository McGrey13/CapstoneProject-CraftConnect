import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Layout/NavBar'
import Footer from './Layout/Footer'
import About from './Components/About/About.jsx'
import Categories from './Components/Categories/Categories.jsx'
import Artisans from './Components/Artisans/Artisan.jsx'
import Contact from './Components/Contact/Contact.jsx'
import Login from './Components/Auth/Login.jsx'
import Register from './Components/Auth/Register.jsx'
import React from 'react';

function App() {
  return (
    <>
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/artisans" element={<Artisans />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Add other routes as needed */}
      </Routes>
      </div>
      <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
