import React, { useState } from "react";
import HeroSection from "./Home/HeroSection";
import CategoryGrid from "./Home/CategoryGrid";
import FeaturedProducts from "./product/FeaturedProducts";
import WorkshopsEventsGrid from "./Home/WorkshopsEventsGrid";
import { useCart } from "./Cart/CartContext";
import { useFavorites } from "./favorites/FavoritesContext";
import NotificationModal from "./ui/NotificationModal";

const Home = () => {
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        showNotification('cart', "Item added to cart successfully!");
      } else {
        showNotification('error', result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification('error', "Failed to add item to cart. Please try again.");
    }
  };

  const handleFavorite = (product) => {
    const isFavorited = favorites.some((item) => item.id === product.id);
    
    if (isFavorited) {
      removeFavorite(product.id);
      showNotification('favorite', "Removed from favorites!");
    } else {
      addFavorite(product);
      showNotification('favorite', "Added to favorites!");
    }
  };

  const handleExploreProducts = () => {
    console.log("Explore products clicked");
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-grow bg-white w-full">
        <div className="w-full">
          <HeroSection onCtaClick={handleExploreProducts} autoAdvanceMs={12000} />
        </div>
        <div className="w-full">
          <CategoryGrid />
        </div>
        {/* Featured Products with AI Recommendations */}
        <div className="w-full">
            <FeaturedProducts
            title="Featured Products"
            subtitle="Discover unique handcrafted items from talented artisans around Laguna"
              onAddToCart={handleAddToCart}
              onFavorite={handleFavorite}
          />
        </div>
        {/* Workshops & Events Section */}
        <div className="w-full">
          <WorkshopsEventsGrid />
        </div>
      </main>
      
      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ show: false, type: '', message: '' })}
      />
    </div>
  );
};

export default Home;