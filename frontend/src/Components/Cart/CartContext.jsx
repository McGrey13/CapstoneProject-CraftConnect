import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend response to frontend cart item structure
        const formattedCart = data.map(item => ({
          ...item.product,
          quantity: item.quantity,
          cartItemId: item.id
        }));
        setCartItems(formattedCart);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add product to cart
  const addToCart = async (product, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart.");
      }

      // Refetch cart from backend to ensure sync
      await fetchCart();

    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    const item = cartItems.find(i => i.id === productId);
    if (!token || !item || !item.cartItemId) return;

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/cart/${item.cartItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity.");
      }
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.message);
    }
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem("token");
    const item = cartItems.find(i => i.id === productId);
    if (!token || !item || !item.cartItemId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/cart/${item.cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item.");
      }
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.message);
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/cart/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Checkout failed.");
      }
      await fetchCart(); // This will empty the cart
      return await response.json();
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(error.message);
      throw error;
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart.");
      }
      await fetchCart(); // This will set cartItems to []
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,   // ✅ matches ShoppingCart
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
