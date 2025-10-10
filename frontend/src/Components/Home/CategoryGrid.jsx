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
        ? 'http://localhost:8000/api/products/featured'
        : `http://localhost:8000/api/stores${selectedCategoryData?.queryParam ? `?category=${encodeURIComponent(selectedCategoryData.queryParam)}` : ''}`;
      
      console.log('Fetching from endpoint:', endpoint);
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
        : data.map(item => {
          // Ensure we have the correct seller_id for routing
          console.log('Store item:', item);
          console.log('Store name:', item.store_name);
          console.log('Store ID:', item.storeID);
          console.log('Seller ID:', item.seller_id);
          console.log('Logo URL:', item.logo_url);
          console.log('Logo Path:', item.logo_path);
          console.log('Followers count:', item.followers_count);
          console.log('Location:', item.location);
          
          // Determine the correct logo URL
          let logoUrl = null;
          if (item.logo_url) {
            logoUrl = item.logo_url;
          } else if (item.logo_path) {
            // If logo_path exists but not logo_url, construct the full URL
            logoUrl = item.logo_path.startsWith('http') 
              ? item.logo_path 
              : `http://localhost:8000/storage/${item.logo_path}`;
          }
          
          console.log('Final logo URL:', logoUrl);
          
          return {
            ...item,
            // Use seller_id if available, otherwise use seller from relationship
            seller_id: item.seller_id || item.seller?.sellerID || item.storeID,
            storeID: item.storeID,
            store_name: item.store_name,
            store_description: item.store_description,
            category: item.category,
            logo_path: logoUrl,
            followers_count: item.followers_count || 0,
            location: item.location || '',
            years_active: item.years_active || 0
          };
        });
      
      setStores(transformedData);
      console.log('Final stores data:', transformedData);
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
            {stores.map((store) => {
              const routeId = store.seller_id || store.storeID;
              console.log(`Clicking store: ${store.store_name}, routeId: ${routeId}`);
              return (
                <Link
                  to={`/store/${routeId}`}
                  key={store.storeID}
                  className="block transition-transform hover:scale-105 w-full max-w-sm"
                >
                  <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {store.logo_path ? (
                        <img
                          src={store.logo_path}
                          alt={store.store_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <p className="text-sm">No image available</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-4 text-white w-full">
                          <h3 className="font-bold text-xl mb-1">{store.store_name}</h3>
                          <p className="text-sm text-white/90 mb-2">{store.category}</p>
                          {store.location && (
                            <p className="text-xs text-white/80 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {store.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{store.store_description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{store.followers_count} followers</span>
                        </div>
                        <div className="flex items-center text-[#9F2936] font-medium">
                          <span>View Store</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;