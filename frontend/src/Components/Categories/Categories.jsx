import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

const mockCategories = [
   {
    id: "cat-1",
    name: "Woodcrafts",
    description: "Crafted items from wood, including furniture, home decor, and utensils.",
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Woodcrafts",
    productCount: 45,
  },
  {
    id: "cat-2",
    name: "Textiles",
    description: "Handwoven fabrics, traditional clothing, and various fiber arts.",
    image: "https://placehold.co/400x400/9ccc65/000000?text=Textiles",
    productCount: 38,
  },
  {
    id: "cat-3",
    name: "Jewelry",
    description: "Handcrafted necklaces, bracelets, earrings, and other wearable art.",
    image: "https://placehold.co/400x400/ffca28/000000?text=Jewelry",
    productCount: 52,
  },
  {
    id: "cat-4",
    name: "Paper Crafts",
    description: "Artistic creations using paper, such as handmade cards, origami, and paper lanterns.",
    image: "https://placehold.co/400x400/ffb300/000000?text=Paper+Crafts",
    productCount: 21,
  },
  {
    id: "cat-5",
    name: "Accessories",
    description: "A wide range of handcrafted accessories, from wallets to keychains.",
    image: "https://placehold.co/400x400/42a5f5/ffffff?text=Accessories",
    productCount: 31,
  },
  {
    id: "cat-6",
    name: "Home Décor",
    description: "Decorative items and accents to beautify any living space.",
    image: "https://placehold.co/400x400/d81b60/ffffff?text=Home+Decor",
    productCount: 43,
  },
  {
    id: "cat-7",
    name: "Hand-painted Art",
    description: "Unique artworks on various canvases, including paintings and painted crafts.",
    image: "https://placehold.co/400x400/ab47bc/ffffff?text=Hand-painted+Art",
    productCount: 29,
  },
  {
    id: "cat-8",
    name: "Footwear",
    description: "Traditional and modern handcrafted footwear, including sandals and slippers.",
    image: "https://placehold.co/400x400/00acc1/ffffff?text=Footwear",
    productCount: 15,
  },
  {
    id: "cat-9",
    name: "Wood Carving",
    description: "Intricate and detailed carvings from wood, often with cultural or religious themes.",
    image: "https://placehold.co/400x400/b71c1c/ffffff?text=Wood+Carving",
    productCount: 55,
  },
  {
    id: "cat-10",
    name: "Pottery",
    description: "Handcrafted earthenware, including vases, pots, and kitchenware.",
    image: "https://placehold.co/400x400/66bb6a/ffffff?text=Pottery",
    productCount: 48,
  },
  {
    id: "cat-11",
    name: "Abaca Weaving",
    description: "Traditional weaving of abaca fiber into various products like bags and mats.",
    image: "https://placehold.co/400x400/8e24aa/ffffff?text=Abaca+Weaving",
    productCount: 19,
  },
  {
    id: "cat-12",
    name: "Rattan/Bamboo Crafts",
    description: "Functional and decorative items made from rattan and bamboo.",
    image: "https://placehold.co/400x400/5c6bc0/ffffff?text=Rattan+Bamboo",
    productCount: 24,
  },
  {
    id: "cat-13",
    name: "Coconut Crafts",
    description: "Unique crafts made from various parts of the coconut tree.",
    image: "https://placehold.co/400x400/c2185b/ffffff?text=Coconut+Crafts",
    productCount: 27,
  },
  {
    id: "cat-14",
    name: "Waterlily Crafts",
    description: "Sustainable products created from dried water hyacinth fibers.",
    image: "https://placehold.co/400x400/00897b/ffffff?text=Waterlily+Crafts",
    productCount: 12,
  },
  {
    id: "cat-15",
    name: "Embroidery",
    description: "Intricate needlework and design on various fabrics.",
    image: "https://placehold.co/400x400/ffeb3b/000000?text=Embroidery",
    productCount: 35,
  },
  {
    id: "cat-16",
    name: "Basket Weaving",
    description: "Artistic and functional baskets handwoven from natural materials.",
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Basket+Weaving",
    productCount: 22,
  },
  {
    id: "cat-17",
    name: "Metal Crafts",
    description: "Forged and shaped metal into beautiful decorative and functional pieces.",
    image: "https://placehold.co/400x400/ffa000/000000?text=Metal+Crafts",
    productCount: 18,
  },
  {
    id: "cat-18",
    name: "Musical Instruments",
    description: "Handmade musical instruments, often from traditional or local materials.",
    image: "https://placehold.co/400x400/4db6ac/ffffff?text=Musical+Instruments",
    productCount: 10,
  },
  {
    id: "cat-19",
    name: "Toys",
    description: "Handcrafted and often eco-friendly toys for children.",
    image: "https://placehold.co/400x400/ff5722/ffffff?text=Toys",
    productCount: 14,
  },
  {
    id: "cat-20",
    name: "Figurines",
    description: "Small sculptures and figures for decoration or collection.",
    image: "https://placehold.co/400x400/6a1b9a/ffffff?text=Figurines",
    productCount: 28,
  },
  {
    id: "cat-21",
    name: "Upcycled Crafts",
    description: "Creative items made from recycled or repurposed materials.",
    image: "https://placehold.co/400x400/388e3c/ffffff?text=Upcycled+Crafts",
    productCount: 17,
  },
  {
    id: "cat-22",
    name: "Soap Making",
    description: "Handmade soaps with natural ingredients and unique scents.",
    image: "https://placehold.co/400x400/00897b/ffffff?text=Soap+Making",
    productCount: 25,
  },
  {
    id: "cat-23",
    name: "Candle Making",
    description: "Hand-poured candles with various scents and unique designs.",
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Candle+Making",
    productCount: 33,
  },
];

