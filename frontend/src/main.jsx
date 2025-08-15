import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "./components/cart/CartContext";
import { FavoritesProvider } from "./components/favorites/FavoritesContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FavoritesProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </FavoritesProvider>
  </StrictMode>
);
