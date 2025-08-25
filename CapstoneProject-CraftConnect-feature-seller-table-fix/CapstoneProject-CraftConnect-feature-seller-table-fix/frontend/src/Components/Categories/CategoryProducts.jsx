import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

// Places (categories)
const categories = [
  { id: "1", name: "Calamba" },
  { id: "2", name: "Pila" },
  { id: "3", name: "Victoria" },
  { id: "4", name: "Paete" },
  { id: "5", name: "Pakil" },
  { id: "6", name: "Liliw" },
];

// Product categories
const productCategories = [
  { id: "cat-1", name: "Ceramics" },
  { id: "cat-2", name: "Textiles" },
  { id: "cat-3", name: "Jewelry" },
  { id: "cat-4", name: "Woodwork" },
  { id: "cat-5", name: "Paper Crafts" },
  { id: "cat-6", name: "Glass Works" },
];

// Products with placeId and categoryId
const products = [
  {
    id: "prod-1",
    title: "Handcrafted Ceramic Mug",
    categoryId: "cat-1",
    placeId: "1", // Calamba
    price: 24.99,
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80",
  },
  {
    id: "prod-2",
    title: "Ceramic Vase",
    categoryId: "cat-1",
    placeId: "1", // Calamba
    price: 49.99,
    image: "https://images.unsplash.com/photo-1549887530-3b8a945ec160?w=400&q=80",
  },
  {
    id: "prod-3",
    title: "Silver Necklace",
    categoryId: "cat-3",
    placeId: "2", // Pila
    price: 65.0,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    id: "prod-4",
    title: "Gold Earrings",
    categoryId: "cat-3",
    placeId: "2", // Pila
    price: 80.5,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&q=80",
  },
  {
    id: "prod-5",
    title: "Woven Textile Scarf",
    categoryId: "cat-2",
    placeId: "3", // Victoria
    price: 38.99,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
  {
    id: "prod-6",
    title: "Handmade Textile Bag",
    categoryId: "cat-2",
    placeId: "3", // Victoria
    price: 45.0,
    image: "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=400&q=80",
  },
];

const CategoryProducts = () => {
  const { id } = useParams();

  const category = categories.find((cat) => cat.id === id);
  const filteredProducts = products.filter((prod) => prod.placeId === id);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-red-600 mb-4">Category not found.</p>
        <Link to="/" className="text-[#a4785a] underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          to="/"
          className="inline-block mb-8 text-[#a4785a] hover:text-[#7a5c44] transition-colors font-semibold"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-center">{category.name} Products</h1>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg italic">
            No products available for {category.name}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const productCategory = productCategories.find((c) => c.id === product.categoryId);

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <CardContent className="p-5">
                    <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                    <p className="text-gray-600 mb-1">Category: {productCategory?.name || "N/A"}</p>
                    <p className="text-gray-600 mb-3">Place: {category.name}</p>
                    <p className="text-lg font-bold text-[#a4785a]">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
