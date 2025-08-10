import React, { useState } from "react";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

const mockProducts = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
    title: "Handcrafted Ceramic Mug",
    price: 24.99,
    artisanName: "Sarah ",
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
  {
    id: "9",
    image:
      "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=500&q=80",
    title: "Handwoven Wool Scarf",
    price: 38.99,
    artisanName: "Mountain Weavers",
    rating: 4.7,
    isNew: true,
    isFeatured: false,
    category: "Textiles",
  },
  {
    id: "10",
    image:
      "https://images.unsplash.com/photo-1617142584114-e7c58dc970ea?w=500&q=80",
    title: "Artisan Soap Collection",
    price: 28.5,
    artisanName: "Natural Essentials",
    rating: 4.8,
    isNew: false,
    isFeatured: false,
    category: "Bath & Body",
  },
  {
    id: "11",
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80",
    title: "Handmade Ceramic Planter",
    price: 32.99,
    artisanName: "Sarah ",
    rating: 4.6,
    isNew: false,
    isFeatured: false,
    category: "Ceramics",
  },
  {
    id: "12",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80",
    title: "Wooden Cutting Board",
    price: 45.0,
    artisanName: "Forest Crafts",
    rating: 4.5,
    isNew: false,
    isFeatured: false,
    category: "Woodwork",
  },
];

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const categories = [
    "All",
    "Ceramics",
    "Textiles",
    "Jewelry",
    "Woodwork",
    "Accessories",
    "Home",
    "Bath & Body",
  ];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" ||
      product.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
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

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleAddToCart = (id) => {
    console.log(`Added product ${id} to cart`);
  };

  const handleFavorite = (id) => {
    console.log(`Added product ${id} to favorites`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Products</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Handcrafted Products</h1>
          <p className="text-gray-600">
            Discover unique items made with passion by local artisans from Laguna
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </form>
            <div className="flex items-center gap-2">
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-6"
        >
          <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start p-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category.toLowerCase()}
                value={category.toLowerCase()}
                className="px-4 py-2 whitespace-nowrap"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex justify-center">
                <ProductCard
                  id={product.id}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  artisanName={product.artisanName}
                  rating={product.rating}
                  isNew={product.isNew}
                  isFeatured={product.isFeatured}
                  onAddToCart={handleAddToCart}
                  onFavorite={handleFavorite}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No products found matching your criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {Array.from({ length: pageCount }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(index)}
                className="w-10"
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1))}
              disabled={currentPage === pageCount - 1}
            >
              Next
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
