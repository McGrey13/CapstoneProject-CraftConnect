import React, { useState, useEffect } from "react";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useNavigate } from "react-router-dom";

// --- ProductsPage Component ---
const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching products from API...");
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:8000/api/products/approved", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
          credentials: 'include',
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`Failed to load products. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched products:", data);
        
        // Handle both array and object responses
        const productsData = Array.isArray(data) ? data : (data.data || []);
        console.log("Number of products:", productsData.length);
        
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller?.user?.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Please make sure:</p>
            <ul className="list-disc list-inside">
              <li>The Laravel backend server is running on localhost:8000</li>
              <li>There are approved products in the database</li>
              <li>The database connection is working</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>

      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-4">
        <TabsList className="flex space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No products found.</p>
          <p className="text-sm text-gray-400">
            {products.length === 0 
              ? "No products available in the database." 
              : "No products match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="cursor-pointer bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-full h-40 bg-gray-100 rounded overflow-hidden">
                {product.productImage ? (
                  <img 
                    src={product.productImage} 
                    alt={product.productName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Image failed to load:", product.productImage);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", product.productImage);
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full flex items-center justify-center text-gray-400"
                  style={{ display: product.productImage ? 'none' : 'flex' }}
                >
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="mt-2 font-medium text-gray-900">{product.productName}</h2>
              <p className="text-sm text-gray-500">{product.seller?.user?.userName || "Unknown Artisan"}</p>
              <p className="font-bold mt-1 text-gray-900">₱{Number(product.productPrice).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
