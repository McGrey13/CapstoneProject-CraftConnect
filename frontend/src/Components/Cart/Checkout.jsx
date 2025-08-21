import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], subtotal = 0, shipping = 0, tax = 0, total = 0 } =
    location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "credit",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    alert(`Order placed for ${formData.name}!\nThank you for shopping with us.`);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[#4b3832] mb-6">Checkout</h1>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#7a5c52]">Order Summary</h2>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <span>
                  {item.title} x {item.quantity}
                </span>
                <span>₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-sm">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>₱{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#7a5c52]">Shipping Information</h2>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#7a5c52]">Payment Method</h2>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="credit">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </CardContent>
        </Card>

        <Button
          className="w-full py-3 rounded-full font-bold"
          style={{
            background: "linear-gradient(90deg, #a36b4f, #e6b17e)",
            color: "white",
          }}
          onClick={handlePlaceOrder}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
