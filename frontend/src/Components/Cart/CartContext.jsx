import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useUser } from "../Context/UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, isAuthenticated } = useUser();
  const addToCartTimeoutRef = useRef(null);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      console.log("No token found or user not authenticated, clearing cart");
      setCartItems([]);
      return;
    }

    try {
      console.log("Fetching cart...");
      const response = await fetch("http://localhost:8000/api/cart", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log("Cart response status:", response.status);
      
      if (response.status === 401) {
        console.warn('User not authenticated, clearing token and redirecting to login');
        localStorage.removeItem('token');
        setCartItems([]);
        // Redirect to login page
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        let errorMessage = 'Failed to fetch cart';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
          console.error("Error details:", errorData);
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        setCartItems([]);
        return;
      }

      const responseData = await response.json();
      console.log("Cart data received:", responseData);
      
     
      let cartData = responseData;
      if (Array.isArray(responseData)) {
        cartData = responseData;
      } else if (Array.isArray(responseData.data)) {
        cartData = responseData.data;
      } else if (responseData.items) {
        cartData = responseData.items;
      }
      
      if (!Array.isArray(cartData)) {
        console.error("Expected array but got:", typeof cartData, cartData);
        setCartItems([]);
        return;
      }

      // Transform backend response to frontend cart item structure
      const formattedCart = cartData.map(item => {
        try {
          if (!item) return null;
          
          console.log("Processing cart item:", item);
          
         
          const product = item.product || item;
          const cartItemId = item.cart_id || item.id || `temp-${Math.random().toString(36).substr(2, 9)}`;
          const productId = item.product_id || (product ? product.product_id || product.id : null);
          
          if (!productId) {
            console.warn("Invalid cart item - missing product ID:", item);
            return null;
          }
          
          const productName = product.productName || product.name || 'Unknown Product';
          const productImage = product.productImage || product.image || '';
          const price = parseFloat(item.price || product.price || product.productPrice || 0);
          const quantity = parseInt(item.quantity || 1, 10);
          const sellerName = item.product?.seller_name || 
                           (product.seller && (product.seller.businessName || 
                           (product.seller.user && product.seller.user.userName))) || 
                           'Unknown Seller';
          
          return {
            id: cartItemId,
            cartItemId: cartItemId,
            product_id: productId,
            title: productName,
            image: productImage,
            price: price,
            quantity: quantity,
            total_price: price * quantity,
            artisanName: sellerName,
            seller_name: sellerName,
            product: product // Keep full product data
          };
        } catch (error) {
          console.error("Error processing cart item:", error, item);
          return null;
        }
      }).filter(Boolean); // Remove any null items
      
      console.log("Formatted cart items:", formattedCart);
      setCartItems(formattedCart);
      
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
    }
  };

  // Fetch cart when user authentication state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  // Add product to cart with debounce
  const addToCart = async (product, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      const errorMsg = "Please log in to add items to your cart.";
      console.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Clear any existing timeout
    if (addToCartTimeoutRef.current) {
      clearTimeout(addToCartTimeoutRef.current);
    }

    // Return a promise that resolves after a short delay to prevent rapid calls
    return new Promise((resolve) => {
      addToCartTimeoutRef.current = setTimeout(async () => {
        try {
          // Ensure we have a valid product with an ID
          const productId = product.product_id || product.id;
          if (!productId) {
            const errorMsg = 'Invalid product: missing product ID';
            console.error(errorMsg, product);
            resolve({ success: false, error: errorMsg });
            return;
          }
          
          // Ensure quantity is a positive number
          const qty = Math.max(1, parseInt(quantity, 10) || 1);
          
          console.log('Adding to cart:', { product_id: productId, quantity: qty });
          
          // Check if item already exists in cart
          const existingItem = cartItems.find(item => item.product_id === productId);
          if (existingItem) {
            // Update quantity instead of adding new item
            const result = await updateQuantity(productId, existingItem.quantity + qty);
            resolve(result);
            return;
          }
          
          const response = await fetch("http://localhost:8000/api/cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
              "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({
              product_id: Number(productId),
              quantity: qty
            }),
            credentials: 'include'
          });

          let responseData;
          try {
            responseData = await response.json();
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
            responseData = {};
          }
          
          console.log('Cart API Response:', { 
            status: response.status, 
            statusText: response.statusText,
            data: responseData 
          });

          if (!response.ok) {
            const errorMessage = responseData.message || `Failed to add to cart (${response.status})`;
            console.error('Failed to add to cart:', errorMessage);
            resolve({ success: false, error: errorMessage });
            return;
          }

          console.log('Successfully added to cart:', responseData);
          
          // Refresh the cart to show updated items
          await fetchCart();
          
          resolve({ success: true, data: responseData });
        } catch (error) {
          console.error("Error adding to cart:", error);
          resolve({ success: false, error: error.message || 'Failed to add to cart' });
        }
      }, 300); // 300ms debounce delay
    });
  };

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    const item = cartItems.find(i => i.product_id === productId);
    if (!token || !isAuthenticated || !item || !item.cartItemId) {
      console.error('Missing required data for update:', { token, isAuthenticated, item, productId });
      return;
    }

    if (quantity <= 0) {
      await removeItem(item.cartItemId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/cart/update/${item.cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ quantity: Number(quantity) })
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMessage = responseData.message || 'Failed to update quantity';
        throw new Error(errorMessage);
      }

      // Refresh the cart to ensure consistency
      await fetchCart();
      return { success: true, data: responseData };
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.message || 'Failed to update quantity');
      return { success: false, error: error.message };
    }
  };

  const removeItem = async (cartId) => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated || !cartId) {
      console.error('Missing token, authentication, or cart ID:', { token, isAuthenticated, cartId });
      return { success: false, error: 'Missing required data' };
    }

    try {
      console.log('Removing item from cart:', cartId);
      const response = await fetch(`http://localhost:8000/api/cart/remove/${cartId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response:', e, 'Response:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Failed to remove item:', response.status, responseData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return { 
            success: false, 
            error: 'Your session has expired. Please log in again.',
            requiresLogin: true
          };
        }
        
        throw new Error(responseData.message || `Failed to remove item (${response.status})`);
      }

      console.log('Item removed successfully:', responseData);
      
      // Update local cart state
      setCartItems(prevItems => prevItems.filter(item => {
        // Check both cartItemId and id for backward compatibility
        const shouldKeep = item.cartItemId !== cartId && item.id !== cartId;
        if (!shouldKeep) {
          console.log('Removing item from local state:', item);
        }
        return shouldKeep;
      }));
      
      // Show success message
      alert('Item removed from cart');
      
      return { 
        success: true, 
        message: 'Item removed from cart',
        data: responseData
      };
    } catch (error) {
      console.error('Error removing item from cart:', error);
      
      // Show error message
      alert(error.message || 'Failed to remove item from cart');
      
      return {
        success: false,
        error: error.message || 'Failed to remove item from cart'
      };
    }
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      const errorMsg = "Please log in to proceed to checkout.";
      console.warn(errorMsg);
      return { success: false, error: errorMsg, requiresLogin: true };
    }

    try {
      console.log('Initiating checkout...');
      const response = await fetch("http://localhost:8000/api/cart/checkout", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse checkout response:', e, 'Response:', responseText);
        throw new Error('Invalid response from server during checkout');
      }

      if (!response.ok) {
        console.error('Checkout failed:', response.status, responseData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return { 
            success: false, 
            error: 'Your session has expired. Please log in again.',
            requiresLogin: true
          };
        }
        
        throw new Error(responseData.message || `Checkout failed (${response.status})`);
      }

      console.log('Checkout successful:', responseData);
      
      // Clear the cart after successful checkout
      setCartItems([]);
      
      // Show success message
      alert('Order placed successfully!');

      return {
        success: true,
        order: responseData.order || responseData,
        message: responseData.message || "Order placed successfully!",
        data: responseData
      };
    } catch (error) {
      console.error("Error during checkout:", error);
      
      // Show error message
      alert(error.message || 'An error occurred during checkout');
      
      return {
        success: false,
        error: error.message || "An error occurred during checkout"
      };
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      console.log("No token found or user not authenticated");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart.");
      }
      
      // Clear local cart state
      setCartItems([]);
      console.log("Cart cleared successfully");
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
