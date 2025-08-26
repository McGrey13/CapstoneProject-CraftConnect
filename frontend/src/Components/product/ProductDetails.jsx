import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Play } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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
  const [selectedMedia, setSelectedMedia] = useState({ type: 'image', src: null });


  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch product details
      const productRes = await fetch(`http://localhost:8000/api/products/${id}`);
      if (!productRes.ok) throw new Error("Product not found");
      const productData = await productRes.json();
      setProduct(productData);
      setSelectedMedia({ type: 'image', src: productData.productImage }); // Set default media

      // Fetch reviews
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
    if (id) {
      fetchProductAndReviews();
    }
  }, [id]);


  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center p-10">Product not found.</div>;
  }

  const isFavorited = favorites.some((p) => p.id === product.id);

  const handleQuantityChange = (change) => setQuantity(Math.max(1, quantity + change));
  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };
  const handleFavoriteClick = () => {
    isFavorited ? removeFavorite(product.id) : addFavorite(product);
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

  const productImages = [product.productImage, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center text-gray-700 hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="w-full md:w-2/3">
            <Card className="overflow-hidden aspect-square flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
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
            {/* Thumbnails */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {[product.productImage, ...product.additionalImages || []].map((img, idx) => (
                <div
                  key={`img-${idx}`}
                  className={`w-20 h-20 overflow-hidden rounded-md cursor-pointer border-2 ${selectedMedia.src === img ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedMedia({ type: 'image', src: img })}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {product.productVideo && (
                <div
                  className={`w-20 h-20 overflow-hidden rounded-md cursor-pointer border-2 ${selectedMedia.src === product.productVideo ? 'border-primary' : 'border-transparent'} flex items-center justify-center bg-gray-200`}
                  onClick={() => setSelectedMedia({ type: 'video', src: product.productVideo })}
                >
                  <Play className="h-8 w-8 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 flex flex-col">
          <h1 className="text-3xl font-bold">{product.productName}</h1>
          <p className="text-gray-600 text-sm">by {product.seller?.user?.userName || "Unknown Artisan"}</p>

          <div className="flex items-center gap-2">
            {renderStars(averageRating)}
            <span className="text-gray-500 text-sm">{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
          </div>

          <p className="text-2xl font-bold text-gray-800">₱{Number(product.productPrice).toFixed(2)}</p>

          <div className="flex items-center gap-3 mt-2">
            <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus className="w-4 h-4" /></Button>
            <span className="text-lg font-semibold">{quantity}</span>
            <Button onClick={() => handleQuantityChange(1)}><Plus className="w-4 h-4" /></Button>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleAddToCart} className="flex-1"><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</Button>
            <Button variant="outline" onClick={handleFavoriteClick}><Heart className={`w-5 h-5 ${isFavorited ? "text-red-500 fill-current" : ""}`} /></Button>
          </div>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4"><p>{product.productDescription}</p></TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-6">
              {/* Existing Reviews */}
              <div>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="font-semibold">{review.user?.userName || 'Anonymous'}</span>
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