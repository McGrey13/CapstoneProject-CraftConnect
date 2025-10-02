import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProductCard from "./ProductCard";
import axios from "axios";

const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover unique handcrafted items from talented artisans around Laguna",
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/featured');
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      // Transform the API data to match our component's structure
      const transformedProducts = data.map(product => ({
        id: product.id,
        image: product.productImage || '/placeholder-image.jpg',
        title: product.productName,
        price: parseFloat(product.productPrice),
        artisanName: product.seller?.user?.userName || 'Unknown Artisan',
        artisanId: product.seller?.sellerID,
        rating: 4.5, // You might want to fetch actual ratings from the API
        isNew: false, // You might want to calculate this based on created_at
        isFeatured: true,
        category: product.category
      }));

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Miniatures & Souvenirs", "Rubber Stamp Engraving", "Traditional Accessories", "Statuary & Sculpture", "Basketry & Weaving"];
  const itemsPerPage = 4;

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.category.toLowerCase() === activeTab.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return a.isNew ? -1 : 1;
      default:
        return a.isFeatured ? -1 : 1;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F2936]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto mb-4 md:mb-0"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto gap-4">
            {categories.map((category) => (
              <TabsTrigger
                key={category.toLowerCase()}
                value={category.toLowerCase()}
                className="px-4 py-2 transition-all duration-200 text-black data-[state=active]:text-[#9F2936] data-[state=active]:font-semibold hover:text-[#9F2936] hover:font-semibold"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-gray-300 hover:border-[#9F2936] focus:ring-[#9F2936]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured" className="hover:text-[#9F2936]">Featured</SelectItem>
              <SelectItem value="price-low" className="hover:text-[#9F2936]">Price: Low to High</SelectItem>
              <SelectItem value="price-high" className="hover:text-[#9F2936]">Price: High to Low</SelectItem>
              <SelectItem value="rating" className="hover:text-[#9F2936]">Highest Rated</SelectItem>
              <SelectItem value="newest" className="hover:text-[#9F2936]">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
              onFavorite={onFavorite}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="border-gray-300 text-black hover:border-[#9F2936] hover:text-[#9F2936] hover:font-semibold transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-gray-600">
            Page {currentPage + 1} of {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage === pageCount - 1}
            className="border-gray-300 text-black hover:border-[#9F2936] hover:text-[#9F2936] hover:font-semibold transition-all duration-200"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;