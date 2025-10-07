import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import axios from "axios";
import "./CategoryGrid.css"; // Add this import

const categoryFilters = [
  { id: "all", name: "All", queryParam: "" },
  { id: "miniatures", name: "Miniatures & Souvenirs", queryParam: "Miniatures & Souvenirs" },
  { id: "rubber-stamp", name: "Rubber Stamp Engraving", queryParam: "Rubber Stamp Engraving" },
  { id: "traditional", name: "Traditional Accessories", queryParam: "Traditional Accessories" },
  { id: "statuary", name: "Statuary & Sculpture", queryParam: "Statuary & Sculpture" },
  { id: "basketry", name: "Basketry & Weaving", queryParam: "Basketry & Weaving" },
  { id: "featured", name: "Featured", queryParam: "featured" }
];

const CategoryGrid = () => {
  const [stores, setStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, [selectedCategory]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const selectedCategoryData = categoryFilters.find(cat => cat.id === selectedCategory);
      let endpoint = selectedCategory === 'featured' 
        ? '/api/products/featured'
        : `/api/stores${selectedCategoryData?.queryParam ? `?category=${encodeURIComponent(selectedCategoryData.queryParam)}` : ''}`;
      
      const response = await axios.get(endpoint);
      // Ensure we're getting an array from the response
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      // Transform the data based on whether it's products or stores
      const transformedData = selectedCategory === 'featured'
        ? data.map(item => ({
            storeID: item.seller?.sellerID,
            store_name: item.productName,
            store_description: item.productDescription,
            category: item.category,
            logo_path: item.productImage
          }))
        : data;
      
      setStores(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setStores([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fefefe] py-8">
      {/* Category Filter Bar */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 pb-4 w-full">
            {categoryFilters.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`py-2 font-medium text-sm transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'text-[#9F2936] font-semibold'
                    : 'text-black hover:text-[#9F2936] hover:font-semibold'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Local Craft Stores</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Discover talented artisans and their unique craft stores
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F2936]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
            {stores.map((store) => (
              <Link
                to={`/store/${store.storeID}`}
                key={store.storeID}
                className="block transition-transform hover:scale-105 w-full max-w-sm"
              >
                <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg">
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    {store.logo_path ? (
                      <img
                        src={store.logo_path}
                        alt={store.store_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 italic">
                        No image available
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-xl">{store.store_name}</h3>
                        <p className="text-sm text-white/80">{store.category}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-600 text-sm">{store.store_description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;