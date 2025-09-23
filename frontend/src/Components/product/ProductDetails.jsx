import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Play, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
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

      const reviewsRes = await fetch(`http://localhost:8000/api/products/${id}/reviews`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
        } else {
          setAverageRating(0);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductAndReviews();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!product) return <div className="text-center p-10">Product not found.</div>;

  const isFavorited = favorites.some((p) => p.id === product.id);

  const handleQuantityChange = (change) => setQuantity(Math.max(1, quantity + change));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("auth_token");
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

  const renderStars = (rating, interactive = false, onStarClick = () => {}) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${interactive ? "cursor-pointer" : ""}`}
        onClick={() => interactive && onStarClick(i + 1)}
      />
    ));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="w-full md:w-2/3">
            <div className="relative">
              <Card className="overflow-hidden aspect-square flex items-center justify-center">
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
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {allMedia.map((media, idx) => (
                <div
                  key={`media-${idx}`}
                  className={`w-20 h-20 overflow-hidden rounded-md cursor-pointer border-2 ${
                    selectedMedia.src === media.src ? "border-primary" : "border-transparent"
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Play className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 flex flex-col">
          <h1 className="text-3xl font-bold">{product.productName}</h1>
          <p className="text-gray-600 text-sm">
            by {product.seller?.store?.store_name || product.seller?.businessName || product.seller?.user?.userName || "Unknown Artisan"}
          </p>

          <div className="flex items-center gap-2">
            {renderStars(averageRating)}
            <span className="text-gray-500 text-sm">
              {averageRating.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>

          <p className="text-2xl font-bold text-gray-800">
            ₱{Number(product.productPrice).toFixed(2)}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold">{quantity}</span>
            <Button onClick={() => handleQuantityChange(1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              disabled={addingToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
            <Button variant="outline" onClick={handleFavoriteClick}>
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? "text-red-500 fill-current" : ""
                }`}
              />
            </Button>
          </div>

          {/* Message Seller Button */}
          <div className="mt-3">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center"
              onClick={() => navigate("/messages")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Got questions about this item? Message Seller
            </Button>
          </div>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p>{product.productDescription}</p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-6">
              <div>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="font-semibold">
                          {review.user?.userName || "Anonymous"}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
