import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockProducts } from "./ProductsPage"; // This import now works
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProducts.find((p) => p.id === id);
  if (!product) return <p className="text-center py-12">Product not found</p>;

  // check if product is favorited
  const isFavorited = favorites.some((p) => p.id === product.id);

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  const handleFavoriteClick = () => {
    if (isFavorited) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="flex items-center text-gray-700 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-lg overflow-hidden shadow">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-lg border-2 overflow-hidden ${selectedImage === i ? "border-blue-500" : "border-gray-200"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 flex flex-col">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-gray-600 text-sm">by {product.artisanName}</p>

          <div className="flex items-center gap-2">
            {renderStars(product.rating)}
            <span className="text-gray-500 text-sm">{product.rating}</span>
          </div>

          <p className="text-2xl font-bold text-gray-800">₱{product.price}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-2">
            <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="px-2 py-1">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg">{quantity}</span>
            <Button onClick={() => handleQuantityChange(1)} className="px-2 py-1">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleFavoriteClick}
              className="p-2"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "text-red-500 fill-current" : ""}`} />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="bg-gray-100 rounded-md p-1 flex gap-1">
              <TabsTrigger value="description" className="flex-1 text-center">Description</TabsTrigger>
              <TabsTrigger value="features" className="flex-1 text-center">Features</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 text-center">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent>{product.description}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-4">
              <Card>
                <CardContent>
                  <ul className="list-disc ml-5">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4 space-y-2">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{r.name}</span>
                        <div className="flex gap-1">{renderStars(r.rating)}</div>
                      </div>
                      <p className="text-gray-700 text-sm">{r.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center">No reviews yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;