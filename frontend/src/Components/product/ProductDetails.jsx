import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Play, MessageCircle, ChevronLeft, ChevronRight, Users, Award, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useCart } from "../Cart/CartContext";
import { useFavorites } from "../favorites/FavoritesContext";
import { useProductViewTracker } from "../../hooks/useProductViewTracker";
import MessengerPopup from "../Messenger/MessengerPopup";
import api from "../../api";
import "./ProductDetails.css";
import { useToast } from "../Context/ToastContext";

// Related Products Section Component
const RelatedProductsSection = ({ productId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // Try related products endpoint first, fallback to recommendations
        try {
          const response = await api.get(`/products/${productId}/related`);
          if (response.data && response.data.success && response.data.products && response.data.products.length > 0) {
            setRelatedProducts(response.data.products);
            return;
          }
        } catch (err) {
          console.log('Related products endpoint not available, trying recommendations...');
        }
        
        // Fallback: Use recommendations API if related products endpoint doesn't exist
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        if (token) {
          try {
            const recResponse = await api.get('/recommendations', {
              params: { limit: 6 },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (recResponse.data.success && recResponse.data.recommendations) {
              // Filter out the current product
              const filtered = recResponse.data.recommendations.filter(
                p => (p.id || p.product_id) != productId
              );
              setRelatedProducts(filtered.slice(0, 6));
              return;
            }
          } catch (err) {
            console.log('Recommendations not available');
          }
        }
        
        // Final fallback: Get products from same category
        try {
          const productResponse = await api.get(`/products/${productId}`);
          if (productResponse.data && productResponse.data.category) {
            const categoryResponse = await api.get('/products/approved');
            const allProducts = Array.isArray(categoryResponse.data) 
              ? categoryResponse.data 
              : (categoryResponse.data?.data || []);
            const sameCategory = allProducts.filter(
              p => p.category === productResponse.data.category && 
                   (p.id || p.product_id) != productId
            );
            setRelatedProducts(sameCategory.slice(0, 6));
            return;
          }
        } catch (err) {
          console.log('Category fallback failed');
        }
        
        setRelatedProducts([]);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return `http://localhost:8000${url}`;
    }
    return `http://localhost:8000/storage/${url}`;
  };

  if (loading) {
    return (
      <div className="mt-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#5c3d28] mb-2">You May Also Like</h2>
            <p className="text-[#7b5a3b]">Loading related products...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#5c3d28] mb-2">You May Also Like</h2>
          <p className="text-[#7b5a3b]">Products you might be interested in</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.slice(0, 6).map((product) => {
            const productId = product.id || product.product_id;
            return (
              <div
                key={productId}
                onClick={() => navigate(`/product/${productId}`)}
                className="cursor-pointer bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group shadow-sm">
                  {product.productImage ? (
                    <img 
                      src={fixImageUrl(product.productImage)} 
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
                    style={{ display: product.productImage ? 'none' : 'flex' }}
                  >
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
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
                    {product.seller?.user?.userName && (
                      <p className="text-xs text-gray-500">
                        by {product.seller.user.userName}
                      </p>
                    )}
                  </div>
                  
                  {/* Price with Category Badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#9F2936]">
                      ₱{Number(product.productPrice || 0).toFixed(2)}
                    </p>
                    {product.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating Display */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, index) => {
                        const rating = product.average_rating || 0;
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
                      {(product.average_rating || 0).toFixed(1)}
                    </span>
                    {product.reviews_count !== undefined && (
                      <span className="text-xs text-gray-500">({product.reviews_count || 0})</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState({ type: "image", src: null });
  const [addingToCart, setAddingToCart] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allMedia, setAllMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [showMessageSeller, setShowMessageSeller] = useState(false);
  const [variationOptions, setVariationOptions] = useState([]);
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const selectedVariation = useMemo(
    () => variationOptions.find((variation) => variation.id === selectedVariationId) || null,
    [variationOptions, selectedVariationId]
  );
  const availableQuantity = useMemo(() => {
    if (selectedVariation && selectedVariation.quantity !== undefined && selectedVariation.quantity !== null) {
      const parsed = Number(selectedVariation.quantity);
      if (Number.isFinite(parsed)) {
        return Math.max(parsed, 0);
      }
    }
    if (product && product.productQuantity !== undefined && product.productQuantity !== null) {
      const parsed = Number(product.productQuantity);
      if (Number.isFinite(parsed)) {
        return Math.max(parsed, 0);
      }
    }
    return 0;
  }, [selectedVariation, product]);
  const effectivePrice = useMemo(() => {
    const rawPrice =
      (selectedVariation && selectedVariation.price !== undefined
        ? selectedVariation.price
        : product?.productPrice) ?? 0;
    const numericPrice = Number(rawPrice);
    return Number.isFinite(numericPrice) ? numericPrice : 0;
  }, [selectedVariation, product]);
  const selectedVariationPayload = useMemo(() => {
    if (!selectedVariation) return null;
    const { id, label, price, quantity, sku, attributes } = selectedVariation;
    return {
      id,
      label,
      price,
      quantity,
      sku,
      attributes,
    };
  }, [selectedVariation]);

  // Helper function to convert image URLs to use correct backend
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost:8000, use it directly
    if (url.includes('localhost:8000')) {
      return url;
    }
    // If it's a full URL with localhost:8080, convert to 8000
    if (url.includes('localhost:8080')) {
      return url.replace('localhost:8080', 'localhost:8000');
    }
    // If it's already a relative path starting with /storage/, use it
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    // If it's a path without leading slash, add /storage/
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      return `/storage/${url}`;
    }
    return url;
  };

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/products/${id}`);
      const productData = response.data;

      const mappedVariations = Array.isArray(productData.variations)
        ? productData.variations.map((variation, idx) => {
            const rawQuantity =
              variation.quantity ??
              variation.productQuantity ??
              variation.stock ??
              variation.inventory ??
              0;
            const parsedQuantity = Number(rawQuantity);
            const quantity = Number.isFinite(parsedQuantity) ? Math.max(parsedQuantity, 0) : 0;
            const rawPrice =
              variation.price ??
              variation.productPrice ??
              variation.amount ??
              variation.cost ??
              productData.productPrice ??
              0;
            const price = Number(rawPrice);
            const attributes = (() => {
              if (Array.isArray(variation.attributes)) {
                return variation.attributes;
              }
              if (variation.attributes && typeof variation.attributes === "object") {
                return Object.entries(variation.attributes).map(([name, value]) => ({
                  name,
                  value,
                }));
              }
              if (Array.isArray(variation.values)) {
                return variation.values.map((value, valueIdx) => ({
                  name: `Option ${valueIdx + 1}`,
                  value,
                }));
              }
              return [];
            })();

            const label =
              variation.label ||
              variation.size ||
              variation.name ||
              variation.sku ||
              `Variation ${idx + 1}`;

            return {
              id: variation.variation_id || variation.id || `variation-${idx}`,
              variation_id: variation.variation_id || variation.id,
              label,
              size: variation.size || null,
              price: Number.isFinite(price) ? price : Number(productData.productPrice ?? 0),
              quantity,
              sku: variation.sku || null,
              attributes,
              raw: variation,
            };
          })
        : [];

      setVariationOptions(mappedVariations);
      const initialVariation =
        mappedVariations.find((variation) => (variation.quantity ?? 0) > 0) ||
        mappedVariations[0] ||
        null;
      setSelectedVariationId(initialVariation?.id ?? null);
      
      // Process all images (main + additional) with fixed URLs
      const images = [];
      if (productData.productImage) {
        images.push(fixImageUrl(productData.productImage));
      }
      if (productData.productImages && Array.isArray(productData.productImages)) {
        productData.productImages.forEach(img => {
          const fixedUrl = fixImageUrl(img);
          if (fixedUrl && !images.includes(fixedUrl)) {
            images.push(fixedUrl);
          }
        });
      }
      setAllImages(images);

      // Process all media (images + videos)
      const media = [];
      images.forEach(img => {
        media.push({ type: "image", src: img });
      });
      if (productData.productVideo) {
        media.push({ type: "video", src: fixImageUrl(productData.productVideo) });
      }
      
      setAllMedia(media);
      setCurrentImageIndex(0);
      setCurrentMediaIndex(0);
      setSelectedMedia(media[0] || { type: "image", src: productData.productImage });

      // Reviews and ratings are now included in the product data
      if (productData.reviews && Array.isArray(productData.reviews)) {
        setReviews(productData.reviews);
      } else {
        setReviews([]);
      }
      
      // Use the average rating from the backend or calculate it
      if (productData.average_rating !== undefined) {
        setAverageRating(productData.average_rating);
      } else if (productData.reviews && productData.reviews.length > 0) {
        const totalRating = productData.reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const calculatedAverage = totalRating / productData.reviews.length;
        setAverageRating(calculatedAverage);
      } else {
        setAverageRating(0);
      }

      setProduct({ ...productData, variations: mappedVariations });
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching product/reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductAndReviews();
  }, [id]);

  useEffect(() => {
    if (selectedVariation) {
      const maxQty = selectedVariation.quantity ?? 0;
      if (maxQty > 0) {
        setQuantity((prev) => Math.min(Math.max(prev, 1), maxQty));
      } else {
        setQuantity(1);
      }
    } else if (product && typeof product.productQuantity === "number" && product.productQuantity > 0) {
      setQuantity((prev) => Math.min(Math.max(prev, 1), product.productQuantity));
    }
  }, [selectedVariation, product]);

  // Inject styles to ensure button hover text is visible
  useEffect(() => {
    const styleId = 'product-action-button-hover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        button.product-action-button:hover,
        button.product-action-button:hover *,
        button.product-action-button:hover > *,
        button.product-action-button:hover span,
        button.product-action-button:hover > span {
          color: #ffffff !important;
        }
        button.product-action-button:hover svg,
        button.product-action-button:hover > svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
          fill: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Track product view for AI recommendations
  useProductViewTracker(id);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] flex items-center justify-center">
      <Card className="bg-white border-2 border-[#d5bfae] shadow-xl p-8">
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto mb-4"></div>
          <p className="text-[#5c3d28] text-lg font-semibold">Loading product details...</p>
        </CardContent>
      </Card>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] flex items-center justify-center">
      <Card className="bg-white border-2 border-red-200 shadow-xl p-8">
        <CardContent className="text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-red-800 mb-2">Error Loading Product</h3>
          <p className="text-red-600 text-lg">{error}</p>
          <Button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-[#a4785a] hover:bg-[#8f674a] text-white"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] flex items-center justify-center">
      <Card className="bg-white border-2 border-[#d5bfae] shadow-xl p-8">
        <CardContent className="text-center">
          <div className="p-4 bg-[#f5f0eb] rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <span className="text-[#a4785a] text-2xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-[#5c3d28] mb-2">Product Not Found</h3>
          <p className="text-[#7b5a3b] text-lg">The product you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-[#a4785a] hover:bg-[#8f674a] text-white"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const isFavorited = favorites.some((p) => p.id === product.id);

  const handleVariationSelect = (variationId) => {
    setSelectedVariationId(variationId);
    const variation = variationOptions.find((option) => option.id === variationId);
    if (variation) {
      const maxQty = variation.quantity ?? 0;
      if (maxQty > 0) {
        setQuantity((prev) => Math.min(Math.max(prev, 1), maxQty));
      } else {
        setQuantity(1);
      }
    }
  };

  const handleQuantityChange = (change) => {
    const nextValue = Math.max(1, quantity + change);
    if (availableQuantity > 0) {
      setQuantity(Math.min(nextValue, availableQuantity));
    } else {
      setQuantity(nextValue);
    }
  };

  const handleAddToCart = async () => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (variationOptions.length > 0 && !selectedVariation) {
      showToast("Please select a product variation before adding to cart.", "error");
      return;
    }

    if (availableQuantity <= 0) {
      showToast("This product is currently out of stock.", "error");
      return;
    }

    if (quantity > availableQuantity) {
      setQuantity(availableQuantity);
      showToast(`Only ${availableQuantity} item(s) are available for this selection.`, "warning");
      return;
    }

    try {
      setAddingToCart(true);
      const productForCart = {
        ...product,
        productPrice: selectedVariation?.price ?? product.productPrice,
        selectedVariation: selectedVariationPayload,
      };

      const result = await addToCart(productForCart, quantity);
      if (result.success) {
        showToast("Item added to cart successfully!", "success");
        navigate("/cart");
      } else {
        showToast(result.error || "Failed to add item to cart.", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add item to cart. Please try again.", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (variationOptions.length > 0 && !selectedVariation) {
      showToast("Please select a product variation before continuing.", "error");
      return;
    }

    if (availableQuantity <= 0) {
      showToast("This product is currently out of stock.", "error");
      return;
    }

    if (quantity > availableQuantity) {
      setQuantity(availableQuantity);
      showToast(`Only ${availableQuantity} item(s) are available for this selection.`, "warning");
      return;
    }

    const checkoutProduct = {
      ...product,
      productPrice: selectedVariation?.price ?? product.productPrice,
      selectedVariation: selectedVariationPayload,
    };

    navigate("/checkout", {
      state: {
        product: checkoutProduct,
        quantity,
        selectedVariation: selectedVariationPayload,
      },
    });
  };

  const handleFavoriteClick = () => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setShowFavoriteModal(true);
      return;
    }
    isFavorited ? removeFavorite(product.id) : addFavorite(product);
  };

  const goToNextMedia = () => {
    if (allMedia.length > 1) {
      const nextIndex = (currentMediaIndex + 1) % allMedia.length;
      setCurrentMediaIndex(nextIndex);
      setSelectedMedia(allMedia[nextIndex]);
      
      // Update image index if the next media is an image
      if (allMedia[nextIndex].type === "image") {
        const imageIndex = allImages.indexOf(allMedia[nextIndex].src);
        if (imageIndex !== -1) {
          setCurrentImageIndex(imageIndex);
        }
      }
    }
  };

  const goToPreviousMedia = () => {
    if (allMedia.length > 1) {
      const prevIndex = currentMediaIndex === 0 ? allMedia.length - 1 : currentMediaIndex - 1;
      setCurrentMediaIndex(prevIndex);
      setSelectedMedia(allMedia[prevIndex]);
      
      // Update image index if the previous media is an image
      if (allMedia[prevIndex].type === "image") {
        const imageIndex = allImages.indexOf(allMedia[prevIndex].src);
        if (imageIndex !== -1) {
          setCurrentImageIndex(imageIndex);
        }
      }
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = () => {}, size = "w-5 h-5") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < fullStars 
            ? "text-amber-400 fill-amber-400" 
            : i === fullStars && hasHalfStar
            ? "text-amber-400 fill-amber-400/50"
            : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:scale-110 transition-transform duration-200" : ""}`}
        onClick={() => interactive && onStarClick(i + 1)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] py-8">
      <div className="container mx-auto px-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-[#5c3d28] hover:text-[#7b5a3b] hover:bg-[#d5bfae]/20 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="w-full">
            <div className="relative">
              <Card className="overflow-hidden aspect-square flex items-center justify-center border-2 border-[#d5bfae] shadow-xl bg-white">
                {selectedMedia.type === "image" ? (
                  <img
                    src={selectedMedia.src}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={selectedMedia.src}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </Card>

              {/* Navigation buttons for all media */}
              {allMedia.length > 1 && (
                <>
                  {/* Previous button */}
                  <button
                    onClick={goToPreviousMedia}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2 transition-all duration-200 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Next button */}
                  <button
                    onClick={goToNextMedia}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2 transition-all duration-200 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Media counter */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full z-10 font-bold">
                    {currentMediaIndex + 1}/{allMedia.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
              {allMedia.map((media, idx) => (
                <div
                  key={`media-${idx}`}
                  className={`w-24 h-24 overflow-hidden rounded-xl cursor-pointer border-2 shadow-md transition-all duration-200 hover:shadow-lg ${
                    selectedMedia.src === media.src 
                      ? "border-[#a4785a] shadow-lg scale-105" 
                      : "border-[#d5bfae] hover:border-[#a4785a]"
                  }`}
                  onClick={() => {
                    setSelectedMedia(media);
                    setCurrentMediaIndex(idx);
                    if (media.type === "image") {
                      const imageIndex = allImages.indexOf(media.src);
                      if (imageIndex !== -1) {
                        setCurrentImageIndex(imageIndex);
                      }
                    }
                  }}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.src}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc]">
                      <Play className="h-8 w-8 text-[#a4785a]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 flex flex-col">
          <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-[#5c3d28] mb-3">{product.productName}</h1>
              
              {/* Store Info with Logo */}
              <div className="flex items-center gap-3 mb-4">
                {product.seller?.store?.logo_url ? (
                  <img 
                    src={fixImageUrl(product.seller.store.logo_url)} 
                    alt={product.seller.store.store_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#d5bfae] shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback icon if no logo */}
                <div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-md"
                  style={{ display: product.seller?.store?.logo_url ? 'none' : 'flex' }}
                >
                  <Award className="h-6 w-6 text-white" />
                </div>
                <p className="text-[#7b5a3b] text-lg font-semibold">
                  {product.seller?.store?.store_name || product.seller?.businessName || "Unknown Store"}
                </p>
              </div>

              {/* Enhanced Rating Section with Container */}
              <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] p-4 rounded-xl border-2 border-[#d5bfae] mb-4 max-h-20 overflow-hidden">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {renderStars(averageRating, false, () => {}, "w-6 h-6")}
                    <span className="text-2xl font-bold text-[#5c3d28]">
                      {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#7b5a3b]">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="text-3xl font-bold text-[#5c3d28] mb-4">
                ₱{effectivePrice.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Actions */}
          <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
            <CardContent className="p-3">
              {variationOptions.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-lg font-semibold text-[#5c3d28]">Select Variation</span>
                    {selectedVariation && (
                      <span className="text-sm text-[#7b5a3b]">
                        {selectedVariation.quantity > 0
                          ? `${selectedVariation.quantity} item(s) available`
                          : "Out of stock"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variationOptions.map((variation) => {
                      const isSelected = selectedVariationId === variation.id;
                      const isOutOfStock = (variation.quantity ?? 0) <= 0;
                      const priceValue =
                        variation.price !== undefined && variation.price !== null
                          ? Number(variation.price)
                          : effectivePrice;
                      const displayPrice = Number.isFinite(priceValue)
                        ? priceValue.toFixed(2)
                        : effectivePrice.toFixed(2);
                      const attributesSummary =
                        Array.isArray(variation.attributes) && variation.attributes.length > 0
                          ? variation.attributes
                              .map((attribute) => {
                                if (typeof attribute === "string") {
                                  return attribute;
                                }
                                if (attribute && typeof attribute === "object") {
                                  const parts = [attribute.name, attribute.value].filter(Boolean);
                                  return parts.join(": ");
                                }
                                return null;
                              })
                              .filter(Boolean)
                              .join(" • ")
                          : null;

                      return (
                        <Button
                          key={variation.id}
                          type="button"
                          variant="outline"
                          disabled={isOutOfStock}
                          onClick={() => handleVariationSelect(variation.id)}
                          className={`min-w-[140px] flex-1 sm:flex-none text-left px-4 py-3 border-2 transition-all duration-200 ${
                            isSelected && !isOutOfStock
                              ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white border-transparent shadow-md"
                              : "border-[#d5bfae] text-[#5c3d28] hover:border-[#a4785a]"
                          } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className="font-semibold block">{variation.label}</span>
                          <span className={`text-sm ${isSelected ? "text-white/90" : "text-[#7b5a3b]"}`}>
                            ₱{displayPrice}
                          </span>
                          <span className={`text-xs ${isSelected ? "text-white/80" : "text-[#7b5a3b]/80"}`}>
                            {variation.quantity > 0 ? `${variation.quantity} in stock` : "Out of stock"}
                          </span>
                          {attributesSummary && (
                            <span className={`mt-1 text-xs ${isSelected ? "text-white/80" : "text-[#7b5a3b]/80"}`}>
                              {attributesSummary}
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-[#5c3d28]">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => handleQuantityChange(-1)} 
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-bold text-[#5c3d28] min-w-[3rem] text-center">{quantity}</span>
                    <Button 
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-full border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
                      disabled={availableQuantity > 0 && quantity >= availableQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  {availableQuantity > 0 ? (
                    <span className="text-sm text-[#7b5a3b]">
                      {availableQuantity} item(s) available
                      {selectedVariation?.sku && (
                        <span className="ml-2 text-xs text-[#5c3d28]/80">SKU: {selectedVariation.sku}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-red-600">Currently out of stock</span>
                  )}
                </div>
              </div>

              {/* Two Small Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleFavoriteClick}
                  className="flex-1 border-2 border-[#d5bfae] bg-white text-[#5c3d28] hover:border-[#a4785a] hover:bg-[#f5f0eb] hover:shadow-md transition-all duration-200 py-2 text-sm"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 transition-colors duration-200 ${
                      isFavorited 
                        ? "text-red-500 fill-current" 
                        : "text-[#5c3d28]"
                    }`}
                  />
                  <span className="text-[#5c3d28]">{isFavorited ? "Favorited" : "Add to Favorites"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const token = sessionStorage.getItem("auth_token");
                    if (!token) {
                      setShowLoginModal(true);
                      return;
                    }
                    setShowMessageSeller(true);
                  }}
                  className="flex-1 border-2 border-[#d5bfae] bg-white text-[#5c3d28] hover:border-[#a4785a] hover:bg-[#f5f0eb] hover:shadow-md transition-all duration-200 py-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-[#5c3d28] transition-colors duration-200" />
                  <span className="text-[#5c3d28]">Message Seller</span>
                </Button>
              </div>

              {/* Two Large Buttons */}
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-bold py-8 text-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={addingToCart || availableQuantity <= 0}
                >
                  <ShoppingCart className="w-8 h-8 mr-4" />
                  {availableQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  style={{ backgroundColor: '#E27D60', color: 'white' }}
                  className="flex-1 hover:bg-[#d16a4f] font-bold py-8 text-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="bg-white border-2 border-[#d5bfae] shadow-lg">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-md text-[#5c3d28] font-semibold transition-all duration-200 hover:text-[#a4785a] hover:bg-[#a4785a]/10"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-md text-[#5c3d28] font-semibold transition-all duration-200 hover:text-[#a4785a] hover:bg-[#a4785a]/10"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#5c3d28] mb-4">Product Description</h3>
                  <p className="text-[#7b5a3b] text-lg leading-relaxed">{product.productDescription}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              {reviews.length > 0 ? (
                <div className="bg-white border-2 border-[#d5bfae] shadow-xl rounded-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] border-b-2 border-[#d5bfae]">
                    <h3 className="text-lg font-bold text-[#5c3d28]">Customer Reviews</h3>
                    <p className="text-sm text-[#7b5a3b]">{reviews.length} review{reviews.length !== 1 ? 's' : ''} total</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <Card key={review.review_id || review.id} className="bg-white border border-[#d5bfae] shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {(review.user?.userName || "A").charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-[#5c3d28] text-base">
                                  {review.user?.userName || "Anonymous"}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {renderStars(review.rating, false, () => {}, "w-3 h-3")}
                                  <span className="text-xs text-[#7b5a3b]">
                                    {new Date(review.review_date || review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-[#a4785a] text-white text-xs">
                              {review.rating} Star{review.rating !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {review.comment && (
                            <p className="text-[#7b5a3b] text-sm leading-relaxed mb-3">
                              "{review.comment}"
                            </p>
                          )}
                          
                          {/* Review Images */}
                          {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-[#7b5a3b]" />
                                <span className="text-xs font-semibold text-[#7b5a3b]">
                                  {review.images.length} {review.images.length === 1 ? 'Image' : 'Images'}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {review.images.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={fixImageUrl(img)}
                                      alt={`Review image ${idx + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border-2 border-[#d5bfae] cursor-pointer hover:border-[#a4785a] transition-all"
                                      onClick={() => {
                                        setSelectedMedia({ type: "image", src: fixImageUrl(img) });
                                        setCurrentImageIndex(idx);
                                        setAllImages(review.images.map(i => fixImageUrl(i)));
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Review Video */}
                          {review.video_path && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <VideoIcon className="h-4 w-4 text-[#7b5a3b]" />
                                <span className="text-xs font-semibold text-[#7b5a3b]">Video</span>
                              </div>
                              <video
                                src={fixImageUrl(review.video_path)}
                                controls
                                className="w-full max-w-md rounded-lg border-2 border-[#d5bfae]"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {reviews.length > 3 && (
                      <div className="text-center py-3">
                        <p className="text-sm text-[#7b5a3b]">
                          Showing 3 of {reviews.length} reviews. Scroll to see more.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="p-6 bg-[#f5f0eb] rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4">
                      <Star className="h-12 w-12 text-[#a4785a]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#5c3d28] mb-2">No Reviews Yet</h3>
                    <p className="text-[#7b5a3b] text-lg">
                      Be the first to review this product and help other customers!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>

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
                  navigate("/login");
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
                  navigate("/login");
                }}
                className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold transition-all duration-200"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      <RelatedProductsSection productId={id} />

      {/* Message Seller Popup */}
      {showMessageSeller && product && (
        <MessengerPopup
          isOpen={showMessageSeller}
          onClose={() => setShowMessageSeller(false)}
          sellerId={product.seller?.sellerID || product.seller?.id || product.seller_id}
          sellerUserId={product.seller?.user_id || product.seller?.user?.userID}
          sellerName={product.seller?.store?.store_name || product.seller?.businessName || product.seller?.user?.userName || 'Seller'}
          sellerAvatar={product.seller?.store?.logo_url || product.seller?.logo_url}
          productInfo={{
            productName: product.productName,
            productPrice: product.productPrice,
            productImage: fixImageUrl(product.productImage),
            productId: product.id
          }}
          initialMessage={
            product
              ? `Hello! I'm interested in customizing the product "${product.productName}${
                  selectedVariationPayload ? ` - ${selectedVariationPayload.label}` : ""
                }". Could you please provide more details about customization options?`
              : null
          }
          defaultMessageType="product_customize"
        />
      )}
    </div>
  );
};

export default ProductDetails;
