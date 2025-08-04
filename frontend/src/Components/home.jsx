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
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <HeroSection onCtaClick={handleExploreProducts} />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Featured Products */}
        <FeaturedProducts
          onAddToCart={handleAddToCart}
          onFavorite={handleFavorite}
        />
      </main>
    </div>
  );
};

export default Home;
