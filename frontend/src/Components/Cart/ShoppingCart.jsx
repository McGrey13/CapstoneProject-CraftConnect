import React from "react";
import { useCart } from "../cart/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom"; // <-- import navigation hook

const PALETTE = {
  sand: "#e5ded7",
  warmText: "#7a5c52",
  brown: "#a36b4f",
  gold: "#e6b17e",
};

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Proceed to checkout with cart data
  const handleProceedToCheckout = () => {
    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        shipping,
        tax,
        total,
      },
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
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg border border-[#e5ded7]"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-[#4b3832]">
                          {item.title}
                        </h3>
                        <p className="text-[#7a5c52] text-sm">
                          by {item.artisanName}
                        </p>
                        <p className="font-bold text-lg mt-1 text-[#a36b4f]">
                          ₱{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 rounded-full border-[#d8b48f]"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-[#4b3832]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 rounded-full border-[#d8b48f]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ₱{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ₱{shipping.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated tax</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ₱{tax.toFixed(2)}
                    </span>
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
                  >
                    Proceed to checkout
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
