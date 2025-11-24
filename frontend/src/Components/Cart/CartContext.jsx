import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useUser } from "../Context/UserContext";
import api, { getToken } from "../../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, isAuthenticated } = useUser();
  const addToCartTimeoutRef = useRef(null);

  const fetchCart = async () => {
    if (!isAuthenticated || (user?.role && user.role !== 'customer')) {
      console.log("Cart disabled for current user, clearing cart", { isAuthenticated, role: user?.role });
      setCartItems([]);
      return;
    }

    try {
      console.log("Fetching cart...", { token: getToken() });
      
      // Add retry logic for timeout errors
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const response = await api.get('/cart');
          console.log("Cart response:", response.data);
          
          const responseData = response.data;
          console.log("Cart data received:", responseData);
          
          // Check if response is HTML error (backend error page)
          if (typeof responseData === 'string' && (responseData.includes('<html') || responseData.includes('<br />') || responseData.includes('Fatal error'))) {
            console.error("⚠️ Backend returned HTML error instead of JSON. Is Laravel backend running?");
            setCartItems([]);
            return;
          }
          
          let cartData = responseData;
          if (Array.isArray(responseData)) {
            cartData = responseData;
          } else if (responseData && Array.isArray(responseData.data)) {
            cartData = responseData.data;
          } else if (responseData && responseData.items) {
            cartData = responseData.items;
          }
          
          if (!Array.isArray(cartData)) {
            console.error("Expected array but got:", typeof cartData, cartData);
            setCartItems([]);
            return;
          }

          // Transform backend response to frontend cart item structure
          const formattedCart = cartData.map(rawItem => {
            try {
              if (!rawItem) return null;

              const cartId = rawItem.cart_id ?? rawItem.cartItemId ?? rawItem.id ?? `temp-${Math.random().toString(36).slice(2)}`;
              const productData = rawItem.product ?? rawItem.productData ?? rawItem;
              const productId = rawItem.product_id ?? productData.product_id ?? productData.id;

              if (!productId) {
                console.warn("Invalid cart item - missing product ID:", rawItem);
                return null;
              }

              const quantity = parseInt(rawItem.quantity ?? rawItem.qty ?? 1, 10);
              const sellerName =
                rawItem.seller_name ??
                productData.seller_name ??
                productData.seller?.businessName ??
                productData.seller?.user?.userName ??
                "Unknown Seller";

              const normalizeAttributes = (attributes) => {
                if (!attributes) return [];
                if (typeof attributes === "string") {
                  try {
                    const parsed = JSON.parse(attributes);
                    attributes = parsed;
                  } catch {
                    return [];
                  }
                }
                if (Array.isArray(attributes)) {
                  return attributes
                    .map((attr, index) => {
                      if (typeof attr === "string") {
                        return { id: `attr-${index}`, label: attr, value: attr };
                      }
                      if (attr && typeof attr === "object") {
                        return {
                          id: attr.id ?? `attr-${index}`,
                          label: attr.label ?? attr.name ?? `Option ${index + 1}`,
                          value: attr.value ?? attr.label ?? attr.name ?? "",
                        };
                      }
                      return null;
                    })
                    .filter(Boolean);
                }
                if (attributes && typeof attributes === "object") {
                  return Object.entries(attributes).map(([key, value], index) => ({
                    id: `attr-${index}`,
                    label: key,
                    value,
                  }));
                }
                return [];
              };

              const variationId =
                rawItem.variation_id ??
                rawItem.selectedVariation?.id ??
                productData.variation_id ??
                null;
              const variationLabel =
                rawItem.variation_label ??
                rawItem.selectedVariation?.label ??
                productData.variation_label ??
                null;
              const variationAttributes =
                rawItem.variation_attributes ??
                rawItem.selectedVariation?.attributes ??
                productData.variation_attributes ??
                null;
              const variationQuantity =
                rawItem.available_quantity ??
                rawItem.selectedVariation?.quantity ??
                productData.available_quantity ??
                null;
              const variationPrice =
                rawItem.unit_price ??
                rawItem.selectedVariation?.price ??
                rawItem.price ??
                productData.price ??
                productData.productPrice ??
                0;
              const sku =
                rawItem.sku ??
                rawItem.selectedVariation?.sku ??
                productData.sku ??
                null;

              const variationData =
                variationId ||
                variationLabel ||
                sku ||
                variationAttributes
                  ? {
                      id: variationId,
                      label: variationLabel,
                      price: Number(variationPrice) || 0,
                      quantity:
                        variationQuantity !== null && variationQuantity !== undefined
                          ? Number(variationQuantity)
                          : null,
                      sku: sku,
                      attributes: normalizeAttributes(variationAttributes),
                    }
                  : null;

              const unitPrice = Number(
                rawItem.unit_price ??
                  (variationData ? variationData.price : rawItem.price ?? productData.price ?? productData.productPrice ?? 0)
              ) || 0;

              const availableQuantity =
                variationData?.quantity ??
                Number(productData.productQuantity ?? productData.available_quantity ?? 0);

              const imageSource =
                rawItem.image ??
                productData.productImage ??
                productData.image ??
                null;

              return {
                id: cartId,
                cartItemId: cartId,
                product_id: productId,
                title: rawItem.title ?? productData.productName ?? productData.name ?? "Unknown Product",
                image: imageSource,
                price: unitPrice,
                quantity,
                availableQuantity,
                isOutOfStock: availableQuantity <= 0,
                total_price: unitPrice * quantity,
                artisanName: sellerName,
                seller_name: sellerName,
                selectedVariation: variationData,
                sku,
                unit_price: unitPrice,
                product: {
                  ...productData,
                  productQuantity: availableQuantity,
                  seller_name: sellerName,
                },
              };
            } catch (error) {
              console.error("Error processing cart item:", error, rawItem);
              return null;
            }
          }).filter(Boolean);
          
          console.log("Formatted cart items:", formattedCart);
          setCartItems(formattedCart);
          return; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          
          // Check if it's an HTML error from backend
          if (error.isHtmlError || (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<html'))) {
            console.error('⚠️ Backend server error detected. Please ensure Laravel backend is running on http://localhost:8000');
            console.error('Error details:', error.message);
            setCartItems([]);
            return; // Don't retry for backend errors
          }
          
          console.error(`Error fetching cart (${4-retries}/3):`, error);
          
          if (error.code === 'ECONNABORTED' && retries > 1) {
            // Timeout error, wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            break; // Other errors, don't retry
          }
        }
      }
      
      // If we get here, all retries failed
      console.error("All retries failed for cart:", lastError);
      setCartItems([]);
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
    if (!isAuthenticated || (user?.role && user.role !== 'customer')) {
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
          const selectedVariation = product.selectedVariation || null;
          
          console.log('Adding to cart:', { product_id: productId, quantity: qty });
          
          // Check if item already exists in cart
          const existingItem = cartItems.find(item => {
            const sameProduct = item.product_id === productId;
            const currentVariationId = item.selectedVariation?.id ?? item.variation_id ?? null;
            const newVariationId = selectedVariation?.id ?? null;
            return sameProduct && currentVariationId === newVariationId;
          });
          if (existingItem) {
            // Update quantity instead of adding new item
            const result = await updateQuantity(existingItem.cartItemId, existingItem.quantity + qty);
            resolve(result);
            return;
          }

          const payload = {
            product_id: Number(productId),
            quantity: qty,
          };

          if (selectedVariation) {
            if (selectedVariation.id !== undefined && selectedVariation.id !== null) {
              payload.variation_id = selectedVariation.id;
            }
            if (selectedVariation.label) {
              payload.variation_label = selectedVariation.label;
            }
            if (selectedVariation.attributes) {
              payload.variation_attributes = selectedVariation.attributes;
            }
            if (selectedVariation.sku) {
              payload.sku = selectedVariation.sku;
            }
            if (selectedVariation.price !== undefined && selectedVariation.price !== null) {
              payload.unit_price = selectedVariation.price;
            }
          } else if (product.productPrice !== undefined && product.productPrice !== null) {
            payload.unit_price = Number(product.productPrice);
          }

          const response = await api.post('/cart/add', payload);

          console.log('Cart API Response:', response.data);
          
          console.log('Successfully added to cart:', response.data);
          
          // Refresh the cart to show updated items
          await fetchCart();
          
          resolve({ success: true, data: response.data });
        } catch (error) {
          console.error("Error adding to cart:", error);
          resolve({ success: false, error: error.message || 'Failed to add to cart' });
        }
      }, 300); // 300ms debounce delay
    });
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId || i.cart_id === cartItemId);
    if (!isAuthenticated || (user?.role && user.role !== 'customer') || !item || !item.cartItemId) {
      console.error('Missing required data for update:', { isAuthenticated, item, cartItemId });
      return;
    }

    if (quantity <= 0) {
      await removeItem(item.cartItemId);
      return;
    }

    try {
      const response = await api.put(`/cart/update/${item.cartItemId}`, {
        quantity: Number(quantity)
      });

      // Refresh the cart to ensure consistency
      await fetchCart();
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.message || 'Failed to update quantity');
      return { success: false, error: error.message };
    }
  };

  const removeItem = async (cartId) => {
    if (!isAuthenticated || (user?.role && user.role !== 'customer') || !cartId) {
      console.error('Missing authentication or cart ID:', { isAuthenticated, cartId });
      return { success: false, error: 'Missing required data' };
    }

    try {
      console.log('Removing item from cart:', cartId);
      const response = await api.delete(`/cart/remove/${cartId}`);

      console.log('Item removed successfully:', response.data);
      
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
        data: response.data
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

  const checkout = async (paymentMethod = 'cod', selectedCartItems = null, discountCode = null) => {
    if (!isAuthenticated || (user?.role && user.role !== 'customer')) {
      const errorMsg = "Please log in to proceed to checkout.";
      console.warn(errorMsg);
      return { success: false, error: errorMsg, requiresLogin: true };
    }

    try {
      // Refresh cart data before checkout to get latest stock levels
      console.log('Refreshing cart before checkout...');
      
      // Fetch fresh cart data directly
      const cartResponse = await api.get('/cart');
      const responseData = cartResponse.data;
      let freshCartData = responseData;
      if (Array.isArray(responseData)) {
        freshCartData = responseData;
      } else if (Array.isArray(responseData.data)) {
        freshCartData = responseData.data;
      } else if (responseData.items) {
        freshCartData = responseData.items;
      }
      
      // Format fresh cart data
      const normalizeVariationAttributes = (attributes) => {
        if (!attributes) return [];
        let resolved = attributes;
        if (typeof resolved === 'string') {
          try {
            resolved = JSON.parse(resolved);
          } catch {
            return [];
          }
        }
        if (Array.isArray(resolved)) {
          return resolved
            .map((attr, index) => {
              if (typeof attr === 'string') {
                return { id: `attr-${index}`, label: attr, value: attr };
              }
              if (attr && typeof attr === 'object') {
                return {
                  id: attr.id ?? `attr-${index}`,
                  label: attr.label ?? attr.name ?? `Option ${index + 1}`,
                  value: attr.value ?? attr.label ?? attr.name ?? '',
                };
              }
              return null;
            })
            .filter(Boolean);
        }
        if (resolved && typeof resolved === 'object') {
          return Object.entries(resolved).map(([key, value], index) => ({
            id: `attr-${index}`,
            label: key,
            value,
          }));
        }
        return [];
      };

      const currentCart = freshCartData.map(item => {
        const product = item.product || item;
        const price = Number(
          item.unit_price ??
            item.price ??
            product.price ??
            product.productPrice ??
            0
        );

        const variationAttributes = normalizeVariationAttributes(
          (item.selectedVariation && item.selectedVariation.attributes) ||
            item.variation_attributes ||
            product.variation_attributes ||
            null
        );

        const variationId = item.selectedVariation?.id ?? item.variation_id ?? null;
        const variationLabel =
          item.selectedVariation?.label ?? item.variation_label ?? item.size ?? null;
        const variationSku =
          item.selectedVariation?.sku ?? item.sku ?? product.sku ?? null;
        const variationQuantityRaw =
          item.selectedVariation?.quantity ??
          item.available_quantity ??
          product.available_quantity ??
          product.productQuantity ??
          null;

        const normalizedVariation =
          variationId ||
          variationLabel ||
          variationSku ||
          variationAttributes.length
            ? {
                id: variationId,
                label: variationLabel,
                price,
                quantity:
                  variationQuantityRaw !== null && variationQuantityRaw !== undefined
                    ? Number(variationQuantityRaw)
                    : null,
                sku: variationSku,
                attributes: variationAttributes,
              }
            : null;

        const availableQuantity =
          normalizedVariation?.quantity ??
          Number(product.productQuantity ?? 0);

        return {
          cartItemId: item.cart_id || item.id,
          product_id: item.product_id,
          title: product.productName || 'Unknown Product',
          quantity: parseInt(item.quantity || 1, 10),
          availableQuantity: Number(
            availableQuantity !== null && availableQuantity !== undefined
              ? availableQuantity
              : 0
          ),
          isOutOfStock:
            Number(
              availableQuantity !== null && availableQuantity !== undefined
                ? availableQuantity
                : 0
            ) <= 0,
          price,
          selectedVariation: normalizedVariation,
        };
      });
      
      // If selectedCartItems provided, filter to only those items
      const itemsToCheckout = selectedCartItems && selectedCartItems.length > 0 
        ? currentCart.filter(item => selectedCartItems.some(selected => selected.cartItemId === item.cartItemId))
        : currentCart;
      
      console.log('Items to checkout:', itemsToCheckout.length, 'out of', currentCart.length);
      console.log('Selected items for checkout:', itemsToCheckout);
      
      // Validate ONLY the items being checked out (not all cart items)
      const outOfStockItems = itemsToCheckout.filter(item => item.isOutOfStock || item.availableQuantity === 0);
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.title).join(', ');
        const errorMsg = `Cannot checkout: The following item(s) are out of stock: ${itemNames}. Please remove them from your cart.`;
        console.error('Out of stock items:', outOfStockItems);
        alert(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      const insufficientStockItems = itemsToCheckout.filter(item => 
        item.quantity > item.availableQuantity && item.availableQuantity > 0
      );
      if (insufficientStockItems.length > 0) {
        const itemDetails = insufficientStockItems.map(item => 
          `${item.title} (requested: ${item.quantity}, available: ${item.availableQuantity})`
        ).join(', ');
        const errorMsg = `Cannot checkout: Insufficient stock for: ${itemDetails}. Please adjust quantities.`;
        console.error('Insufficient stock items:', insufficientStockItems);
        alert(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('Initiating checkout with payment method:', paymentMethod);
      
      // Prepare checkout data
      const checkoutData = {
        payment_method: paymentMethod
      };
      
      // Add discount code if provided
      if (discountCode && discountCode.code) {
        checkoutData.discount_code = discountCode.code;
        checkoutData.discount_id = discountCode.discountId || discountCode.id;
        console.log('Including discount code in checkout:', discountCode.code);
      }
      
      // Add selected cart item IDs if specific items were selected
      if (itemsToCheckout.length < currentCart.length) {
        checkoutData.selected_items = itemsToCheckout.map(item => item.cartItemId);
        console.log('Sending selected cart IDs:', checkoutData.selected_items);
      } else {
        console.log('Checking out all cart items (no specific selection)');
      }
      
      // First, create the order with payment method
      const orderResponse = await api.post("/cart/checkout", checkoutData);
      const orderData = orderResponse.data;

      console.log('Order created successfully:', orderData);
      
      // If payment method is GCash or PayMaya, use payment session
      if (paymentMethod === 'gcash' || paymentMethod === 'paymaya') {
        try {
          console.log(`Initiating ${paymentMethod} payment session...`);
          console.log('Order data:', orderData);
          console.log('Order data structure:', {
            hasOrder: !!orderData.order,
            orderTotalAmount: orderData.order?.totalAmount,
            directTotalAmount: orderData.totalAmount,
            directTotal: orderData.total,
            orderID: orderData.order?.orderID || orderData.orderID || orderData.id
          });
          
          const amount = orderData.order?.totalAmount || orderData.totalAmount || orderData.total || 0;
          const orderID = orderData.order?.orderID || orderData.orderID || orderData.id;
          
          if (amount < 100) {
            throw new Error(`Payment amount (${amount}) must be at least 100 PHP. Please add more items to your cart.`);
          }
          
          if (!orderID) {
            throw new Error('Order ID not found in response');
          }
          
          const sessionPayload = {
            amount: amount,
            payment_method: paymentMethod,
            orderID: orderID  // Include order ID so PayMongo metadata contains it
          };
          console.log('Payment session payload:', sessionPayload);
          console.log('OrderID being sent to PayMongo:', orderID);
          
          // Call the payment initiate endpoint (which handles PayMongo)
          const paymentSessionResponse = await api.post("/payments/initiate", sessionPayload);
          const paymentData = paymentSessionResponse.data;
          console.log('Payment session data:', paymentData);
            
            if (paymentData.success) {
              if (paymentData.checkout_url) {
                // Real PayMongo redirect
                console.log(`Redirecting to ${paymentMethod} PayMongo checkout:`, paymentData.checkout_url);
                
                // DON'T clear the cart yet - wait for payment success
                // The cart will be cleared by the backend after successful payment
                
                // Use a more reliable redirect method to PayMongo
                setTimeout(() => {
                  window.location.replace(paymentData.checkout_url);
                }, 100);
                
                return {
                  success: true,
                  message: `Redirecting to ${paymentMethod} payment via PayMongo...`,
                  redirect: true,
                  checkout_url: paymentData.checkout_url
                };
              } else if (paymentData.redirect_url) {
                // Simulation mode - redirect to orders page
                console.log(`Simulation mode - redirecting to orders:`, paymentData.redirect_url);
                
                // Clear cart for simulation mode
                setCartItems([]);
                
                // Redirect to orders page
                setTimeout(() => {
                  window.location.replace(paymentData.redirect_url);
                }, 100);
                
                return {
                  success: true,
                  message: `Payment processed successfully (simulation mode)`,
                  redirect: true,
                  checkout_url: paymentData.redirect_url
                };
              } else {
                console.error('No redirect URL provided:', paymentData);
                throw new Error('No redirect URL provided in payment response');
              }
            } else {
              console.error('Payment failed:', paymentData);
              throw new Error(paymentData.message || 'Payment failed');
            }
        } catch (paymentError) {
          console.error(`Error with ${paymentMethod} payment session:`, paymentError);
          
          // Payment failed - don't clear cart, show error
          return {
            success: false,
            error: paymentError.message || `Failed to process ${paymentMethod} payment`,
            requiresRetry: true
          };
        }
      }
      
      // For COD, clear the cart after successful checkout
      if (paymentMethod === 'cod') {
        setCartItems([]);
        alert('Order placed successfully!');
      }

      return {
        success: true,
        order: orderData.order || orderData,
        message: orderData.message || "Order placed successfully!",
        data: orderData
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
    if (!isAuthenticated || (user?.role && user.role !== 'customer')) {
      console.log("No token found or user not authenticated");
      return;
    }

    try {
      const response = await api.delete("/cart/clear");
      
      // Clear local cart state
      setCartItems([]);
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(error.message);
    }
  };

  // Clear cart after successful payment
  const clearCartAfterPayment = () => {
    setCartItems([]);
    console.log('Cart cleared after successful payment');
  };

  // Debug function to test payment methods
  const testPayment = async (paymentMethod) => {
    console.log(`🧪 Testing ${paymentMethod} payment...`);
    const result = await checkout(paymentMethod);
    console.log(`🧪 ${paymentMethod} result:`, result);
    return result;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,   // ✅ matches ShoppingCart
        clearCart,
        clearCartAfterPayment, // Clear cart after successful payment
        checkout,
        testPayment,  // Debug function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
