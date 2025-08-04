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
  products = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
      title: "Handcrafted Ceramic Mug",
      price: 24.99,
      artisanName: "Sarah Pottery",
      rating: 4.5,
      isNew: true,
      isFeatured: true,
      category: "Ceramics",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1603031612556-9f3e239d5a76?w=500&q=80",
      title: "Woven Basket Set",
      price: 49.99,
      artisanName: "Weaving Wonders",
      rating: 4.8,
      isNew: false,
      isFeatured: true,
      category: "Home",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=500&q=80",
      title: "Handmade Leather Journal",
      price: 35.5,
      artisanName: "Leather Craft Co.",
      rating: 4.2,
      isNew: false,
      isFeatured: true,
      category: "Accessories",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1631125915902-d9eca5c900e4?w=500&q=80",
      title: "Macrame Wall Hanging",
      price: 89.99,
      artisanName: "Knot & Fiber",
      rating: 4.7,
      isNew: true,
      isFeatured: true,
      category: "Textiles",
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1621517936102-3fbd997689e6?w=500&q=80",
      title: "Hand-Poured Soy Candle",
      price: 18.99,
      artisanName: "Glow Artisan",
      rating: 4.9,
      isNew: false,
      isFeatured: true,
      category: "Home",
    },
    {
      id: "6",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80",
      title: "Beaded Statement Necklace",
      price: 65.0,
      artisanName: "Bead & Gem Studio",
      rating: 4.4,
      isNew: true,
      isFeatured: true,
      category: "Jewelry",
    },
    {
      id: "7",
      image:
        "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&q=80",
      title: "Hand-Carved Wooden Bowl",
      price: 42.5,
      artisanName: "Forest Crafts",
      rating: 4.6,
      isNew: false,
      isFeatured: true,
      category: "Woodwork",
    },
    {
      id: "8",
      image:
        "https://images.unsplash.com/photo-1594749794743-2c3ec3e47005?w=500&q=80",
      title: "Embroidered Linen Pillow",
      price: 55.0,
      artisanName: "Stitch & Thread",
      rating: 4.3,
      isNew: true,
      isFeatured: true,
      category: "Home",
    },
  ],
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["All", "Ceramics", "Textiles", "Jewelry", "Woodwork"];
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
