import React from "react";
import { Star, MessageCircle, Heart, Share2, MapPin, Calendar, Users } from "lucide-react";


const StoreView = () => {
  // Example data (replace with dynamic props or API call)
  const store = {
    name: "Artisan Crafts Co.",
    logo: "https://randomuser.me/api/portraits/men/32.jpg",
    banner: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    followers: 1250,
    location: "Portland, Oregon",
    yearsActive: 5,
    description:
      "Handcrafted items made with love and attention to detail. We specialize in unique, one-of-a-kind pieces that bring joy and beauty to your home.",
    categories: ["Home Decor", "Jewelry", "Ceramics", "Textiles"],
  };

  const products = [
    {
      id: 1,
      name: "Handcrafted Ceramic Mug",
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      category: "Ceramics",
      rating: 4.5,
      isNew: true,
    },
    {
      id: 2,
      name: "Woven Wall Hanging",
      price: "$76.49",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      category: "Textiles",
      rating: 4.8,
      discount: 15,
      oldPrice: "$89.99",
    },
    {
      id: 3,
      name: "Wooden Cutting Board",
      price: "$49.99",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      category: "Woodwork",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Hand-poured Candle",
      price: "$18.99",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80",
      category: "Home Goods",
      rating: 4.3,
      isNew: true,
    },
  ];


  return (
    <div className="min-h-screen bg-[#fdf6e3]">
      {/* Professional Back Button */}
      <div className="max-w-5xl mx-auto pt-8 pb-2 flex items-center">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-3 py-2 bg-white/80 text-[#a67c68] rounded-full font-semibold border border-[#ffe082] shadow-md hover:bg-[#ffe082] hover:text-[#7c4f2c] focus:outline-none focus:ring-2 focus:ring-[#ffe082] transition-all duration-200 backdrop-blur-md"
          style={{ boxShadow: '0 2px 8px 0 rgba(166,124,104,0.08)' }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="-ml-1 group-hover:-translate-x-1 transition-transform duration-200"><circle cx="12" cy="12" r="12" fill="#ffe082" className="opacity-0 group-hover:opacity-30 transition"/><path d="M15 19l-7-7 7-7" stroke="#a67c68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden sm:inline-block">Back</span>
        </button>
      </div>
      {/* Banner with overlay */}
      <div className="relative w-full h-60 md:h-72 lg:h-80 overflow-hidden">
        <img src={store.banner} alt="Store Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#a67c68cc] to-[#fdf6e3cc]" />
        <div className="absolute left-8 bottom-8 flex items-center gap-6">
          <div className="-mt-24">
            <div className="w-32 h-32 rounded-2xl bg-[#fdf6e3] shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">{store.name}</h1>
            <div className="flex flex-wrap gap-3 mb-2">
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Star className="w-5 h-5 text-yellow-500" /> {store.rating} rating</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Users className="w-5 h-5" /> {store.followers.toLocaleString()} followers</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><MapPin className="w-5 h-5" /> {store.location}</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Calendar className="w-5 h-5" /> {store.yearsActive} years active</span>
            </div>
          </div>
        </div>
        <div className="absolute right-8 top-8 flex gap-3">
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><Heart className="w-5 h-5" /> Follow</button>
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><MessageCircle className="w-5 h-5" /> Message</button>
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-8 z-10 relative">
        <div className="bg-[#fffbe6] rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#a67c68] text-lg font-medium mb-3">{store.description}</p>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((cat) => (
                <span key={cat} className="bg-[#ffe082] text-[#a67c68] font-semibold px-4 py-1 rounded-full text-sm shadow">{cat}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters, Sort Bar */}
      <div className="max-w-5xl mx-auto mt-8 flex flex-col md:flex-row items-center gap-4 bg-[#fffbe6] rounded-xl shadow p-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-full">
            <input type="text" placeholder="Search products..." className="w-full px-4 py-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] focus:outline-none focus:ring-2 focus:ring-[#ffe082]" />
            <span className="absolute left-2 top-2.5 text-[#a67c68]">🔍</span>
          </div>
          <button className="px-4 py-2 bg-[#ffe082] text-[#a67c68] rounded-lg font-semibold border border-[#ffe082] hover:bg-[#f5e9da] transition">Filters</button>
        </div>
        <select className="px-4 py-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] font-semibold">
          <option>All</option>
        </select>
        <div className="text-[#a67c68] font-semibold">24 products</div>
        <div className="flex items-center gap-2">
          <span className="text-[#a67c68] font-semibold">Sort:</span>
          <select className="px-2 py-1 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] font-semibold">
            <option>Most Popular</option>
          </select>
          <button className="p-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] hover:bg-[#ffe082] transition"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" fill="#a67c68"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#a67c68"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#a67c68"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#a67c68"/></svg></button>
          <button className="p-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] hover:bg-[#ffe082] transition"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="3" rx="1.5" fill="#a67c68"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="#a67c68"/><rect x="3" y="18" width="18" height="3" rx="1.5" fill="#a67c68"/></svg></button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#fffbe6] rounded-2xl shadow p-4 flex flex-col relative group transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            style={{ minHeight: 400 }}
          >
            {product.isNew && (
              <span className="absolute top-3 left-3 bg-[#ffe082] text-[#a67c68] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#ffecb3] transition">New</span>
            )}
            {product.discount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow group-hover:bg-red-400 transition">-{product.discount}%</span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-xl mb-4 group-hover:brightness-95 group-hover:scale-105 transition duration-300"
            />
            <div
              className="text-xs font-bold text-[#a67c68] mb-1 uppercase inline-block px-2 py-1 rounded group-hover:bg-[#ffe082] group-hover:text-[#7c4f2c] transition"
              style={{ letterSpacing: 1 }}
            >
              {product.category}
            </div>
            <h3 className="font-semibold text-[#a67c68] text-lg mb-1 group-hover:text-[#7c4f2c] transition">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(Math.floor(product.rating))].map((_, i) => (
                <span key={i} className="text-yellow-500 drop-shadow">★</span>
              ))}
              {product.rating % 1 !== 0 && <span className="text-yellow-500 drop-shadow">★</span>}
              <span className="text-[#a67c68] text-xs ml-1">({product.rating})</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-[#a67c68] font-bold text-xl group-hover:text-[#7c4f2c] transition">{product.price}</span>
              {product.oldPrice && <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>}
            </div>
            <button
              className="mt-auto w-full bg-[#ffe082] text-[#a67c68] font-semibold py-2 rounded-lg shadow hover:bg-[#ffd54f] hover:text-[#7c4f2c] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffe082]"
            >
              View Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreView;
