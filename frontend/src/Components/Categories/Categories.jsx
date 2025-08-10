import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

const mockCategories = [
  {
    id: "cat-1",
    name: "Ceramics",
    description: "Handcrafted pottery, mugs, plates, and decorative items",
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=500&q=80",
    productCount: 48,
  },
  {
    id: "cat-2",
    name: "Textiles",
    description: "Handwoven fabrics, tapestries, and clothing items",
    image: "https://images.unsplash.com/photo-1459501462159-97d5bded1416?w=500&q=80",
    productCount: 36,
  },
  {
    id: "cat-3",
    name: "Jewelry",
    description: "Handcrafted necklaces, bracelets, earrings, and rings",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80",
    productCount: 52,
  },
  {
    id: "cat-4",
    name: "Woodwork",
    description: "Hand-carved furniture, bowls, utensils, and decorative pieces",
    image: "https://images.unsplash.com/photo-1533377379833-82b6aaface9c?w=500&q=80",
    productCount: 29,
  },
  {
    id: "cat-5",
    name: "Paper Crafts",
    description: "Handmade cards, journals, origami, and paper decorations",
    image: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=500&q=80",
    productCount: 18,
  },
  {
    id: "cat-6",
    name: "Glass Works",
    description: "Hand-blown glass items, stained glass, and glass jewelry",
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=500&q=80",
    productCount: 24,
  },
  {
    id: "cat-7",
    name: "Leather Goods",
    description: "Handcrafted bags, wallets, belts, and accessories",
    image: "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=500&q=80",
    productCount: 31,
  },
  {
    id: "cat-8",
    name: "Metal Works",
    description: "Hand-forged jewelry, tools, and decorative items",
    image: "https://images.unsplash.com/photo-1535161466759-5717f60683e1?w=500&q=80",
    productCount: 22,
  },
  {
    id: "cat-9",
    name: "Bath & Body",
    description: "Handmade soaps, bath bombs, lotions, and skincare products",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=500&q=80",
    productCount: 27,
  },
  {
    id: "cat-10",
    name: "Home Decor",
    description: "Handcrafted decorative items for your home",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80",
    productCount: 43,
  },
];

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(mockCategories);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setCategories(mockCategories);
    } else {
      const filtered = mockCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategories(filtered);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Categories</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Browse Categories</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of handcrafted product categories from talented artisans
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="search"
                placeholder="Search categories..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map((category) => (
              <Link to={`/products?category=${category.name.toLowerCase()}`} key={category.id}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-md">
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.productCount} products</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-600 line-clamp-2">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No categories found matching your search</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setCategories(mockCategories);
              }}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
