import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PALETTE = {
  sand: "#e5ded7",
  warmText: "#7a5c52",
  brown: "#a36b4f",
  gold: "#e6b17e",
};

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeItem, checkout } = useCart();
  const navigate = useNavigate();

  // Helper function to safely parse the price string into a number
  const parsePrice = (priceString) => {
    if (typeof priceString === 'string') {
      // Remove the currency symbol and commas, then parse as a float
      return parseFloat(priceString.replace("₱", "").replace(/,/g, "")) || 0;
    }
    return priceString 
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.price || item.total_price || 0) * (item.quantity || 1)),
    0
  );
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Proceed to checkout with cart data
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Navigate to checkout page with cart data
    navigate('/checkout', {
      state: {
        cartItems,
        subtotal,
        shipping,
        tax,
        total
      }
    });
  };

  // Go back to products page
  const handleContinueShopping = () => {
    navigate("/products"); // change to your route for product listing
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center text-[#4b3832]">
            <ShoppingBag className="mr-3 h-8 w-8" />
            Shopping Cart
          </h1>
          <p className="text-[#7a5c52]">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some beautiful handcrafted items to get started!
            </p>
            <Button size="lg" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-[#e5ded7]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image ? 
                            (item.image.startsWith('http') ? item.image : `http://localhost:8000/storage/${item.image}`) 
                            : '/placeholder-product.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg border border-[#e5ded7]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-[#4b3832] mb-1">
                          {item.title || 'Product Name Not Available'}
                        </h3>
                        {item.seller_name && (
                          <p className="text-[#7a5c52] text-sm mb-2">
                            Seller: {item.seller_name}
                          </p>
                        )}
                        <div className="flex flex-col">
                          <p className="font-bold text-lg text-[#a36b4f]">
                            ₱{parseFloat(item.price || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₱{parseFloat(item.price || 0).toFixed(2)} = ₱{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeItem(item.cartItemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-2xl p-6 shadow-sm sticky top-6"
                style={{ border: `1px solid ${PALETTE.sand}` }}
              >
                <h4
                  className="text-lg mb-4 font-semibold"
                  style={{ color: PALETTE.warmText }}
                >
                  Order summary
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? `₱${shipping.toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>₱{tax.toFixed(2)}</span>
                  </div>

                  <div
                    className="border-t pt-4"
                    style={{ borderColor: PALETTE.sand }}
                  >
                    <div className="flex justify-between items-baseline">
                      <span
                        className="text-base font-semibold"
                        style={{ color: PALETTE.warmText }}
                      >
                        Total
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: PALETTE.gold }}
                      >
                        ₱{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full py-3 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${PALETTE.brown}, ${PALETTE.gold})`,
                      color: "white",
                      fontWeight: 700,
                    }}
                    onClick={handleProceedToCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to checkout'
                    )}
                  </Button>

                  <Button
                    className="w-full py-2 rounded-full"
                    variant="outline"
                    style={{
                      borderColor: PALETTE.sand,
                      color: PALETTE.warmText,
                      background: "white",
                    }}
                    onClick={handleContinueShopping}
                  >
                    Continue shopping
                  </Button>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  Secure checkout · Free returns within 14 days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