// Products with placeId and categoryId - Updated to match the new categories
const products = [
  // Products from Alaminos
  {
    id: "prod-1",
    title: "Hand-Woven Basket",
    categoryId: "cat-16", // Basket Weaving
    placeId: "1", // Alaminos
    price: 15.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Alaminos+Basket",
  },
  {
    id: "prod-2",
    title: "Ceramic Planter",
    categoryId: "cat-10", // Pottery
    placeId: "1", // Alaminos
    price: 35.50,
    image: "https://placehold.co/400x400/9ccc65/000000?text=Alaminos+Ceramic",
  },
  // Products from Bay
  {
    id: "prod-3",
    title: "Bamboo Wind Chime",
    categoryId: "cat-12", // Rattan/Bamboo Crafts
    placeId: "2", // Bay
    price: 20.00,
    image: "https://placehold.co/400x400/ffb300/000000?text=Bay+Wind+Chime",
  },
  {
    id: "prod-4",
    title: "Hand-painted Gourd Art",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "2", // Bay
    price: 28.75,
    image: "https://placehold.co/400x400/d81b60/ffffff?text=Bay+Gourd",
  },
  // Products from Biñan
  {
    id: "prod-5",
    title: "Hand-Sewn Barong Tagalog",
    categoryId: "cat-15", // Embroidery
    placeId: "3", // Biñan
    price: 150.00,
    image: "https://placehold.co/400x400/8e24aa/ffffff?text=Biñan+Barong",
  },
  {
    id: "prod-6",
    title: "Traditional Slippers (Bakya)",
    categoryId: "cat-8", // Footwear
    placeId: "3", // Biñan
    price: 22.50,
    image: "https://placehold.co/400x400/00897b/ffffff?text=Biñan+Bakya",
  },
  // Products from Calamba
  {
    id: "prod-7",
    title: "Miniature Rizal Shrine Model",
    categoryId: "cat-9", // Wood Carving
    placeId: "4", // Calamba
    price: 45.00,
    image: "https://placehold.co/400x400/42a5f5/ffffff?text=Calamba+Rizal",
  },
  {
    id: "prod-8",
    title: "Ceramic Taal Lake-Inspired Mug",
    categoryId: "cat-10", // Pottery
    placeId: "4", // Calamba
    price: 24.99,
    image: "https://placehold.co/400x400/66bb6a/ffffff?text=Calamba+Mug",
  },
  // Products from Calauan
  {
    id: "prod-9",
    title: "Pineapple Fiber Wallet",
    categoryId: "cat-2", // Textiles
    placeId: "5", // Calauan
    price: 30.00,
    image: "https://placehold.co/400x400/ffeb3b/000000?text=Calauan+Wallet",
  },
  {
    id: "prod-10",
    title: "Wood-Carved Pineapple",
    categoryId: "cat-9", // Wood Carving
    placeId: "5", // Calauan
    price: 18.00,
    image: "https://placehold.co/400x400/ff5722/ffffff?text=Calauan+Pineapple",
  },
  // Products from Cavinti
  {
    id: "prod-11",
    title: "Woven Abaca Placemat",
    categoryId: "cat-11", // Abaca Weaving
    placeId: "6", // Cavinti
    price: 12.00,
    image: "https://placehold.co/400x400/5c6bc0/ffffff?text=Cavinti+Placemat",
  },
  {
    id: "prod-12",
    title: "Bamboo Tea Box",
    categoryId: "cat-12", // Rattan/Bamboo Crafts
    placeId: "6", // Cavinti
    price: 25.00,
    image: "https://placehold.co/400x400/ab47bc/ffffff?text=Cavinti+Tea+Box",
  },
  // Products from Famy
  {
    id: "prod-13",
    title: "Hand-painted Landscape Canvas",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "7", // Famy
    price: 75.00,
    image: "https://placehold.co/400x400/4db6ac/ffffff?text=Famy+Painting",
  },
  {
    id: "prod-14",
    title: "Ceramic Famy River Plate",
    categoryId: "cat-10", // Pottery
    placeId: "7", // Famy
    price: 32.50,
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Famy+Plate",
  },
  // Products from Los Baños
  {
    id: "prod-15",
    title: "Los Baños T-Shirt",
    categoryId: "cat-2", // Textiles
    placeId: "8", // Los Baños
    price: 18.00,
    image: "https://placehold.co/400x400/ffca28/000000?text=Los+Baños+Shirt",
  },
  {
    id: "prod-16",
    title: "Handmade Scented Candle",
    categoryId: "cat-23", // Candle Making
    placeId: "8", // Los Baños
    price: 15.75,
    image: "https://placehold.co/400x400/ffa000/000000?text=Los+Baños+Candle",
  },
  // Products from Luisiana
  {
    id: "prod-17",
    title: "Hand-braided Buri Hat",
    categoryId: "cat-16", // Basket Weaving
    placeId: "9", // Luisiana
    price: 20.00,
    image: "https://placehold.co/400x400/b71c1c/ffffff?text=Luisiana+Hat",
  },
  {
    id: "prod-18",
    title: "Coconut Shell Lamp",
    categoryId: "cat-13", // Coconut Crafts
    placeId: "9", // Luisiana
    price: 40.00,
    image: "https://placehold.co/400x400/c2185b/ffffff?text=Luisiana+Lamp",
  },
  // Products from Lumban
  {
    id: "prod-19",
    title: "Embroidered Table Runner",
    categoryId: "cat-15", // Embroidery
    placeId: "10", // Lumban
    price: 55.00,
    image: "https://placehold.co/400x400/6a1b9a/ffffff?text=Lumban+Embroidery",
  },
  {
    id: "prod-20",
    title: "Lace Fan (Abaniko)",
    categoryId: "cat-15", // Embroidery
    placeId: "10", // Lumban
    price: 30.00,
    image: "https://placehold.co/400x400/388e3c/ffffff?text=Lumban+Fan",
  },
  // Products from Magdalena
  {
    id: "prod-21",
    title: "Handmade Necklace",
    categoryId: "cat-3", // Jewelry
    placeId: "11", // Magdalena
    price: 45.00,
    image: "https://placehold.co/400x400/00acc1/ffffff?text=Magdalena+Necklace",
  },
  {
    id: "prod-22",
    title: "Leather Wallet",
    categoryId: "cat-5", // Accessories
    placeId: "11", // Magdalena
    price: 60.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Magdalena+Wallet",
  },
  // Products from Majayjay
  {
    id: "prod-23",
    title: "Water Hyacinth Bag",
    categoryId: "cat-14", // Waterlily Crafts
    placeId: "12", // Majayjay
    price: 50.00,
    image: "https://placehold.co/400x400/ffb300/000000?text=Majayjay+Bag",
  },
  {
    id: "prod-24",
    title: "Wood-Carved Santo",
    categoryId: "cat-9", // Wood Carving
    placeId: "12", // Majayjay
    price: 120.00,
    image: "https://placehold.co/400x400/d81b60/ffffff?text=Majayjay+Santo",
  },
  // Products from Nagcarlan
  {
    id: "prod-25",
    title: "Ceramic Burial Jar",
    categoryId: "cat-10", // Pottery
    placeId: "13", // Nagcarlan
    price: 85.00,
    image: "https://placehold.co/400x400/8e24aa/ffffff?text=Nagcarlan+Jar",
  },
  {
    id: "prod-26",
    title: "Woven Mat (Banig)",
    categoryId: "cat-16", // Basket Weaving
    placeId: "13", // Nagcarlan
    price: 35.00,
    image: "https://placehold.co/400x400/00897b/ffffff?text=Nagcarlan+Banig",
  },
  // Products from Paete
  {
    id: "prod-27",
    title: "Wooden Carved Horse",
    categoryId: "cat-9", // Wood Carving
    placeId: "14", // Paete
    price: 75.00,
    image: "https://placehold.co/400x400/42a5f5/ffffff?text=Paete+Carving",
  },
  {
    id: "prod-28",
    title: "Hand-Painted Paper Fan",
    categoryId: "cat-4", // Paper Crafts
    placeId: "14", // Paete
    price: 15.00,
    image: "https://placehold.co/400x400/66bb6a/ffffff?text=Paete+Fan",
  },
  // Products from Pagsanjan
  {
    id: "prod-29",
    title: "Pagsanjan Rapids Souvenir Shirt",
    categoryId: "cat-2", // Textiles
    placeId: "15", // Pagsanjan
    price: 20.00,
    image: "https://placehold.co/400x400/ffeb3b/000000?text=Pagsanjan+Shirt",
  },
  {
    id: "prod-30",
    title: "Bamboo Flute",
    categoryId: "cat-18", // Musical Instruments
    placeId: "15", // Pagsanjan
    price: 12.50,
    image: "https://placehold.co/400x400/ff5722/ffffff?text=Pagsanjan+Flute",
  },
  // Products from Pakil
  {
    id: "prod-31",
    title: "Hand-Carved Wooden Figure",
    categoryId: "cat-9", // Wood Carving
    placeId: "16", // Pakil
    price: 80.00,
    image: "https://placehold.co/400x400/5c6bc0/ffffff?text=Pakil+Figure",
  },
  {
    id: "prod-32",
    title: "Paper Parol",
    categoryId: "cat-4", // Paper Crafts
    placeId: "16", // Pakil
    price: 18.00,
    image: "https://placehold.co/400x400/ab47bc/ffffff?text=Pakil+Parol",
  },
  // Products from Pangil
  {
    id: "prod-33",
    title: "Woven Abaca Slippers",
    categoryId: "cat-8", // Footwear
    placeId: "17", // Pangil
    price: 25.00,
    image: "https://placehold.co/400x400/4db6ac/ffffff?text=Pangil+Slippers",
  },
  {
    id: "prod-34",
    title: "Hand-made Clay Pot",
    categoryId: "cat-10", // Pottery
    placeId: "17", // Pangil
    price: 35.00,
    image: "https://placehold.co/400x400/8d6e63/ffffff?text=Pangil+Pot",
  },
  // Products from San Pablo
  {
    id: "prod-35",
    title: "Coconut Shell Bowl",
    categoryId: "cat-13", // Coconut Crafts
    placeId: "18", // San Pablo
    price: 20.00,
    image: "https://placehold.co/400x400/ffca28/000000?text=San+Pablo+Bowl",
  },
  {
    id: "prod-36",
    title: "Hand-loomed Textile",
    categoryId: "cat-2", // Textiles
    placeId: "18", // San Pablo
    price: 45.00,
    image: "https://placehold.co/400x400/ffa000/000000?text=San+Pablo+Textile",
  },
  // Products from Santa Cruz
  {
    id: "prod-37",
    title: "Batik Cloth",
    categoryId: "cat-2", // Textiles
    placeId: "19", // Santa Cruz
    price: 30.00,
    image: "https://placehold.co/400x400/b71c1c/ffffff?text=Santa+Cruz+Batik",
  },
  {
    id: "prod-38",
    title: "Bamboo Flute",
    categoryId: "cat-18", // Musical Instruments
    placeId: "19", // Santa Cruz
    price: 12.50,
    image: "https://placehold.co/400x400/c2185b/ffffff?text=Santa+Cruz+Flute",
  },
  // Products from Siniloan
  {
    id: "prod-39",
    title: "Wooden Jewelry Box",
    categoryId: "cat-9", // Wood Carving
    placeId: "20", // Siniloan
    price: 50.00,
    image: "https://placehold.co/400x400/6a1b9a/ffffff?text=Siniloan+Jewelry+Box",
  },
  {
    id: "prod-40",
    title: "Hand-painted Landscape Canvas",
    categoryId: "cat-7", // Hand-painted Art
    placeId: "20", // Siniloan
    price: 75.00,
    image: "https://placehold.co/400x400/388e3c/ffffff?text=Siniloan+Painting",
  },
  // Products from Victoria
  {
    id: "prod-41",
    title: "Duck-themed Ceramic",
    categoryId: "cat-10", // Pottery
    placeId: "21", // Victoria
    price: 25.00,
    image: "https://placehold.co/400x400/00acc1/ffffff?text=Victoria+Ceramic",
  },
  {
    id: "prod-42",
    title: "Woven Abaca Table Runner",
    categoryId: "cat-11", // Abaca Weaving
    placeId: "21", // Victoria
    price: 30.00,
    image: "https://placehold.co/400x400/1e88e5/ffffff?text=Victoria+Table+Runner",
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
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-black">
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
