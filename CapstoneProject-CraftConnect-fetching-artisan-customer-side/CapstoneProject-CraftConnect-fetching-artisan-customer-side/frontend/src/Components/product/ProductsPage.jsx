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
export const mockProducts = [
  {
    id: "1",
    title: "Handcrafted Ceramic Mug",
    price: 24.99,
    artisanName: "Sarah",
    rating: 4.5,
    category: "Ceramics",
    isNew: true,
    isFeatured: true,
    description:
      "Beautiful handcrafted ceramic mug for your morning coffee or tea.",
    features: ["Handcrafted", "Microwave safe", "12 oz capacity"],
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Emily Johnson", rating: 5, date: "2024-01-15", comment: "Love this mug!", verified: true },
    ],
  },
  {
    id: "2",
    title: "Woven Basket Set",
    price: 49.99,
    artisanName: "Weaving Wonders",
    rating: 4.8,
    category: "Home",
    isNew: false,
    isFeatured: true,
    description: "Handwoven baskets perfect for home storage.",
    features: ["Eco-friendly", "Durable design", "Set of 3"],
    images: [
      "https://images.unsplash.com/photo-1603031612556-9f3e239d5a76?w=800&q=80",
      "https://images.unsplash.com/photo-1603031612556-9f3e239d5a76?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Michael Chen", rating: 4, date: "2024-01-10", comment: "Great baskets!", verified: true },
    ],
  },
  {
    id: "3",
    title: "Handmade Leather Journal",
    price: 35.5,
    artisanName: "Leather Craft Co.",
    rating: 4.2,
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    description: "High-quality handmade leather journal for notes.",
    features: ["Premium leather", "Refillable", "Elegant design"],
    images: [
      "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Sarah Williams", rating: 5, date: "2024-01-08", comment: "Perfect journal!", verified: true },
    ],
  },
  {
    id: "4",
    title: "Macrame Wall Hanging",
    price: 89.99,
    artisanName: "Knot & Fiber",
    rating: 4.7,
    category: "Textiles",
    isNew: true,
    isFeatured: true,
    description: "Beautiful handmade macrame wall decor.",
    features: ["Cotton rope", "Hand-knotted", "Boho style"],
    images: [
      "https://images.unsplash.com/photo-1631125915902-d9eca5c900e4?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Emily Johnson", rating: 5, date: "2024-02-01", comment: "Lovely wall hanging!", verified: true },
    ],
  },
  {
    id: "5",
    title: "Hand-Poured Soy Candle",
    price: 18.99,
    artisanName: "Glow Artisan",
    rating: 4.9,
    category: "Home",
    isNew: false,
    isFeatured: true,
    description: "Eco-friendly soy candle with calming scent.",
    features: ["Soy wax", "Long-lasting", "Natural fragrance"],
    images: [
      "https://images.unsplash.com/photo-1621517936102-3fbd997689e6?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Michael Chen", rating: 5, date: "2024-02-05", comment: "Wonderful candle!", verified: true },
    ],
  },
  {
    id: "6",
    title: "Beaded Statement Necklace",
    price: 65.0,
    artisanName: "Bead & Gem Studio",
    rating: 4.4,
    category: "Jewelry",
    isNew: true,
    isFeatured: true,
    description: "Colorful handmade beaded necklace.",
    features: ["Handmade beads", "Adjustable length", "Unique design"],
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Sarah Williams", rating: 5, date: "2024-03-01", comment: "Beautiful necklace!", verified: true },
    ],
  },
  {
    id: "7",
    title: "Hand-Carved Wooden Bowl",
    price: 42.5,
    artisanName: "Forest Crafts",
    rating: 4.6,
    category: "Woodwork",
    isNew: false,
    isFeatured: true,
    description: "Rustic hand-carved wooden bowl for kitchen.",
    features: ["Solid wood", "Hand-carved", "Food safe"],
    images: [
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Emily Johnson", rating: 4, date: "2024-03-10", comment: "Nice bowl!", verified: true },
    ],
  },
  {
    id: "8",
    title: "Embroidered Linen Pillow",
    price: 55.0,
    artisanName: "Stitch & Thread",
    rating: 4.3,
    category: "Home",
    isNew: true,
    isFeatured: true,
    description: "Decorative hand-embroidered pillow for sofa or bed.",
    features: ["Linen", "Hand-embroidered", "Soft filling"],
    images: [
      "https://images.unsplash.com/photo-1594749794743-2c3ec3e47005?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Michael Chen", rating: 4, date: "2024-04-01", comment: "Beautiful pillow!", verified: true },
    ],
  },
  {
    id: "9",
    title: "Handwoven Wool Scarf",
    price: 38.99,
    artisanName: "Mountain Weavers",
    rating: 4.7,
    category: "Textiles",
    isNew: true,
    isFeatured: false,
    description: "Warm handwoven wool scarf.",
    features: ["Soft wool", "Handwoven", "Cozy"],
    images: [
      "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Sarah Williams", rating: 5, date: "2024-04-10", comment: "Very warm scarf!", verified: true },
    ],
  },
  {
    id: "10",
    title: "Artisan Soap Collection",
    price: 28.5,
    artisanName: "Natural Essentials",
    rating: 4.8,
    category: "Bath & Body",
    isNew: false,
    isFeatured: false,
    description: "Set of natural handcrafted soaps.",
    features: ["All-natural ingredients", "Vegan", "Variety of scents"],
    images: [
      "https://images.unsplash.com/photo-1617142584114-e7c58dc970ea?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Emily Johnson", rating: 5, date: "2024-05-01", comment: "Lovely soap set!", verified: true },
    ],
  },
  {
    id: "11",
    title: "Handmade Ceramic Planter",
    price: 32.99,
    artisanName: "Sarah",
    rating: 4.6,
    category: "Ceramics",
    isNew: false,
    isFeatured: false,
    description: "Handcrafted ceramic planter for small plants.",
    features: ["Ceramic", "Handcrafted", "Modern design"],
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Michael Chen", rating: 4, date: "2024-05-10", comment: "Nice planter!", verified: true },
    ],
  },
  {
    id: "12",
    title: "Wooden Cutting Board",
    price: 45.0,
    artisanName: "Forest Crafts",
    rating: 4.5,
    category: "Woodwork",
    isNew: false,
    isFeatured: false,
    description: "Durable hand-carved wooden cutting board.",
    features: ["Solid wood", "Food safe", "Hand-carved"],
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    ],
    reviews: [
      { id: 1, name: "Sarah Williams", rating: 5, date: "2024-06-01", comment: "Perfect cutting board!", verified: true },
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
            <p className="font-bold mt-1">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
