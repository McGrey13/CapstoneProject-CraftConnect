import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Filter, Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import api from "../../api";

// Wrapper component to track product views on hover
const ProductCardWrapper = ({ productId, productTags = [], searchQuery = '', children }) => {
  const [viewStartTime, setViewStartTime] = React.useState(null);

  const handleMouseEnter = () => {
    setViewStartTime(Date.now());
  };

  const handleMouseLeave = () => {
    if (viewStartTime) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      // Track view if user spent significant time (more than 1 second)
      if (duration > 1 && productId) {
        // Track product view with tags and search query for AI recommendations
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        if (token) {
          api.post(`/products/${productId}/track-view`, { 
            duration,
            tags: productTags || [],
            search_query: searchQuery || null
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(() => {
            console.log('✅ Product view tracked:', productId, { duration, tags: productTags, searchQuery });
          }).catch((err) => {
            console.error('❌ Failed to track product view:', err);
          });
        }
      }
      setViewStartTime(null);
    }
  };
  
  // Also track on click (but don't prevent navigation)
  const handleClick = () => {
    // Don't stop propagation - let the product card handle navigation
    if (productId) {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        // Track immediately on click
        api.post(`/products/${productId}/track-view`, { 
          duration: 0,
          tags: productTags || [],
          search_query: searchQuery || null
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          console.log('✅ Product click tracked:', productId, { tags: productTags, searchQuery });
        }).catch((err) => {
          console.error('❌ Failed to track product click:', err);
        });
      }
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div onClick={handleClick}>
        {children}
      </div>
    </div>
  );
};

// --- ProductsPage Component ---
const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [followedProductIds, setFollowedProductIds] = useState(new Set());

  // Helper function to convert image URLs to relative paths
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost, convert to relative path
    if (url.includes('localhost:8000') || url.includes('localhost:8080')) {
      const path = new URL(url).pathname;
      return path;
    }
    // If it's already a relative path, return as is
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    return url;
  };

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
      try {
        console.log('🚀🚀🚀 ProductsPage - fetchProducts called');
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        console.log('🔑 ProductsPage - Token check:', { hasToken: !!token, tokenLength: token?.length });
        
        // Check if user is logged in as a customer
        let isCustomer = false;
        if (token) {
          try {
            const userDataStr = localStorage.getItem('user_data');
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              const userRole = userData.role || userData.userRole || userData.user_type || userData.userType;
              isCustomer = userRole === 'customer' || userRole === 'Customer';
              
              console.log('🔍 ProductsPage - User check:', {
                hasToken: !!token,
                hasUserData: !!userDataStr,
                userRole: userRole,
                isCustomer: isCustomer,
                userDataKeys: Object.keys(userData || {})
              });
            } else {
              console.log('⚠️ ProductsPage - No user_data in localStorage');
            }
          } catch (e) {
            console.error('❌ ProductsPage - Error parsing user data:', e);
          }
        } else {
          console.log('ℹ️ ProductsPage - No token found, skipping recommendations');
        }
        
        // Get AI-powered recommendations first (only for logged-in customers)
        let recommendedProductIds = [];
        let recommendedProductsMap = new Map();
        
        console.log('🚀 ProductsPage - Starting recommendation fetch:', { isCustomer, hasToken: !!token });
        
        if (isCustomer && token) {
          console.log('✅ ProductsPage - Fetching AI recommendations...');
          try {
            const recResponse = await api.get("/recommendations", {
              params: { limit: 200 },
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            console.log('📥 ProductsPage - Recommendation API Response:', {
              hasData: !!recResponse.data,
              success: recResponse.data?.success,
              hasRecommendations: !!recResponse.data?.recommendations,
              recommendationsLength: recResponse.data?.recommendations?.length || 0,
              fullResponse: recResponse.data
            });
            
            if (recResponse.data.success && recResponse.data.recommendations && recResponse.data.recommendations.length > 0) {
              // Store full recommendation data with scores for better sorting
              recResponse.data.recommendations.forEach((rec) => {
                const productId = rec.id || rec.product_id;
                if (productId) {
                  // Store both string and number versions for matching
                  const productIdStr = String(productId);
                  const productIdNum = Number(productId);
                  
                  // Add both formats to array
                  recommendedProductIds.push(productIdStr);
                  recommendedProductIds.push(productIdNum);
                  
                  // Store in map with both keys
                  recommendedProductsMap.set(productIdStr, {
                    ...rec,
                    isRecommended: true,
                    recommendationScore: rec.score || 0
                  });
                  recommendedProductsMap.set(productIdNum, {
                    ...rec,
                    isRecommended: true,
                    recommendationScore: rec.score || 0
                  });
                }
              });
              
              console.log('✅✅✅ AI Recommendations loaded:', recResponse.data.recommendations.length, 'products');
              console.log('📋 Recommendation IDs (first 10):', recommendedProductIds.slice(0, 10));
              console.log('📋 Full recommendation data:', recResponse.data.recommendations.slice(0, 3));
              console.log('📋 Recommendation Map size:', recommendedProductsMap.size);
            } else {
              console.log('⚠️ No recommendations available (user may not have enough browsing history)');
            }
          } catch (err) {
            console.error('❌❌❌ Error fetching recommendations:', err);
            console.log('⚠️ No recommendations available:', err.response?.data?.message || err.message);
            console.log('Using default product sorting');
          }
        } else {
          console.log('ℹ️ User not logged in as customer - skipping AI recommendations', { isCustomer, hasToken: !!token });
        }
        
        console.log('📊 ProductsPage - Recommendation summary:', {
          recommendedCount: recommendedProductIds.length,
          mapSize: recommendedProductsMap.size,
          firstFewIds: recommendedProductIds.slice(0, 5)
        });
        
        // Fetch followed sellers' products first (if authenticated)
        let followedProducts = [];
        if (token) {
          try {
            const followedResponse = await api.get("/products/followed-sellers", {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            followedProducts = Array.isArray(followedResponse.data) ? followedResponse.data : (followedResponse.data.data || []);
          } catch (_err) {
            // No followed sellers products
          }
        }
        
        // Fetch all approved products
        const response = await api.get("/products/approved", {
          headers: {
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
        });

        const data = response.data;
        
        // Handle both array and object responses
        const allProducts = Array.isArray(data) ? data : (data.data || []);
        
        // Create a Set of followed product IDs for quick lookup
        const followedIds = new Set(followedProducts.map(p => String(p.id || p.product_id)));
        setFollowedProductIds(new Set(followedProducts.map(p => p.id || p.product_id)));
        
        // Merge recommended products data with all products
        const allProductsWithRecommendations = allProducts.map(product => {
          const productId = product.id || product.product_id;
          const productIdStr = String(productId);
          const productIdNum = Number(productId);
          
          // Try multiple key formats to find recommendation data
          const recommendedData = recommendedProductsMap.get(productIdStr) || 
                                  recommendedProductsMap.get(productIdNum) ||
                                  recommendedProductsMap.get(String(productId)) ||
                                  recommendedProductsMap.get(Number(productId)) ||
                                  recommendedProductsMap.get(productId);
          
          if (recommendedData) {
            // Merge recommended product data (may have better fields)
            return {
              ...product,
              ...recommendedData,
              // Keep original product fields as fallback
              average_rating: recommendedData.average_rating || product.average_rating || 0,
              reviews_count: recommendedData.reviews_count || product.reviews_count || 0,
              isRecommended: true, // Explicitly mark as recommended
            };
          }
          return product;
        });
        
        // Helper function to check if product is recommended
        const isProductRecommended = (p) => {
          const pid = p.id || p.product_id;
          const pidStr = String(pid);
          const pidNum = Number(pid);
          
          return recommendedProductIds.includes(pidStr) || 
                 recommendedProductIds.includes(pidNum) ||
                 recommendedProductIds.includes(String(pid)) ||
                 recommendedProductIds.includes(Number(pid)) ||
                 recommendedProductsMap.has(pidStr) ||
                 recommendedProductsMap.has(pidNum) ||
                 p.isRecommended === true;
        };
        
        // Helper function to check if product is followed
        const isProductFollowed = (p) => {
          const pid = String(p.id || p.product_id);
          return followedIds.has(pid) || followedIds.has(String(p.id)) || followedIds.has(String(p.product_id));
        };
        
        // Separate products into: Recommended + Followed, Recommended, Followed, Others
        const recommendedAndFollowed = allProductsWithRecommendations.filter(p => 
          isProductRecommended(p) && isProductFollowed(p)
        );
        
        const recommendedOnly = allProductsWithRecommendations.filter(p => 
          isProductRecommended(p) && !isProductFollowed(p)
        );
        
        const followedOnly = followedProducts.filter(p => 
          !isProductRecommended(p)
        );
        
        const otherProducts = allProductsWithRecommendations.filter(p => 
          !isProductRecommended(p) && !isProductFollowed(p)
        );
        
        // Sort each group by recommendation score (if available), then rating and sold count
        // Prioritize recommended products with high ratings
        const sortProducts = (products) => {
          return [...products].sort((a, b) => {
            const aIsRecommended = a.recommendationScore !== undefined;
            const bIsRecommended = b.recommendationScore !== undefined;
            const ratingA = a.average_rating || 0;
            const ratingB = b.average_rating || 0;
            const reviewCountA = a.reviews_count || 0;
            const reviewCountB = b.reviews_count || 0;
            
            // First priority: Recommended products with high ratings (4+ stars)
            const aIsHighRatedRecommended = aIsRecommended && ratingA >= 4.0;
            const bIsHighRatedRecommended = bIsRecommended && ratingB >= 4.0;
            
            if (aIsHighRatedRecommended && !bIsHighRatedRecommended) return -1;
            if (!aIsHighRatedRecommended && bIsHighRatedRecommended) return 1;
            
            // If both are high-rated recommended, sort by recommendation score first, then rating
            if (aIsHighRatedRecommended && bIsHighRatedRecommended) {
              if (a.recommendationScore !== undefined && b.recommendationScore !== undefined) {
                const scoreDiff = b.recommendationScore - a.recommendationScore;
                if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
              }
              // Then by rating
              if (ratingB !== ratingA) return ratingB - ratingA;
              // Then by review count
              return reviewCountB - reviewCountA;
            }
            
            // Second priority: Other recommended products
            if (aIsRecommended && !bIsRecommended) return -1;
            if (!aIsRecommended && bIsRecommended) return 1;
            
            // If both recommended, sort by recommendation score, then rating
            if (aIsRecommended && bIsRecommended) {
              if (a.recommendationScore !== undefined && b.recommendationScore !== undefined) {
                const scoreDiff = b.recommendationScore - a.recommendationScore;
                if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
              }
              // Then by rating
              if (ratingB !== ratingA) return ratingB - ratingA;
            }
            
            // Third priority: Rating (for non-recommended products)
            if (ratingB !== ratingA) {
              return ratingB - ratingA;
            }
            
            // Fourth priority: Review count
            if (reviewCountB !== reviewCountA) {
              return reviewCountB - reviewCountA;
            }
            
            // Fifth priority: Sold count
            const soldA = a.sold_count || 0;
            const soldB = b.sold_count || 0;
            return soldB - soldA;
          });
        };
        
        // Combine in priority order: Recommended+Followed > Recommended > Followed > Others
        const sortedProducts = [
          ...sortProducts(recommendedAndFollowed),
          ...sortProducts(recommendedOnly),
          ...sortProducts(followedOnly),
          ...sortProducts(otherProducts)
        ];
        
        console.log('📊 Product sorting:', {
          recommendedAndFollowed: recommendedAndFollowed.length,
          recommendedOnly: recommendedOnly.length,
          followedOnly: followedOnly.length,
          otherProducts: otherProducts.length,
          total: sortedProducts.length
        });
        
        // Add sample ratings and sold counts for products that don't have data yet (for testing)
        const productsWithSampleData = sortedProducts.map((product, index) => {
          const sampleRatings = [4.2, 3.8, 4.5, 4.0, 3.9, 4.3, 4.1, 3.7, 4.4, 3.6];
          const sampleReviewCounts = [12, 8, 15, 6, 9, 11, 7, 5, 13, 4];
          const sampleSoldCounts = [25, 18, 32, 12, 21, 28, 15, 9, 35, 7];
          
          const dataIndex = index % sampleRatings.length;
          
          // Check if product is recommended - try multiple ID formats
          const productId = product.id || product.product_id;
          const productIdStr = String(productId);
          const productIdNum = Number(productId);
          
          // Check if this product is in the recommendations - use the isRecommended flag from merged data first
          let isRecommended = product.isRecommended === true || product.isRecommended === 'true';
          
          // If not already marked, check against recommendation IDs
          if (!isRecommended) {
            isRecommended = recommendedProductIds.includes(productIdStr) || 
                            recommendedProductIds.includes(productIdNum) ||
                            recommendedProductIds.includes(String(productId)) ||
                            recommendedProductIds.includes(Number(productId)) ||
                            recommendedProductsMap.has(productIdStr) ||
                            recommendedProductsMap.has(productIdNum);
          }
          
          // Debug logging for first few products and all recommended ones
          if (index < 5 || isRecommended) {
            console.log(`🔍 Product ${index + 1} check:`, {
              productId: productId,
              productIdStr: productIdStr,
              productIdNum: productIdNum,
              isRecommended: isRecommended,
              productIsRecommended: product.isRecommended,
              inRecommendedIds: recommendedProductIds.includes(productIdStr) || recommendedProductIds.includes(productIdNum),
              inMap: recommendedProductsMap.has(productIdStr) || recommendedProductsMap.has(productIdNum),
              productName: product.productName
            });
          }
          
          return {
            ...product,
            // Add sample ratings if no rating data exists
            average_rating: product.average_rating || sampleRatings[dataIndex],
            reviews_count: product.reviews_count || sampleReviewCounts[dataIndex],
            // Add sample sold counts if no sold data exists
            sold_count: product.sold_count || sampleSoldCounts[dataIndex],
            // Mark if recommended by AI - explicitly set to boolean true
            isRecommended: isRecommended === true || isRecommended === 'true' || isRecommended === 1
          };
        });
        
        const recommendedCount = productsWithSampleData.filter(p => p.isRecommended).length;
        console.log('📊📊📊 ProductsPage Final product data:', {
          totalProducts: productsWithSampleData.length,
          recommendedProducts: recommendedCount,
          recommendationIds: recommendedProductIds.slice(0, 10),
          sampleRecommended: productsWithSampleData.filter(p => p.isRecommended).slice(0, 5).map(p => ({
            id: p.id || p.product_id,
            name: p.productName,
            isRecommended: p.isRecommended
          }))
        });
        
        if (recommendedCount === 0 && recommendedProductIds.length > 0) {
          console.warn('⚠️⚠️⚠️ WARNING: Recommendations fetched but no products matched!', {
            recommendationIds: recommendedProductIds.slice(0, 10),
            sampleProductIds: productsWithSampleData.slice(0, 10).map(p => ({
              id: p.id || p.product_id,
              idStr: String(p.id || p.product_id),
              idNum: Number(p.id || p.product_id),
              name: p.productName
            }))
          });
        }
        
        if (recommendedCount > 0) {
          console.log('🎉🎉🎉 SUCCESS: Found', recommendedCount, 'recommended products!');
        }
        
        setProducts(productsWithSampleData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    console.log('🚀🚀🚀 ProductsPage useEffect - Starting fetchProducts');
    fetchProducts();
  }, [fetchProducts]);

  // Refetch products when user changes (login/logout) to update recommendations
  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      // If user logged in/out, refetch products to update recommendations
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'customer') {
            console.log('🔄 User changed - refetching products for personalized recommendations');
            fetchProducts();
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };

    // Listen for storage changes (login/logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically if user logged in (for same-tab login)
    const interval = setInterval(() => {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token && products.length === 0) {
        handleStorageChange();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [products.length, fetchProducts]);

  const filtered = products.filter((p) => {
    // If no search query, show all products (filtered by category only)
    if (!searchQuery || searchQuery.trim().length === 0) {
      const matchesCategory =
        activeCategory === "all" || p.category?.toLowerCase() === activeCategory.toLowerCase();
      return matchesCategory;
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Search in product name
    const matchesName = p.productName?.toLowerCase().includes(searchLower) || false;
    
    // Search in seller/artisan name
    const matchesSeller = p.seller?.user?.userName?.toLowerCase().includes(searchLower) || false;
    
    // Search in product tags (tags are searchable but not displayed in UI)
    const matchesTags = p.tags && Array.isArray(p.tags) 
      ? p.tags.some(tag => {
          if (typeof tag === 'string') {
            return tag.toLowerCase().includes(searchLower);
          }
          return false;
        })
      : false;
    
    // Search in category
    const matchesCategoryInSearch = p.category?.toLowerCase().includes(searchLower) || false;
    
    const matchesSearch = matchesName || matchesSeller || matchesTags || matchesCategoryInSearch;
    
    // Also filter by selected category
    const matchesCategory =
      activeCategory === "all" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ["all", ...unique];
  }, [products]);

  useEffect(() => {
    if (activeCategory !== "all" && !categories.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  // Helper function to get all images for a product (main + additional)
  const getAllImages = (product) => {
    const images = [];
    const addedUrls = new Set(); // To avoid duplicates
    
    // Add additional images first (they contain all images including main)
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.forEach((img, index) => {
        if (img && !addedUrls.has(img)) {
          addedUrls.add(img);
          images.push({
            src: fixImageUrl(img),
            type: index === 0 ? 'main' : 'additional',
            index: index
          });
        }
      });
    }
    
    // If no additional images, add main image
    if (images.length === 0 && product.productImage && !addedUrls.has(product.productImage)) {
      images.push({
        src: fixImageUrl(product.productImage),
        type: 'main'
      });
    }
    
    return images;
  };

  // Helper function to get current image for a product
  const getCurrentImage = (product) => {
    const allImages = getAllImages(product);
    const productId = product.id || product.product_id;
    const currentIndex = currentImageIndex[productId] || 0;
    return allImages[currentIndex] || null;
  };

  // Helper function to navigate to next image
  const goToNextImage = (product, e) => {
    e.stopPropagation(); // Prevent navigation to product page
    const productId = product.id || product.product_id;
    const allImages = getAllImages(product);
    const currentIndex = currentImageIndex[productId] || 0;
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: nextIndex
    }));
  };

  // Helper function to navigate to previous image
  const goToPreviousImage = (product, e) => {
    e.stopPropagation(); // Prevent navigation to product page
    const productId = product.id || product.product_id;
    const allImages = getAllImages(product);
    const currentIndex = currentImageIndex[productId] || 0;
    const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: prevIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="text-center py-12">
          <p className="text-[#9F2936] mb-4">Error loading products: {error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Please make sure:</p>
            <ul className="list-disc list-inside">
              <li>The Laravel backend server is running on localhost:8080</li>
              <li>There are approved products in the database</li>
              <li>The database connection is working</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>

      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Mobile Category Dropdown */}
      <div className="lg:hidden mb-4">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="bg-white hover:bg-gray-100">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Category Tabs */}
      <div className="hidden lg:block mb-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="text-sm px-3 py-1.5 whitespace-nowrap"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No products found.</p>
          <p className="text-sm text-gray-400">
            {products.length === 0 
              ? "No products available in the database." 
              : "No products match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const allImages = getAllImages(product);
            const currentImage = getCurrentImage(product);
            const productId = product.id || product.product_id;
            const currentIndex = currentImageIndex[productId] || 0;
            const isFromFollowedSeller = followedProductIds.has(productId);
            
            return (
              <ProductCardWrapper 
                productId={product.id || product.product_id} 
                productTags={product.tags || []}
                searchQuery={searchQuery}
                key={product.id}
              >
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group shadow-sm">
                  {currentImage ? (
                    <img 
                      src={currentImage.src} 
                      alt={product.productName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Placeholder when no images */}
                  <div 
                    className="w-full h-full flex items-center justify-center text-gray-400"
                    style={{ display: currentImage ? 'none' : 'flex' }}
                  >
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Recommended Badge */}
                  {(() => {
                    const shouldShow = product.isRecommended === true || product.isRecommended === 'true' || product.isRecommended;
                    if (shouldShow) {
                      console.log('✅ ProductsPage - Showing Recommended badge for product:', product.id, product.productName, { isRecommended: product.isRecommended });
                    }
                    return shouldShow ? (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-[#b88668] to-[#7b5a3b] text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg border border-white/50 z-20">
                        Recommended
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Navigation buttons - show when multiple images exist */}
                  {allImages.length > 1 && (
                    <>
                      {/* Previous button */}
                      <button
                        onClick={(e) => goToPreviousImage(product, e)}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-transparent text-black hover:text-gray-700 rounded-full p-2 transition-colors duration-200 z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Next button */}
                      <button
                        onClick={(e) => goToNextImage(product, e)}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent text-black hover:text-gray-700 rounded-full p-2 transition-colors duration-200 z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Image counter */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full z-10 font-bold backdrop-blur-sm">
                        {currentIndex + 1}/{allImages.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="mt-4 space-y-2">
                  <h2 className="font-semibold text-gray-900 text-2xl leading-tight overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.productName}
                  </h2>
                  
                  {/* Store Name and Seller Name */}
                  <div className="space-y-1">
                    <p className="text-sm text-[#9F2936] font-medium">
                      {product.seller?.store?.store_name || product.seller?.businessName || "Unknown Store"}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {product.seller?.user?.userName || "Unknown Seller"}
                    </p>
                  </div>
                  
                  {/* Price with Category Badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#9F2936]">
                      ₱{Number(product.productPrice).toFixed(2)}
                    </p>
                    {product.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating and Sold Count Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 5 Star Rating Display */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, index) => {
                          const rating = product.average_rating || product.rating || 0;
                          const filled = index + 1 <= Math.floor(rating);
                          const halfFilled = index + 1 === Math.ceil(rating) && rating % 1 !== 0;
                          return (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${
                                filled 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : halfFilled
                                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm font-bold text-[#5c3d28]">
                        {(product.average_rating || product.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">({product.reviews_count || product.total_ratings || 0})</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-medium ${product.sold_count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.sold_count || 0} sold
                      </span>
                    </div>
                  </div>
                  
                  {/* Stock Information */}
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className={`font-medium ${
                        (product.productQuantity || 0) > 10 ? 'text-green-600' : 
                        (product.productQuantity || 0) > 0 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {(product.productQuantity || 0) > 0 ? `${product.productQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    {(product.productQuantity || 0) > 0 && (product.productQuantity || 0) <= 10 && (
                      <span className="text-xs text-orange-600 font-medium">
                        Low stock!
                      </span>
                    )}
                  </div>
                </div>
              </div>
              </ProductCardWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
