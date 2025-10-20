import React, { useEffect, useState } from "react";
import HeroSection from "./home/HeroSection";
import CategoryGrid from "./home/CategoryGrid";
import FeaturedProducts from "./product/FeaturedProducts";
import api from "../api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/products/approved");
        const data = response.data;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
        <div className="w-full">
          <HeroSection onCtaClick={handleExploreProducts} />
        </div>
        <div className="w-full">
          <CategoryGrid />
        </div>
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading products...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <FeaturedProducts
              products={products}
              onAddToCart={handleAddToCart}
              onFavorite={handleFavorite}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;