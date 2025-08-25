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

// --- Full Mock Products --
// src/Components/product/ProductsPage.jsx

export const mockProducts = [
  {
    id: "prod-1",
    artisanId: "art-1",
    title: "Handcrafted Wooden Mug",
    price: "1,200",
    image: "/image/productspage/mug.jpg",
    isFeatured: true,
    category: "Ceramics",
    artisanName: "Sarah",
    description: "Beautiful handcrafted mug for your morning coffee or tea.",
    features: ["Handcrafted", "Microwave safe", "12 oz capacity"],
    images: [
      "/image/productspage/mug2.jpg",
      "/image/productspage/mug3.jpg",
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
    image: "/image/productspage/signaturestamp.jpg",
    isFeatured: true,
    category: "Accessories",
    artisanName: "Ceasar",
    description: "A custom hand-carved rubber stamp for your signature.",
    features: ["Customizable", "Durable rubber", "Ergonomic wooden handle"],
    images: [
      "/image/productspage/stamp2.jpg",
      "/image/productspage/stamp3.jpg",
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
    image: "/image/productspage/house.jpg",
    isFeatured: false,
    category: "Miniature Models",
    artisanName: "Alex Manalo",
    description: "A meticulously crafted miniature model of Jose Rizal's ancestral house.",
    features: ["Handmade", "Detailed craftsmanship", "Historical piece"],
    images: [
      "/image/productspage/house2.jpg",
      "/image/productspage/house.jpg"
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
    image: "/image/productspage/kaleidoscope.jpg",
    isFeatured: false,
    category: "Toys",
    artisanName: "Alex Manalo",
    description: "A handmade kaleidoscope with unique and beautiful patterns.",
    features: ["Handmade", "Unique patterns", "Durable materials"],
    images: [
      "/image/productspage/kaleidoscope.jpg",
      "/image/productspage/Kaleidoscope3.JPG",
    ],
    reviews: [
      { id: 6, name: "Chris Tan", rating: 4, date: "2024-06-25", comment: "My kids love it! The patterns are so mesmerizing.", verified: true },
      { id: 7, name: "Diana Garcia", rating: 5, date: "2024-07-01", comment: "Excellent craftsmanship. A great gift.", verified: false },
    ],
  },
  {
  id: "prod-5",
  artisanId: "art-2",
  title: "Wooven Container",
  price: "950",
  image: "/image/productspage/wovencontainer.jpg",
  isFeatured: true,
  category: "Home Decor",
  artisanName: "Renel Batralo",
  description: "A handcrafted insulated cover for 5-gallon water containers, made from native woven materials. Combines traditional design with everyday function.",
  features: ["Handwoven", "Insulated", "Eco-friendly", "Fits standard 5-gallon jugs"],
  images: [
    "/image/productspage/container.jpg",
    "/image/productspage/wovencontainer.jpg"
  ],
  reviews: [
    {
      id: 6,
      name: "Jonas Reyes",
      rating: 5,
      date: "2025-03-12",
      comment: "Keeps our water cool and looks great in the kitchen!",
      verified: true
    },
    {
      id: 7,
      name: "Grace Uy",
      rating: 4,
      date: "2025-06-01",
      comment: "Beautiful craftsmanship, but the strap could be a bit sturdier.",
      verified: true
    }
  ],
},
{
  id: "prod-6",
  artisanId: "art-3",
  title: "Handwoven Bayong Bag with Floral Accents",
  price: "750",
  image: "/image/productspage/bag2.jpg",
  isFeatured: true,
  category: "Bags",
  artisanName: "Renel Batralo",
  description: "A stylish handwoven bayong-style handbag made from native materials, decorated with red and blue fabric flowers and pearl accents. Perfect for both casual use and cultural events.",
  features: [
    "Handwoven",
    "Eco-friendly native materials",
    "Crocheted flower embellishments",
    "Sturdy wooden handles"
  ],
  images: [
    "/image/productspage/bag.jpg",
    "/image/productspage/bag2.jpg"
  ],
  reviews: [
    {
      id: 10,
      name: "Ana Santos",
      rating: 5,
      date: "2025-07-08",
      comment: "Beautiful and proudly Filipino! I get compliments every time I use it.",
      verified: true
    },
    {
      id: 11,
      name: "Monique Tan",
      rating: 4,
      date: "2025-08-10",
      comment: "Love the design, just wish it had a zipper or lining inside.",
      verified: true
    }
  ]
},
{
  id: "prod-7",
  artisanId: "art-4",
  title: "Handwoven Tissue Box Cover",
  price: "280",
  image: "/image/productspage/tissue.jpg",
  isFeatured: false,
  category: "Home Decor",
  artisanName: "Renel Batralo",
  description: "A handcrafted tissue box cover made from native fibers, perfect for adding a rustic and natural touch to any room.",
  features: [
    "Made from abaca or raffia fiber",
    "Fits standard rectangular tissue boxes",
    "Eco-friendly and reusable",
    "Decorative and lightweight"
  ],
  images: [
    "/image/productspage/tissue.jpg",
    "/image/productspage/tissue2.jpg"
  ],
  reviews: [
    {
      id: 12,
      name: "Leo Gutierrez",
      rating: 5,
      date: "2025-05-29",
      comment: "Simple, elegant, and proudly Filipino. Looks great in our sala.",
      verified: true
    },
    {
      id: 13,
      name: "Mia Valdez",
      rating: 4,
      date: "2025-08-03",
      comment: "Beautiful piece! Just wish there were more color options.",
      verified: true
    }
  ]
},
{
  "id": "prod-8",
  "artisanId": "art-3",
  "title": "Framed Indigenous Woven Textile",
  "price": "3,500",
  "image": "/image/productspage/textile.jpg",
  "isFeatured": false,
  "category": "Textiles",
  "artisanName": "Renel Batralo",
  "description": "A beautifully handwoven indigenous textile, traditionally crafted by skilled artisans. This framed piece showcases intricate patterns inspired by Filipino tribal heritage.",
  "features": [
    "Handwoven",
    "Traditional craftsmanship",
    "Ethnic design",
    "Perfect for home decor"
  ],
  "images": [
    "/image/productspage/wallart.jpg",
    "/image/productspage/wallart2.jpg"
  ],
  "reviews": [
    {
      "id": 7,
      "name": "Juan Santos",
      "rating": 5,
      "date": "2024-06-10",
      "comment": "An exquisite piece of Filipino culture and art. Truly unique and beautifully made.",
      "verified": true
    }
  ]
},
{
  id: "prod-9",
  artisanId: "art-5",
  title: "Miniature Religious Costume for Santo Niño",
  price: "320",
  image: "/image/productspage/stonino.jpg",
  isFeatured: false,
  category: "Religious Items",
  artisanName: "Baby Mae",
  description: "A handmade miniature religious costume designed for Santo Niño statues. Crafted from satin fabric and adorned with intricate gold lace, this traditional vestment is perfect for home altars and religious celebrations.",
  features: [
    "Hand-sewn",
    "Satin fabric with gold lace trim",
    "Fits standard Santo Niño statues",
    "Perfect for fiestas, Sinulog, and devotions"
  ],
  images: [
    "/image/productspage/stonino.jpg",
    "/image/productspage/stonino2.jpg"
  ],
  reviews: [
    {
      id: 14,
      name: "Carmen Aguilar",
      rating: 5,
      date: "2025-01-20",
      comment: "Beautifully made! My Santo Niño looks regal in this.",
      verified: true
    },
    {
      id: 15,
      name: "Nestor Padilla",
      rating: 4,
      date: "2025-07-02",
      comment: "Good quality and arrived on time for the fiesta.",
      verified: true
    }
  ]
},
{
  id: "prod-10",
  artisanId: "art-6",
  title: "Filipino Tribal-Inspired Necklaces",
  price: "150",
  image: "/image/productspage/necklace.jpg",
  isFeatured: false,
  category: "Accessories",
  artisanName: "Baby Mae",
  description: "Handcrafted tribal-style necklaces made from wooden beads and natural materials. Inspired by indigenous Filipino designs, perfect for cultural events or as a unique accessory.",
  features: [
    "Handmade from wooden beads",
    "Ethnic and tribal design",
    "Lightweight and durable",
    "Great for costumes, events, or everyday wear"
  ],
  images: [
    "/image/productspage/necklace2.jpg",
    "/image/productspage/necklace.jpg"
  ],
  reviews: [
    {
      id: 16,
      name: "Ella Ramos",
      rating: 5,
      date: "2025-06-30",
      comment: "Beautiful piece with cultural charm. Perfect for my event outfit!",
      verified: true
    },
    {
      id: 17,
      name: "Jayvee Torres",
      rating: 4,
      date: "2025-08-01",
      comment: "Nice craftsmanship. Would love more color options!",
      verified: true
    }
  ]
}, 
{
  id: "prod-11",
  artisanId: "art-7",
  title: "Handcrafted Ceramic Mug",
  price: "450",
  image: "/image/productspage/ceramics.jpg",
  isFeatured: true,
  category: "Ceramics",
  artisanName: "Lara Gomez",
  description: "A beautifully handcrafted ceramic mug, perfect for your morning coffee or tea. Each piece is uniquely glazed and shaped by local potters using traditional techniques.",
  features: [
    "Handmade ceramic",
    "Heat-resistant and microwave-safe",
    "Smooth glaze finish",
    "Ideal for hot or cold drinks"
  ],
  images: [
    "/image/productspage/ceramics.jpg",
    "/image/productspage/ceramics2.jpg"
  ],
  reviews: [
    {
      id: 18,
      name: "Paolo Mendoza",
      rating: 5,
      date: "2025-08-10",
      comment: "Solid craftsmanship and a cozy feel. My favorite mug at home!",
      verified: true
    },
    {
      id: 19,
      name: "Tina Alonzo",
      rating: 4,
      date: "2025-08-21",
      comment: "Very nice design. Wish it came in a bigger size though.",
      verified: true
    }
  ]
},
{
  id: "prod-12",
  artisanId: "art-8",
  title: "Handmade Earrings",
  price: "350",  
  image: "/image/productspage/earings.jpg",
  isFeatured: false,
  category: "accessories",
  artisanName: "Renel Batralo",  
  description: "Unique handmade earrings crafted with natural materials, perfect for adding a touch of artisan charm to any outfit.",
  features: [
    "Handmade with natural materials",
    "Lightweight and comfortable",
    "Unique and one-of-a-kind designs",
    "Perfect for casual and formal wear"
  ],
  images: [
    "/image/productspage/earings.jpg",
    "/image/productspage/earings.jpg"
  ],
  reviews: [
    {
      id: 21,
      name: "Anna Cruz",
      rating: 5,
      date: "2025-08-15",
      comment: "Beautiful craftsmanship and very comfortable to wear!",
      verified: true
    },
    {
      id: 22,
      name: "Jason Lim",
      rating: 4,
      date: "2025-08-18",
      comment: "Lovely design, perfect for everyday use.",
      verified: true
    }
  ]
}
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

  const categories = ["all", "ceramics", "textiles", "woodwork", "accessories", "home decor", "toys", "miniature models", "religious items", "bags"];

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
