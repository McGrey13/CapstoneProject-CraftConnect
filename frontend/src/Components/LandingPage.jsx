
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e7d3b2] via-[#c9a97c] to-[#a67c68]">
    {/* Header/Nav */}
  <header className="w-full bg-[#f5e9da] flex flex-col md:flex-row items-center justify-between px-8 py-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-3xl text-orange-600"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#FF6F1F"/><path d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5ZM12 12.5C11.172 12.5 10.5 11.828 10.5 11C10.5 10.172 11.172 9.5 12 9.5C12.828 9.5 13.5 10.172 13.5 11C13.5 11.828 12.828 12.5 12 12.5Z" fill="white"/></svg></span>
        <div>
          <span className="text-3xl font-extrabold text-gray-900">CraftConnect</span>
          <div className="text-xs text-gray-600 -mt-1">Artisan Marketplace</div>
        </div>
      </div>
      <nav className="flex items-center gap-6 mt-4 md:mt-0">
  <Link to="/artisans" className="text-black font-medium hover:text-[#7c5a3a] transition-colors duration-200">Artisans</Link>
  <Link to="/about" className="text-black font-medium hover:text-[#7c5a3a] transition-colors duration-200">About</Link>
  <Link to="/login" className="text-black font-medium hover:text-[#7c5a3a] transition-colors duration-200">Sign In</Link>
  <Link to="/register" className="ml-2 px-4 py-2 bg-[#a67c68] text-black rounded font-semibold transition hover:bg-[#7c5a3a] hover:text-white hover:scale-105 duration-200 shadow">Join as Artisan</Link>
      </nav>
    </header>

    {/* Hero Section (Updated) */}
  <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-br from-[#d6be9e] via-[#e2c3a3] to-[#8c6957] relative overflow-hidden">
    <div className="absolute inset-0 w-full h-full bg-white/70 backdrop-blur-sm z-0"></div>
    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Begin Your Artisan Journey</h1>
      <div className="text-lg md:text-xl text-gray-700 mb-8 font-medium">Be part of our vibrant community of collectors and creators—celebrating the beauty, passion, and authenticity of handcrafted artistry from Laguna and beyond. Connect, share, and enjoy the timeless joy of true craftsmanship</div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-2">
        <Link to="/collections" className="px-8 py-3 bg-[#a47c68] text-black font-semibold rounded-lg shadow border border-[#a47c68] hover:bg-[#8c6957] hover:text-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#a47c68]">
          Start Collecting
        </Link>
        <Link to="/register" className="px-8 py-3 bg-white text-black font-semibold rounded-lg shadow border border-[#a47c68] hover:bg-[#a47c68] hover:text-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#a47c68]">
          Join as Artisan
        </Link>
      </div>
    </div>
  </main>

    {/* Why Choose Section */}
  <section className="w-full bg-[#f5e9da] py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Why Choose <span className="text-orange-600">CraftConnect</span></h2>
        <p className="text-gray-600 mb-12 text-lg">We bridge the gap between exceptional artisans and discerning collectors worldwide</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#fff8f0] rounded-xl shadow p-8 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#e7d3b2]">
            <div className="bg-orange-100 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF6F1F" opacity=".15"/><path d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5ZM12 12.5C11.172 12.5 10.5 11.828 10.5 11C10.5 10.172 11.172 9.5 12 9.5C12.828 9.5 13.5 10.172 13.5 11C13.5 11.828 12.828 12.5 12 12.5Z" fill="#FF6F1F"/></svg></div>
            <h3 className="font-bold text-lg mb-2 text-[#7c5a3a]">Authentic Craftsmanship</h3>
            <p className="text-[#6b4c1b]">Every piece tells a story of traditional techniques passed down through generations of 50+ Laguna artisans.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-[#fff8f0] rounded-xl shadow p-8 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#e7d3b2]">
            <div className="bg-orange-100 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF6F1F" opacity=".15"/><path d="M12 8a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0v-1a3 3 0 0 1 3-3Zm0 8a5 5 0 0 0 5-5v-1a5 5 0 0 0-10 0v1a5 5 0 0 0 5 5Z" fill="#FF6F1F"/></svg></div>
            <h3 className="font-bold text-lg mb-2 text-[#7c5a3a]">Quality Guaranteed</h3>
            <p className="text-[#6b4c1b]">Rigorous quality standards ensure you receive only the finest handcrafted items from our curated collection of 200+ products.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-[#fff8f0] rounded-xl shadow p-8 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#e7d3b2]">
            <div className="bg-orange-100 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF6F1F" opacity=".15"/><path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" fill="#FF6F1F"/></svg></div>
            <h3 className="font-bold text-lg mb-2 text-[#7c5a3a]">Global Artisan Network</h3>
            <p className="text-[#6b4c1b]">Connect with skilled craftspeople from diverse cultures around the world, starting with Laguna's rich heritage across 8 categories.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Footer Section (as in screenshot) */}
  <footer className="bg-[#bfa07a] text-[#4e2e0e] pt-10 pb-4 px-4 mt-0 shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-10">
        <div className="mb-8 md:mb-0 flex-1 min-w-[220px]">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#FF6F1F"/><path d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5ZM12 12.5C11.172 12.5 10.5 11.828 10.5 11C10.5 10.172 11.172 9.5 12 9.5C12.828 9.5 13.5 10.172 13.5 11C13.5 11.828 12.828 12.5 12 12.5Z" fill="white"/></svg></span>
            <span className="text-xl font-bold">CraftConnect</span>
          </div>
          <div className="text-orange-400 font-semibold mb-2">Artisan Marketplace</div>
          <div className="text-sm text-gray-300 mb-4">Connecting master artisans with collectors worldwide, preserving traditional craftsmanship for future generations.</div>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="font-bold mb-2 text-black">Marketplace</div>
          <ul className="text-sm text-black space-y-1">
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Ceramics &amp; Pottery</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Textiles &amp; Weaving</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Jewelry &amp; Metalwork</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Wood &amp; Sculpture</a></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="font-bold mb-2 text-black">Support</div>
          <ul className="text-sm text-black space-y-1">
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Collector Services</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Artisan Resources</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Authentication</a></li>
            <li><a href="#" className="hover:underline hover:text-[#a67c68] transition-colors duration-200">Contact Us</a></li>
          </ul>
        </div>
      </div>
  <div className="text-center text-xs text-black mt-8">© 2025 CraftConnect. Preserving Laguna's artisan heritage.</div>
    </footer>
  </div>
);

export default LandingPage;
