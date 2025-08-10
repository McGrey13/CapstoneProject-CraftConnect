import React, { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

// Define your color palette here
const PALETTE = {
  sand: "#e5ded7",
  warmText: "#7a5c52",
  brown: "#a36b4f",
  gold: "#e6b17e",
};

const FONT_FAMILY = '"Inter", sans-serif'; // Use your preferred font

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=300&q=80",
      title: "Handcrafted Ceramic Mug",
      price: 24.99,
      artisanName: "Sarah Pottery",
      quantity: 2,
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1603031612556-9f3e239d5a76?w=300&q=80",
      title: "Woven Basket Set",
      price: 49.99,
      artisanName: "Weaving Wonders",
      quantity: 1,
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=300&q=80",
      title: "Handmade Leather Journal",
      price: 35.5,
      artisanName: "Leather Craft Co.",
      quantity: 1,
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#fdf8f4]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center text-[#4b3832]">
            <ShoppingBag className="mr-3 h-8 w-8" />
            Shopping Cart
          </h1>
          <p className="text-[#7a5c52]">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
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
            <Button size="lg">Continue Shopping</Button>
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
                          ${item.price.toFixed(2)}
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
                  style={{
                    color: PALETTE.warmText,
                  }}
                >
                  Order summary
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ${shipping.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated tax</span>
                    <span style={{ color: PALETTE.warmText }}>
                      ${tax.toFixed(2)}
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
                        ${total.toFixed(2)}
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
                    onClick={() => alert("Proceed to checkout (placeholder)")}
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