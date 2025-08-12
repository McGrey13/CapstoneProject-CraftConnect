import React from "react";
import HeroSection from "./home/HeroSection";
import CategoryGrid from "./home/CategoryGrid";
import FeaturedProducts from "./product/FeaturedProducts";

const Home = () => {
  // Mock handlers for interactive elements
  const handleAddToCart = (id) => {
    console.log(`Added product ${id} to cart`);
  };

  const handleFavorite = (id) => {
    console.log(`Added product ${id} to favorites`);
  };

  const handleExploreProducts = () => {
    console.log("Explore products clicked");
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-grow bg-white w-full">
        {/* Hero Section - full width */}
        <div className="w-full">
          <HeroSection onCtaClick={handleExploreProducts} />
        </div>

        {/* Category Grid - full width */}
        <div className="w-full">
          <CategoryGrid />
        </div>

        {/* Featured Products - full width */}
        <div className="w-full">
          <FeaturedProducts
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
