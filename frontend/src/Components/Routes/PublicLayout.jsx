import React, { useState } from 'react';
import Navbar from '../Layout/NavBar';
import Footer from '../Layout/Footer';
import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import CustomerMessengerPopup from '../Messenger/CustomerMessengerPopup';
import { useUser } from '../Context/UserContext';
import './PublicLayout.css';

function PublicLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, isAuthenticated } = useUser();

  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main-content">
        <Outlet />  {/* This will render the nested public routes */}
      </main>
      <Footer />

      {/* Floating Message Button - Only show if user is authenticated */}
      {isAuthenticated && !isChatOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsChatOpen(true);
          }}
          className="
            fixed bottom-4 sm:bottom-6 right-4 sm:right-6 
            bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] 
            text-white 
            p-3 sm:p-4 
            rounded-full 
            shadow-xl 
            transition-all duration-300 
            hover:scale-110 
            hover:shadow-2xl 
            focus:outline-none 
            focus:ring-4 
            focus:ring-[#a4785a]/30 
            group 
            border-2 border-white
            z-40
          "
          aria-label="Open messages"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Customer Messenger Popup */}
      {isAuthenticated && (
        <CustomerMessengerPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}

export default PublicLayout;
