import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

const categories = [
  {
    "id": "1",
    "name": "Alaminos",
    "icon": "assets/images/categories/alaminos.jpg",
    "description": "Woven pandan bags and local handicrafts",
    "productCount": 55
  },
  {
    "id": "2",
    "name": "Bay",
    "icon": "assets/images/categories/bay.jpg",
    "description": "Traditional artworks and local crafts",
    "productCount": 42
  },
  {
    "id": "3",
    "name": "Biñan",
    "icon": "assets/images/categories/binan.jpg",
    "description": "Famous for footwear and shoemaking",
    "productCount": 60
  },
  {
    "id": "4",
    "name": "Calamba",
    "icon": "assets/images/categories/calamba.jpg",
    "description": "Crochet, knitting, and modern crafts",
    "productCount": 70
  },
  {
    "id": "5",
    "name": "Calauan",
    "icon": "assets/images/categories/calauan.jpg",
    "description": "Local fruits, bamboo crafts, and handwoven products",
    "productCount": 38
  },
  {
    "id": "6",
    "name": "Cavinti",
    "icon": "assets/images/categories/cavinti.jpg",
    "description": "Beaded crafts and handmade accessories",
    "productCount": 46
  },
  {
    "id": "7",
    "name": "Famy",
    "icon": "assets/images/categories/famy.jpg",
    "description": "Known for woven mats and baskets",
    "productCount": 34
  },
  {
    "id": "8",
    "name": "Los Baños",
    "icon": "assets/images/categories/los-banos.jpg",
    "description": "Home of paper crafts and academic-inspired artworks",
    "productCount": 58
  },
  {
    "id": "9",
    "name": "Luisiana",
    "icon": "assets/images/categories/luisiana.jpg",
    "description": "Basket weaving and traditional bamboo crafts",
    "productCount": 40
  },
  {
    "id": "10",
    "name": "Lumban",
    "icon": "assets/images/categories/lumban.jpg",
    "description": "Famous for embroidery and textile crafts",
    "productCount": 75
  },
  {
    "id": "11",
    "name": "Magdalena",
    "icon": "assets/images/categories/magdalena.jpg",
    "description": "Handcrafted wood items and traditional products",
    "productCount": 32
  },
  {
    "id": "12",
    "name": "Majayjay",
    "icon": "assets/images/categories/majayjay.jpg",
    "description": "Local weaving and traditional cloth making",
    "productCount": 36
  },
  {
    "id": "13",
    "name": "Nagcarlan",
    "icon": "assets/images/categories/nagcarlan.jpg",
    "description": "Abaca weaving and native delicacies packaging",
    "productCount": 44
  },
  {
    "id": "14",
    "name": "Paete",
    "icon": "assets/images/categories/paete.jpg",
    "description": "Woodcarving, papier-mâché, and sculptures",
    "productCount": 85
  },
  {
    "id": "15",
    "name": "Pagsanjan",
    "icon": "assets/images/categories/pagsanjan.jpg",
    "description": "Beaded jewelry and souvenir crafts",
    "productCount": 47
  },
  {
    "id": "16",
    "name": "Pakil",
    "icon": "assets/images/categories/pakil.jpg",
    "description": "Wooden bags, sculptures, and traditional crafts",
    "productCount": 50
  },
  {
    "id": "17",
    "name": "Pangil",
    "icon": "assets/images/categories/pangil.jpg",
    "description": "Handmade bamboo products and local crafts",
    "productCount": 29
  },
  {
    "id": "18",
    "name": "San Pablo",
    "icon": "assets/images/categories/san-pablo.jpg",
    "description": "Paper crafts and modern creative arts",
    "productCount": 63
  },
  {
    "id": "19",
    "name": "Santa Cruz",
    "icon": "assets/images/categories/santa-cruz.jpg",
    "description": "Jewelry and handmade accessories",
    "productCount": 52
  },
  {
    "id": "20",
    "name": "Siniloan",
    "icon": "assets/images/categories/siniloan.jpg",
    "description": "Traditional handicrafts and agricultural products",
    "productCount": 41
  },
  {
    "id": "21",
    "name": "Victoria",
    "icon": "assets/images/categories/victoria.jpg",
    "description": "Pottery and local handcrafts",
    "productCount": 39
  }
];


const CategoryGrid = () => {
  return (
    <div className="w-full bg-[#fefefe] py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Discover unique handcrafted items across Laguna
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {categories.map((category) => (
            <Link
              to={`/category/${category.id}`}
              key={category.id}
              className="block transition-transform hover:scale-105 w-full max-w-sm"
            >
              <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg">
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 italic">
                      No image available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-xl">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.productCount} products</p>
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
    </div>
  );
};

export default CategoryGrid;
