import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover unique handcrafted items from talented artisans around Laguna",
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const products = [
    {
      "id": "1",
      "image": "https://images.unsplash.com/photo-1621215096538-3163a34a3f3b?q=80&w=400",
      "title": "Miniature Bahay Kubo",
      "price": 35.50,
      "artisanName": "Alex Manalo",
      "artisanId": "art-1",
      "rating": 4.9,
      "isNew": false,
      "isFeatured": true,
      "category": "Miniatures & Souvenirs"
    },
    {
      "id": "2",
      "image": "https://images.unsplash.com/photo-1627960309228-56a849206d44?q=80&w=400",
      "title": "Hand-painted Wooden Hand Fan",
      "price": 18.00,
      "artisanName": "Alex Manalo",
      "artisanId": "art-1",
      "rating": 4.8,
      "isNew": true,
      "isFeatured": true,
      "category": "Miniatures & Souvenirs"
    },
    {
      "id": "3",
      "image": "https://images.unsplash.com/photo-1549646631-5f21295b9a89?q=80&w=400",
      "title": "Personalized Hand-Carved Rubber Stamp",
      "price": 25.00,
      "artisanName": "Tatay Cesar",
      "artisanId": "art-2",
      "rating": 4.7,
      "isNew": false,
      "isFeatured": false,
      "category": "Rubber Stamp Engraving"
    },
    {
      "id": "4",
      "image": "https://images.unsplash.com/photo-1596707323281-9b63a9f0298a?q=80&w=400",
      "title": "Handmade Beaded Necklace",
      "price": 32.50,
      "artisanName": "Baby Mae",
      "artisanId": "art-3",
      "rating": 4.8,
      "isNew": true,
      "isFeatured": true,
      "category": "Traditional Accessories"
    },
    {
      "id": "5",
      "image": "https://images.unsplash.com/photo-1621577785501-c8b82a7f53a4?q=80&w=400",
      "title": "Hand-Painted Religious Statue",
      "price": 95.00,
      "artisanName": "Tatay Tiko",
      "artisanId": "art-4",
      "rating": 4.9,
      "isNew": false,
      "isFeatured": true,
      "category": "Statuary & Sculpture"
    },
    {
      "id": "6",
      "image": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&q=80",
      "title": "Intricately Carved Wooden Sculpture",
      "price": 120.00,
      "artisanName": "Tatay Tiko",
      "artisanId": "art-4",
      "rating": 4.6,
      "isNew": false,
      "isFeatured": false,
      "category": "Statuary & Sculpture"
    },
    {
      "id": "7",
      "image": "https://images.unsplash.com/photo-1533153578335-e63d41f36402?q=80&w=400",
      "title": "Hand-Woven Rattan Basket",
      "price": 55.00,
      "artisanName": "Renel Batralo",
      "artisanId": "art-5",
      "rating": 4.7,
      "isNew": true,
      "isFeatured": true,
      "category": "Basketry & Weaving"
    },
    {
      "id": "8",
      "image": "https://images.unsplash.com/photo-1594749794743-2c3ec3e47005?w=500&q=80",
      "title": "Bamboo Wind Chime",
      "price": 28.00,
      "artisanName": "Renel Batralo",
      "artisanId": "art-5",
      "rating": 4.3,
      "isNew": false,
      "isFeatured": false,
      "category": "Wood & Bamboo Crafts"
    },
    {
      "id": "9",
      "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      "title": "Traditional Filipino Weave Scarf",
      "price": 45.00,
      "artisanName": "Baby Mae",
      "artisanId": "art-3",
      "rating": 4.5,
      "isNew": true,
      "isFeatured": false,
      "category": "Weaving & Textiles"
    }
  ];

  const categories = ["All", "Miniatures & Souvenirs", "Rubber Stamp Engraving", "Traditional Accessories", "Statuary & Sculpture", "Basketry & Weaving"];
  const itemsPerPage = 4;

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.category.toLowerCase() === activeTab.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return a.isNew ? -1 : 1;
      default:
        return a.isFeatured ? -1 : 1;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <section className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto mb-4 md:mb-0"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category.toLowerCase()}
                value={category.toLowerCase()}
                className="px-4 py-2"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={onAddToCart}
            onFavorite={onFavorite}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-gray-600">
            Page {currentPage + 1} of {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage === pageCount - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;