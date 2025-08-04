import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

const CategoryGrid = ({
  categories = [
    {
      id: "1",
      name: "Calamba",
      icon: "https://i0.wp.com/www.mycitymysm.com/wp-content/uploads/2021/08/my-city-my-sm-my-craft-calamba-laguna-14.jpg?fit=1280%2C978&ssl=1",
      description: "Handcrafted ceramic pieces for your home",
      productCount: 125,
    },
    {
      id: "2",
      name: "Pila",
      icon: "https://www.wheninmanila.com/wp-content/uploads/2017/10/when-in-manila-teds-sta-cruz-laguna-products-food-sa-pantalan-3019-e1508108617844.jpg",
      description: "Unique handmade jewelry pieces",
      productCount: 89,
    },
    {
      id: "3",
      name: "Victoria",
      icon: "",
      description: "Woven, knitted, and embroidered goods",
      productCount: 76,
    },
    {
      id: "4",
      name: "Paete",
      icon: "",
      description: "Handcrafted wooden items and furniture",
      productCount: 62,
    },
    {
      id: "5",
      name: "Pakil",
      icon: "",
      description: "Handmade paper goods and stationery",
      productCount: 45,
    },
    {
      id: "6",
      name: "Liliw",
      icon: "https://images.squarespace-cdn.com/content/v1/5958da62d2b857c0a9d740fb/1563817484363-SU8P76Y1IP9CMKQP3AGX/DSC03247.jpg",
      description: "Blown glass and stained glass creations",
      productCount: 38,
    },
  ],
  title = "Browse by Category",
  subtitle = "Discover unique handcrafted items across Laguna",
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 bg-[#fefefe]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            to={`/category/${category.id}`}
            key={category.id}
            className="block transition-transform hover:scale-105"
          >
            <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-bold text-xl">{category.name}</h3>
                    <p className="text-sm text-white/80">
                      {category.productCount} products
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
