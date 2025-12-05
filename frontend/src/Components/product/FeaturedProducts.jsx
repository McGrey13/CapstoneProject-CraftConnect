import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight, Filter, X, ShoppingCart, Heart } from "lucide-react";
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
import api from "../../api";
import { useFavorites } from "../favorites/FavoritesContext";
import "../Home/CategoryGrid.css";

const FALLBACK_PRODUCT_IMAGE = null;

const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover unique handcrafted items from talented artisans around Laguna",
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [modalType, setModalType] = useState('cart'); // 'cart' or 'favorite'
  const { favorites, toggleFavorite } = useFavorites();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  // Helper function to convert image URLs to proper format
  const fixImageUrl = (url) => {
    if (!url || url === '') return null;
    
    // If it's already a full URL, return as is (but ensure it's correct)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // If it's a Laravel URL but wrong port, fix it
      if (url.includes('localhost') && !url.includes(':8000')) {
        return url.replace(/localhost(:\d+)?/, 'localhost:8000');
      }
      return url;
    }
    
    // Handle storage paths - Laravel storage URLs
    if (url.includes('storage/')) {
      // Remove leading slash if present
      const cleanPath = url.startsWith('/') ? url.substring(1) : url;
      return `http://localhost:8000/${cleanPath}`;
    }
    
    // Handle other relative paths
    if (url.startsWith('/')) {
      return `http://localhost:8000${url}`;
    }
    
    // Default: assume it's a storage path
    return `http://localhost:8000/storage/${url}`;
  };

  const fetchProducts = useCallback(async () => {
    try {
      console.log('🚀🚀🚀 FeaturedProducts - fetchProducts called');
      setLoading(true);
      setError(null);
      
      // Check if user is logged in as a customer
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      console.log('🔑 FeaturedProducts - Token check:', { hasToken: !!token, tokenLength: token?.length });
      let isCustomer = false;
      if (token) {
        try {
          const userDataStr = localStorage.getItem('user_data');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            const userRole = userData.role || userData.userRole || userData.user_type || userData.userType;
            isCustomer = userRole === 'customer' || userRole === 'Customer';
            
            console.log('🔍 FeaturedProducts - User check:', {
              hasToken: !!token,
              hasUserData: !!userDataStr,
              userRole: userRole,
              isCustomer: isCustomer,
              userDataKeys: Object.keys(userData || {})
            });
          } else {
            console.log('⚠️ FeaturedProducts - No user_data in localStorage');
          }
        } catch (e) {
          console.error('❌ FeaturedProducts - Error parsing user data:', e);
        }
      } else {
        console.log('ℹ️ FeaturedProducts - No token found, skipping recommendations');
      }
      
      // Get AI-powered recommendations first (only for logged-in customers)
      let recommendedProductIds = [];
      let recommendedProductsMap = new Map();
      
      if (isCustomer && token) {
      try {
          const recResponse = await api.get('/recommendations', {
            params: { limit: 50 },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('📥 FeaturedProducts - Recommendation API Response:', {
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
            
            console.log('✅✅✅ FeaturedProducts - AI Recommendations loaded:', recResponse.data.recommendations.length, 'products');
            console.log('📋 Recommendation IDs:', recommendedProductIds.slice(0, 10));
            console.log('📋 Recommendation Map size:', recommendedProductsMap.size);
          } else {
            console.log('⚠️ No recommendations available (user may not have enough browsing history)');
        }
      } catch (err) {
          console.log('⚠️ No recommendations available:', err.response?.data?.message || err.message);
          console.log('Using default product sorting');
        }
      } else {
        console.log('ℹ️ User not logged in as customer - skipping AI recommendations');
      }
      
      // Fetch all approved products
      const response = await api.get('/products/approved');
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      // Merge recommended products data with all products
      const allProductsWithRecommendations = data.map(product => {
        const productId = product.id || product.product_id;
        const productIdStr = String(productId);
        const recommendedData = recommendedProductsMap.get(productIdStr) || 
                                recommendedProductsMap.get(String(productId)) ||
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
        const pid = String(p.id || p.product_id);
        return recommendedProductIds.includes(pid) || 
               recommendedProductIds.includes(String(p.id)) ||
               recommendedProductIds.includes(String(p.product_id));
      };
      
      // Sort: Prioritize recommended products with high ratings first, then others
      const sortedData = [...allProductsWithRecommendations].sort((a, b) => {
        const aIsRecommended = isProductRecommended(a);
        const bIsRecommended = isProductRecommended(b);
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        const reviewCountA = a.reviews_count || 0;
        const reviewCountB = b.reviews_count || 0;
        
        // First priority: Recommended products with high ratings (4+ stars)
        const aIsHighRatedRecommended = aIsRecommended && ratingA >= 4.0;
        const bIsHighRatedRecommended = bIsRecommended && ratingB >= 4.0;
        
        if (aIsHighRatedRecommended && !bIsHighRatedRecommended) return -1;
        if (!aIsHighRatedRecommended && bIsHighRatedRecommended) return 1;
        
        // If both are high-rated recommended, sort by rating first, then review count
        if (aIsHighRatedRecommended && bIsHighRatedRecommended) {
          if (ratingB !== ratingA) return ratingB - ratingA;
          return reviewCountB - reviewCountA;
        }
        
        // Second priority: Other recommended products
        if (aIsRecommended && !bIsRecommended) return -1;
        if (!aIsRecommended && bIsRecommended) return 1;
        
        // If both recommended, sort by rating
        if (aIsRecommended && bIsRecommended) {
          if (ratingB !== ratingA) return ratingB - ratingA;
          return reviewCountB - reviewCountA;
        }
        
        // Third priority: Rating (for non-recommended products)
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        
        // Fourth priority: Review count
        return reviewCountB - reviewCountA;
      });
      
      // Filter to only featured products
      const featuredProductsOnly = sortedData.filter(product => {
        return product.is_featured === true || product.is_featured === 1 || product.is_featured === 'true';
      });
      
      // Transform the API data to match our component's structure
      const transformedProducts = featuredProductsOnly.map(product => {
        // Check if product is recommended - use the isRecommended flag from merged data first
        const productId = product.id || product.product_id;
        const productIdStr = String(productId);
        const productIdNum = Number(productId);
        
        // Check if this product is already marked as recommended from merged data
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
        
        // Calculate if product is new (created within last 7 days)
        const isNew = product.created_at 
          ? (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) < 7
          : false;
        
          const imageUrl = fixImageUrl(product.productImage) || null;
        
        return {
          id: product.id || product.product_id,
          image: imageUrl,
          title: product.productName,
          price: parseFloat(product.productPrice) || 0,
          artisanName: product.seller?.user?.userName || 'Unknown Artisan',
          artisanId: product.seller?.sellerID,
          storeName: product.seller?.store?.store_name || '',
          storeLogo: fixImageUrl(product.seller?.store?.logo_url) || null,
          rating: product.average_rating || 0,
          reviewsCount: product.reviews_count || 0,
          isNew: isNew,
          isFeatured: product.is_featured || isRecommended,
          // Explicitly set to boolean true if recommended
          isRecommended: isRecommended === true || isRecommended === 'true' || isRecommended === 1,
          category: product.category
        };
      });
      
      const recommendedCount = transformedProducts.filter(p => p.isRecommended).length;
      console.log('🔍🔍🔍 FeaturedProducts Recommendation check:', {
        recommendedProductIds: recommendedProductIds.slice(0, 10),
        sampleProductIds: transformedProducts.slice(0, 5).map(p => ({ 
          id: p.id, 
          idStr: String(p.id),
          idNum: Number(p.id),
          isRecommended: p.isRecommended,
          isRecommendedType: typeof p.isRecommended
        })),
        recommendedCount: recommendedCount,
        totalProducts: transformedProducts.length,
        recommendedProducts: transformedProducts.filter(p => p.isRecommended).slice(0, 5).map(p => ({
          id: p.id,
          name: p.title,
          isRecommended: p.isRecommended
        }))
      });
      
      if (recommendedCount === 0 && recommendedProductIds.length > 0) {
        console.warn('⚠️⚠️⚠️ FeaturedProducts - WARNING: Recommendations fetched but no products matched!', {
          recommendationIds: recommendedProductIds.slice(0, 10),
          productIds: transformedProducts.slice(0, 10).map(p => ({
            id: p.id,
            idStr: String(p.id),
            idNum: Number(p.id)
          }))
        });
      }
      
      if (recommendedCount > 0) {
        console.log('🎉🎉🎉 FeaturedProducts - SUCCESS: Found', recommendedCount, 'recommended products!');
      }

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      // Suppress network errors and expected 401 errors
      if (!err.suppressError && err.code !== 'ERR_NETWORK' && err.message !== 'Network Error' && !err.message?.includes('ERR_INTERNET_DISCONNECTED')) {
        if (err.response?.status !== 401) {
          console.error("Error fetching featured products:", err);
        }
      }
      // Only set error message for actual API errors, not network issues
      if (err.response && err.response.status !== 401) {
        setError("Failed to load products. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
            console.log('🔄 FeaturedProducts - User changed - refetching for personalized recommendations');
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

  // Dynamically extract categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    
    // Extract all unique categories from products
    products.forEach(product => {
      if (product.category && product.category.trim() !== '') {
        uniqueCategories.add(product.category);
      }
    });
    
    // Convert to array, sort alphabetically, and add "All" at the beginning
    const sortedCategories = Array.from(uniqueCategories).sort((a, b) => 
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    
    return ["All", ...sortedCategories];
  }, [products]);

  // Check scroll position and update arrow visibility for category filter
  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Scroll functions for category filter
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position on mount and when categories change
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [categories, checkScrollPosition]);

  const itemsPerPage = 6; // 3 products per row × 2 rows

  const filteredProducts = products.filter((product) => {
    if (activeTab === "All") return true;
    return product.category === activeTab;
  });

      const sortWithPreference = (items, preferRecommended = false) => {
    const hasRatings = (product) => (product.reviewsCount || 0) > 0;
    const getWeightedScore = (product) => {
      const rating = product.rating || 0;
      const count = product.reviewsCount || 0;
      return rating * Math.log10(count + 1) + (count / 100);
    };
    
        if (preferRecommended) {
          return [...items].sort((a, b) => {
            const aRecommended = a.isRecommended ? 1 : 0;
            const bRecommended = b.isRecommended ? 1 : 0;
            if (bRecommended !== aRecommended) return bRecommended - aRecommended;

    const aHasRatings = hasRatings(a);
    const bHasRatings = hasRatings(b);
            if (aHasRatings !== bHasRatings) return bHasRatings - aHasRatings;
    
    switch (sortBy) {
      case "price-low":
                if (a.price !== b.price) return a.price - b.price;
                return getWeightedScore(b) - getWeightedScore(a);
              case "price-high":
                if (a.price !== b.price) return b.price - a.price;
                return getWeightedScore(b) - getWeightedScore(a);
              case "rating":
                return getWeightedScore(b) - getWeightedScore(a);
              default:
                if (aRecommended && bRecommended) {
          return getWeightedScore(b) - getWeightedScore(a);
        }
                if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          return getWeightedScore(b) - getWeightedScore(a);
        }
          });
        }

        return [...items].sort((a, b) => {
          const aHasRatings = hasRatings(a);
          const bHasRatings = hasRatings(b);
          if (aHasRatings !== bHasRatings) return bHasRatings - aHasRatings;

          switch (sortBy) {
            case "price-low":
              if (a.price !== b.price) return a.price - b.price;
          return getWeightedScore(b) - getWeightedScore(a);
            case "price-high":
              if (a.price !== b.price) return b.price - a.price;
              return getWeightedScore(b) - getWeightedScore(a);
            case "rating":
              return getWeightedScore(b) - getWeightedScore(a);
      default:
              if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          return getWeightedScore(b) - getWeightedScore(a);
    }
  });
      };

      const preferRecommended = products.some(p => p.isRecommended);
      const sortedProducts = sortWithPreference(filteredProducts, preferRecommended);

  const paginatedProducts = sortedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);

  // Authentication check functions
  const handleAddToCartWithAuth = (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setModalType('cart');
      setShowLoginModal(true);
      return;
    }
    onAddToCart(product);
  };

  const handleFavoriteWithAuth = (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setModalType('favorite');
      setShowFavoriteModal(true);
      return;
    }
    toggleFavorite(product);
  };

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
    <>
    <section className="w-full max-w-[1400px] mx-auto py-8 px-3 bg-white">
    <div className="text-center mb-4 md:mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 transition-transform duration-300 hover:scale-105">{title}</h2>
      <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">{subtitle}</p>
    </div>
  
    {/* Category Tabs + Sort Filter */}
<div className="flex flex-col w-full items-center mb-4 gap-3">
  {/* Mobile Dropdown */}
  <div className="w-full sm:hidden">
    <select
      value={activeTab}
      onChange={(e) => setActiveTab(e.target.value)}
      className="w-full py-2.5 px-4 bg-white border-2 border-gray-300 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-200 hover:border-[#9F2936] focus:border-[#9F2936] focus:outline-none"
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Tabs with Scrollable Arrows */}
  <div className="hidden sm:block w-full">
    <div className="relative">
      {/* Left Arrow Button */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] border-2 border-[#a4785a] rounded-full p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl group hover:scale-110"
          aria-label="Scroll left"
        >
          <svg 
            className="w-5 h-5 text-[#a4785a] group-hover:text-white transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow Button */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] border-2 border-[#a4785a] rounded-full p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl group hover:scale-110"
          aria-label="Scroll right"
        >
          <svg 
            className="w-5 h-5 text-[#a4785a] group-hover:text-white transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          onScroll={checkScrollPosition}
          style={{ scrollBehavior: 'smooth' }}
        >
          <TabsList className="flex gap-2 bg-transparent pl-12 pr-12">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-4 py-2 text-sm border border-gray-300 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0
                           hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105
                           data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:border-[#a4785a] data-[state=active]:font-semibold data-[state=active]:shadow-md"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </div>
  </div>

  {/* Sort Filter - placed BELOW on mobile */}
  <div className="w-full sm:w-auto flex justify-center">
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-300 focus:ring-[#9F2936] transition-all duration-200 hover:border-[#a4785a]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="featured" className="bg-white hover:bg-[#f5f5f5]">Featured</SelectItem>
        <SelectItem value="price-low" className="bg-white hover:bg-[#f5f5f5]">Price: Low to High</SelectItem>
        <SelectItem value="price-high" className="bg-white hover:bg-[#f5f5f5]">Price: High to Low</SelectItem>
        <SelectItem value="rating" className="bg-white hover:bg-[#f5f5f5]">Highest Rated</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

  
    {/* Product Grid */}
    {paginatedProducts.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        No products found in this category.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 flex flex-col"
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            {/* Product Image */}
            <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f3e7db] via-[#f7eee4] to-[#efe1d2] flex flex-col items-center justify-center text-[#7b5a3b]">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-3l-1-1h-6l-1 1H5a2 2 0 00-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium">Image not available</p>
                </div>
              )}
              
              {/* Featured Badge - Top Left */}
              {product.isFeatured && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                    Featured
                  </span>
                </div>
              )}
              
              {/* Favorite Button - Top Right */}
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="favorite-btn bg-white/90 hover:bg-white rounded-full p-2 h-8 w-8 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteWithAuth(product);
                  }}
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      favorites.some(fav => fav.id === product.id) 
                        ? "text-red-500 fill-red-500" 
                        : "text-gray-400"
                    }`} 
                  />
                </Button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
              {/* Product Name & Category */}
              <div className="mb-2">
                <h3 
                  className="text-base font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] max-h-[2.5rem] overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word'
                  }}
                  title={product.title}
                >
                  {product.title && product.title.length > 50 
                    ? `${product.title.substring(0, 50)}...` 
                    : product.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {product.category}
                </p>
              </div>

              {/* Artisan/Store Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                {product.storeLogo && (
                  <img 
                    src={product.storeLogo} 
                    alt={product.storeName || product.artisanName} 
                    className="w-4 h-4 rounded-full object-cover border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="truncate font-medium">{product.storeName || product.artisanName}</span>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm font-semibold text-gray-700">{product.rating || 0}</span>
                </div>
                
                <div className="text-lg font-bold text-gray-900">
                  ₱{product.price.toFixed(2)}
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCartWithAuth(product);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  
    {/* Pagination */}
    {pageCount > 1 && (
      <div className="flex flex-col md:flex-row justify-center items-center mt-10 gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="flex items-center px-5 py-2 border-gray-300 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
  
        <div className="text-sm text-gray-600 font-medium">
          Page <span className="text-[#a4785a] font-bold">{currentPage + 1}</span> of {pageCount}
        </div>
  
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={currentPage === pageCount - 1}
          className="flex items-center px-5 py-2 border-gray-300 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-gray-800"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )}
  </section>

  {/* Login Modal */}
  {showLoginModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#5c3d28]">Login Required</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLoginModal(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <p className="text-[#7b5a3b] text-center text-lg">
            Please log in to add items to your cart and continue shopping.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLoginModal(false)}
            className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowLoginModal(false);
              window.location.href = "/login";
            }}
            className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold transition-all duration-200"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )}

  {/* Favorites Modal */}
  {showFavoriteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#5c3d28]">Login Required</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFavoriteModal(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full mx-auto mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <p className="text-[#7b5a3b] text-center text-lg">
            Please log in to add items to your favorites and save them for later.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFavoriteModal(false)}
            className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowFavoriteModal(false);
              window.location.href = "/login";
            }}
            className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold transition-all duration-200"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )}
  </>
  );
};

export default FeaturedProducts;