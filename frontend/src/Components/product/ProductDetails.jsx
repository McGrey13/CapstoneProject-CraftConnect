import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Play, MessageCircle, ChevronLeft, ChevronRight, Users, Calendar, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useCart } from "../Cart/CartContext";
import { useFavorites } from "../favorites/FavoritesContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

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

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const productRes = await fetch(`http://localhost:8000/api/products/${id}`);
      if (!productRes.ok) {
        if (productRes.status === 404) throw new Error("Product not found");
        throw new Error(`Failed to fetch product: ${productRes.status}`);
      }
      const productData = await productRes.json();
      setProduct(productData);
      
      // Process all images (main + additional)
      const images = [];
      if (productData.productImage) {
        images.push(productData.productImage);
      }
      if (productData.productImages && Array.isArray(productData.productImages)) {
        productData.productImages.forEach(img => {
          if (img && !images.includes(img)) {
            images.push(img);
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
        media.push({ type: "video", src: productData.productVideo });
      }
      
      setAllMedia(media);
      setCurrentImageIndex(0);
      setCurrentMediaIndex(0);
      setSelectedMedia(media[0] || { type: "image", src: productData.productImage });

      // Reviews and ratings are now included in the product data
      console.log('📝 Product data with reviews:', productData);
      
      if (productData.reviews && Array.isArray(productData.reviews)) {
        setReviews(productData.reviews);
        console.log(`📝 Found ${productData.reviews.length} reviews in product data`);
      } else {
        setReviews([]);
        console.log('📝 No reviews found in product data');
      }
      
      // Use the average rating from the backend or calculate it
      if (productData.average_rating !== undefined) {
        setAverageRating(productData.average_rating);
        console.log(`⭐ Using backend average rating: ${productData.average_rating}`);
      } else if (productData.reviews && productData.reviews.length > 0) {
        const totalRating = productData.reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const calculatedAverage = totalRating / productData.reviews.length;
        setAverageRating(calculatedAverage);
        console.log(`⭐ Calculated average rating: ${calculatedAverage.toFixed(2)} from ${productData.reviews.length} reviews`);
      } else {
        setAverageRating(0);
        console.log('⭐ No reviews found, setting average to 0');
      }
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

  const handleQuantityChange = (change) => setQuantity(Math.max(1, quantity + change));

  const handleAddToCart = async () => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const result = await addToCart(product, quantity);
      if (result.success) {
        alert("Item added to cart successfully!");
        navigate("/cart");
      } else {
        alert(result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFavoriteClick = () => {
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

  const getRatingText = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Fair";
    return "Poor";
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

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
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
        <div className="space-y-6 flex flex-col">
          <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold text-[#5c3d28] mb-3">{product.productName}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-[#a4785a]" />
                <p className="text-[#7b5a3b] text-lg font-medium">
                  by {product.seller?.store?.store_name || product.seller?.businessName || product.seller?.user?.userName || "Unknown Artisan"}
                </p>
              </div>

              {/* Enhanced Rating Section */}
              <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] p-6 rounded-xl border-2 border-[#d5bfae] mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {renderStars(averageRating, false, () => {}, "w-6 h-6")}
                    <span className="text-2xl font-bold text-[#5c3d28]">
                      {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <Badge className="bg-[#a4785a] text-white px-3 py-1 text-sm font-semibold">
                    {getRatingText(averageRating)}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#7b5a3b]">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-4xl font-bold text-[#5c3d28] mb-6">
                ₱{Number(product.productPrice).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Actions */}
          <Card className="bg-white border-2 border-[#d5bfae] shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
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
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={addingToCart}
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  {addingToCart ? "Adding to Cart..." : "Add to Cart"}
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleFavoriteClick}
                    className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        isFavorited ? "text-red-500 fill-current" : ""
                      }`}
                    />
                    {isFavorited ? "Favorited" : "Add to Favorites"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate("/messages")}
                    className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Message Seller
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="bg-white border-2 border-[#d5bfae] shadow-lg">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white text-[#5c3d28] font-semibold"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white text-[#5c3d28] font-semibold"
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
            
            <TabsContent value="reviews" className="mt-6 space-y-6">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.review_id || review.id} className="bg-white border-2 border-[#d5bfae] shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {(review.user?.userName || "A").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-[#5c3d28] text-lg">
                                {review.user?.userName || "Anonymous"}
                              </h4>
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating, false, () => {}, "w-4 h-4")}
                                <span className="text-sm text-[#7b5a3b]">
                                  {new Date(review.review_date || review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-[#a4785a] text-white">
                            {review.rating} Star{review.rating !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {review.comment && (
                          <p className="text-[#7b5a3b] text-base leading-relaxed pl-15">
                            "{review.comment}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
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
  );
};

export default ProductDetails;
