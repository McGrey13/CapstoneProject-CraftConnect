import React, { useState } from "react";
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

// --- Full Mock Products ---
// Mock data has been updated to be consistent with the other components// src/Components/product/ProductsPage.jsx

export const mockProducts = [
  {
    id: "prod-1",
    artisanId: "art-1",
    title: "Handcrafted Ceramic Mug",
    price: "1,200",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    isFeatured: true,
    category: "Ceramics",
    artisanName: "Sarah",
    description: "Beautiful handcrafted ceramic mug for your morning coffee or tea.",
    features: ["Handcrafted", "Microwave safe", "12 oz capacity"],
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Emily Johnson", rating: 5, date: "2024-01-15", comment: "Love this mug! The color is exactly what I wanted.", verified: true },
      { id: 2, name: "John Smith", rating: 4, date: "2024-02-20", comment: "Great quality, but a bit smaller than I expected.", verified: true },
    ],
  },
  {
    id: "prod-2",
    artisanId: "art-2",
    title: "Hand-Carved Rubber Signature Stamp",
    price: "7,500",
    image: "https://images.unsplash.com/photo-1606813909358-4e993b3c4b12?w=400&q=80",
    isFeatured: true,
    category: "Accessories",
    artisanName: "Ceasar",
    description: "A custom hand-carved rubber stamp for your signature.",
    features: ["Customizable", "Durable rubber", "Ergonomic wooden handle"],
    images: [
      "https://images.unsplash.com/photo-1606813909358-4e993b3c4b12?w=400&q=80",
      "https://images.unsplash.com/photo-1594951466089-a2a4b8f8e02d?w=400&q=80",
    ],
    reviews: [
      { id: 3, name: "Maria Cruz", rating: 5, date: "2024-03-10", comment: "The carving is so detailed and precise. Perfect for my business.", verified: true },
      { id: 4, name: "Robert Lee", rating: 5, date: "2024-04-05", comment: "High quality and fast delivery. Very satisfied!", verified: false },
    ],
  },
  {
    id: "prod-3",
    artisanId: "art-1",
    title: "Miniature Model of Rizal’s House",
    price: "1,800",
    image: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80",
    isFeatured: false,
    category: "Miniature Models",
    artisanName: "Alex Manalo",
    description: "A meticulously crafted miniature model of Jose Rizal's ancestral house.",
    features: ["Handmade", "Detailed craftsmanship", "Historical piece"],
    images: [
      "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80",
      "https://images.unsplash.com/photo-1627914434251-16474b1e52f4?w=400&q=80",
    ],
    reviews: [
      { id: 5, name: "Samantha Lim", rating: 5, date: "2024-05-18", comment: "A beautiful and intricate piece of art. A must-have for history lovers.", verified: true },
    ],
  },
  {
    id: "prod-4",
    artisanId: "art-1",
    title: "Kaleidoscope",
    price: "2,000",
    image: "https://images.unsplash.com/photo-1591025207163-9e7f55c4d1b8?w=400&q=80",
    isFeatured: false,
    category: "Toys",
    artisanName: "Alex Manalo",
    description: "A handmade kaleidoscope with unique and beautiful patterns.",
    features: ["Handmade", "Unique patterns", "Durable materials"],
    images: [
      "https://images.unsplash.com/photo-1591025207163-9e7f55c4d1b8?w=400&q=80",
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    ],
    reviews: [
      { id: 6, name: "Chris Tan", rating: 4, date: "2024-06-25", comment: "My kids love it! The patterns are so mesmerizing.", verified: true },
      { id: 7, name: "Diana Garcia", rating: 5, date: "2024-07-01", comment: "Excellent craftsmanship. A great gift.", verified: false },
    ],
  },
];

// --- ProductsPage Component ---
const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = mockProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "ceramics", "textiles", "jewelry", "woodwork", "accessories", "home", "bath & body"];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            className="cursor-pointer bg-white p-4 rounded-lg shadow hover:shadow-md"
          >
            <img src={product.images[0]} alt={product.title} className="w-full h-40 object-cover rounded" />
            <h2 className="mt-2 font-medium">{product.title}</h2>
            <p className="text-sm text-gray-500">{product.artisanName}</p>
            <p className="font-bold mt-1">₱{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
