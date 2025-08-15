import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

const categories = [
  {
    "id": "1",
    "name": "Alaminos",
    "icon": "https://www.google.com/imgres?q=alaminos%20place%20laguna&imgurl=https%3A%2F%2Fi.ytimg.com%2Fvi%2F36r6IjMj0bw%2Fmaxresdefault.jpg&imgrefurl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D36r6IjMj0bw&docid=faypCmRs17tmcM&tbnid=Pr2_R8Le8jiwHM&vet=12ahUKEwiX946fs42PAxVAhq8BHRSNHpYQM3oECCgQAA..i&w=1280&h=720&hcb=2&ved=2ahUKEwiX946fs42PAxVAhq8BHRSNHpYQM3oECCgQAA",
    "description": "Woven pandan bags and local handicrafts",
    "productCount": 55
  },
  {
    "id": "2",
    "name": "Bay",
    "icon": "https://primer.com.ph/wp-content/uploads/2016/09/DSC_3070.jpg",
    "description": "Traditional pottery and handcrafted clay items",
    "productCount": 92
  },
  {
    "id": "3",
    "name": "Biñan",
    "icon": "https://3.bp.blogspot.com/-i_Y8w1o8VnU/V-kMvM434ZI/AAAAAAAAAFc/Q5G7gU95y9gt2rR9D-xH4xN8J8n-5t4sgCLcB/s1600/tsinelas.JPG",
    "description": "Handmade slippers and footwear",
    "productCount": 115
  },
  {
    "id": "4",
    "name": "Calamba",
    "icon": "https://i0.wp.com/www.mycitymysm.com/wp-content/uploads/2021/08/my-city-my-sm-my-craft-calamba-laguna-14.jpg?fit=1280%2C978&ssl=1",
    "description": "Hand-painted ceramics and pottery",
    "productCount": 120
  },
  {
    "id": "5",
    "name": "Calauan",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/pineapple-7.jpg",
    "description": "Pineapple-themed souvenirs and local goods",
    "productCount": 48
  },
  {
    "id": "6",
    "name": "Cavinti",
    "icon": "",
    "description": "Bamboo crafts and wooden souvenirs",
    "productCount": 35
  },
  {
    "id": "7",
    "name": "Famy",
    "icon": "",
    "description": "Handmade local delicacies and food products",
    "productCount": 28
  },
  {
    "id": "8",
    "name": "Los Baños",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/buko-pie-11.jpg",
    "description": "Handmade fruit tarts and pastries",
    "productCount": 78
  },
  {
    "id": "9",
    "name": "Luisiana",
    "icon": "https://i0.wp.com/lakbaykalikasan.files.wordpress.com/2012/03/pandan-products-in-luisiana.jpg?w=640",
    "description": "Intricately woven pandan bags and mats",
    "productCount": 85
  },
  {
    "id": "10",
    "name": "Lumban",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/Lumban-Embroidery.jpg",
    "description": "Delicate embroidered garments and linens",
    "productCount": 130
  },
  {
    "id": "11",
    "name": "Magdalena",
    "icon": "",
    "description": "Handcrafted baskets and woven items",
    "productCount": 40
  },
  {
    "id": "12",
    "name": "Majayjay",
    "icon": "",
    "description": "Baked goods and traditional rice cakes",
    "productCount": 52
  },
  {
    "id": "13",
    "name": "Nagcarlan",
    "icon": "",
    "description": "Hand-carved wooden sculptures and items",
    "productCount": 65
  },
  {
    "id": "14",
    "name": "Paete",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/paete-woodcarving-1024x682.jpg",
    "description": "Handcrafted wooden items and furniture",
    "productCount": 105
  },
  {
    "id": "15",
    "name": "Pagsanjan",
    "icon": "https://static.wixstatic.com/media/132408_099cf109f3de4d668853b3dfa2f5f142~mv2.jpg/v1/fit/w_500,h_500,q_90/132408_099cf109f3de4d668853b3dfa2f5f142~mv2.jpg",
    "description": "Souvenirs and miniature boat replicas",
    "productCount": 98
  },
  {
    "id": "16",
    "name": "Pakil",
    "icon": "https://i0.wp.com/thehappytraveler.net/wp-content/uploads/2019/11/IMG_0411.jpg?resize=800%2C600&ssl=1",
    "description": "Handmade paper goods and stationery",
    "productCount": 45
  },
  {
    "id": "17",
    "name": "Pangil",
    "icon": "",
    "description": "Handmade natural fiber baskets and wares",
    "productCount": 32
  },
  {
    "id": "18",
    "name": "San Pablo",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/souvenirs-1.jpg",
    "description": "Local products and crafts inspired by the seven lakes",
    "productCount": 88
  },
  {
    "id": "19",
    "name": "Santa Cruz",
    "icon": "https://primer.com.ph/travel/wp-content/uploads/sites/6/2019/07/kesong-puti.jpg",
    "description": "Fresh, handcrafted local cheese (kesong puti)",
    "productCount": 75
  },
  {
    "id": "20",
    "name": "Siniloan",
    "icon": "",
    "description": "Hand-woven baskets and home accessories",
    "productCount": 58
  },
  {
    "id": "21",
    "name": "Victoria",
    "icon": "https://laguna.gov.ph/wp-content/uploads/2022/07/victorias-salted-duck-egg-768x512.jpg",
    "description": "Handmade salted duck eggs and other delicacies",
    "productCount": 69
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
