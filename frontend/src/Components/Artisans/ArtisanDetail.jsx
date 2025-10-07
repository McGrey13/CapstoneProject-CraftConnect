import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import MessengerPopup from "../Messenger/MessengerPopup";

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        // Fetch artisan details
        const res = await fetch(`http://localhost:8000/api/sellers/${id}/details`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (!data || !data.user) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setArtisan({
          id: data.id,
          name: data.user.userName,
          location: data.user.userCity && data.user.userProvince 
            ? `${data.user.userCity}, ${data.user.userProvince}`
            : data.user.userAddress || "Unknown",
          specialty: data.specialty || "Crafts",
          story: data.story || "",
          videoUrl: data.video_url || "",
          image: (() => {
            // Prioritize profile_picture_path from seller data
            if (data.profile_picture_path) {
              const imageUrl = `http://localhost:8000/storage/${data.profile_picture_path}`;
              console.log("Using seller profile_picture_path:", imageUrl);
              return imageUrl;
            }
            // Fallback to user profile_photo_url
            if (data.user.profile_photo_url && data.user.profile_photo_url.trim() !== "") {
              console.log("Using user profile_photo_url:", data.user.profile_photo_url);
              return data.user.profile_photo_url;
            }
            // Default fallback
            console.log("Using default avatar");
            return "https://api.dicebear.com/7.x/avataaars/svg?seed=artisan";
          })(),
        });
        
        const mappedProducts = (data.products || []).map((p) => ({
          id: p.id,
          title: p.productName,
          price: p.productPrice,
          image: p.productImage || "",
        }));
        setArtisanProducts(mappedProducts);

        // Fetch store data for this artisan
        try {
          const storeRes = await fetch(`http://localhost:8000/api/sellers/${id}/store`, {
            headers: { Accept: "application/json" },
          });
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            console.log("Store data received:", storeData);
            console.log("Seller data:", storeData.seller);
            console.log("Rating:", storeData.seller?.average_rating);
            console.log("Total ratings:", storeData.seller?.total_ratings);
            console.log("Followers:", storeData.seller?.followers_count);
            console.log("User City:", storeData.seller?.user?.userCity);
            console.log("User Province:", storeData.seller?.user?.userProvince);
            console.log("User Address:", storeData.seller?.user?.userAddress);
            setStoreData(storeData);
          } else {
            console.log("No store found for this artisan");
            setStoreData(null);
          }
        } catch (storeError) {
          console.log("Error fetching store data:", storeError);
          setStoreData(null);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();
  }, [id]);

  // Follow/Unfollow functionality
  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to follow sellers');
        return;
      }

      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`http://localhost:8000/api/sellers/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update followers count in storeData
        if (storeData?.seller) {
          const newCount = storeData.seller.followers_count + (isFollowing ? -1 : 1);
          setStoreData(prev => ({
            ...prev,
            seller: {
              ...prev.seller,
              followers_count: newCount
            }
          }));
        }
      } else {
        console.error('Failed to follow/unfollow seller');
      }
    } catch (error) {
      console.error('Error following/unfollowing seller:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Message functionality
  const handleMessage = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to send messages');
        return;
      }

      // Show the messenger popup
      setShowMessenger(true);
    } catch (error) {
      console.error('Error initiating message:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-gray-600 mb-4">Loading...</p>
      </div>
    );
  }

  if (notFound || !artisan) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-red-600 mb-4">Artisan not found.</p>
        <Link to="/artisan">
          <Button variant="outline">Back to Artisans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-6 max-w-6xl pt-8">
        <Link
          to="/artisan"
          className="inline-flex items-center mb-8 text-blue-600 hover:text-blue-800 transition-colors font-semibold cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Artisans
        </Link>
      </div>

      {/* Always use the new WYSIWYG design from StorefrontCustomizer */}
        <ArtisanStorePreview 
          storeData={storeData} 
          artisan={artisan}
          artisanProducts={artisanProducts}
          videoUrl={artisan.videoUrl}
          onFollow={handleFollow}
          onMessage={handleMessage}
          isFollowing={isFollowing}
          isLoading={isLoading}
        />
        
        {/* Messenger Popup */}
        <MessengerPopup
          isOpen={showMessenger}
          onClose={() => setShowMessenger(false)}
          sellerId={id}
          sellerUserId={storeData?.seller?.user?.userID}
          sellerName={artisan?.name}
          sellerAvatar={storeData?.logo_url || artisan?.image}
        />
    </div>
  );
};

// Artisan Store Preview Component (using StorefrontCustomizer WYSIWYG design)
const ArtisanStorePreview = ({ storeData, artisan, artisanProducts, videoUrl, onFollow, onMessage, isFollowing, isLoading }) => {
  // Use real store customization data from database
  const customization = {
    primary_color: storeData?.store?.primary_color || "#6366f1",
    secondary_color: storeData?.store?.secondary_color || "#f43f5e",
    background_color: storeData?.store?.background_color || "#ffffff",
    text_color: storeData?.store?.text_color || "#1f2937",
    accent_color: storeData?.store?.accent_color || "#0ea5e9",
    heading_font: storeData?.store?.heading_font || "Inter",
    body_font: storeData?.store?.body_font || "Inter",
    heading_size: storeData?.store?.heading_size || 18,
    body_size: storeData?.store?.body_size || 16,
    show_hero_section: storeData?.store?.show_hero_section ?? true,
    show_featured_products: storeData?.store?.show_featured_products ?? true,
    desktop_columns: storeData?.store?.desktop_columns || 4,
    mobile_columns: storeData?.store?.mobile_columns || 2,
    product_card_style: storeData?.store?.product_card_style || "minimal",
  };

  const imagePreviews = {
    logo: storeData?.logo_url,
    background: storeData?.background_url,
  };

  // Use real store data from database with proper location formatting
  console.log("ArtisanStorePreview - storeData:", storeData);
  console.log("ArtisanStorePreview - seller data:", storeData?.seller);
  console.log("ArtisanStorePreview - rating from DB:", storeData?.seller?.average_rating);
  console.log("ArtisanStorePreview - total ratings from DB:", storeData?.seller?.total_ratings);
  console.log("ArtisanStorePreview - followers from DB:", storeData?.seller?.followers_count);
  console.log("ArtisanStorePreview - user city:", storeData?.seller?.user?.userCity);
  console.log("ArtisanStorePreview - user province:", storeData?.seller?.user?.userProvince);
  console.log("ArtisanStorePreview - user address:", storeData?.seller?.user?.userAddress);

  const store = {
    name: storeData?.store?.store_name || `${artisan.name}'s Store`,
    logo: imagePreviews.logo || "https://api.dicebear.com/7.x/avataaars/svg?seed=store",
    banner: imagePreviews.background || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    rating: storeData?.seller?.average_rating || 0.0,
    followers: storeData?.seller?.followers_count || 0,
    location: storeData?.seller?.user?.userCity && storeData?.seller?.user?.userProvince 
      ? `${storeData.seller.user.userCity}, ${storeData.seller.user.userProvince}`
      : storeData?.seller?.user?.userAddress || artisan.location || "Location not specified",
    yearsActive: storeData?.seller?.created_at ? Math.floor((new Date() - new Date(storeData.seller.created_at)) / (1000 * 60 * 60 * 24 * 365)) : 2,
    description: storeData?.store?.store_description || `Discover amazing products crafted by ${artisan.name}`,
    categories: storeData?.store?.category ? [storeData.store.category] : ["Handcrafted", "Artisan", "Unique"],
  };

  console.log("ArtisanStorePreview - final store object:", store);

  // Transform real artisan products to match the expected format
  const products = artisanProducts.map((product, index) => ({
    id: product.id,
    name: product.title,
    price: `₱${Number(product.price).toFixed(2)}`,
    image: product.image || null, // Use null for placeholder
    category: store.categories[0] || "Handcrafted",
    rating: 4.5 + (index * 0.1),
    isNew: index < 2,
    discount: index === 1 ? 15 : null,
    oldPrice: index === 1 ? `₱${Number(product.price * 1.18).toFixed(2)}` : null,
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: customization.background_color }}>
      {/* Banner with overlay */}
      <div className="relative w-full h-60 md:h-72 lg:h-80 overflow-hidden">
        <img src={store.banner} alt="Store Banner" className="w-full h-full object-cover" />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `linear-gradient(to bottom, ${customization.primary_color}cc, ${customization.background_color}cc)` 
          }} 
        />
        <div className="absolute left-8 bottom-8 flex items-center gap-6">
          <div className="-mt-24">
            <div 
              className="w-32 h-32 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white"
              style={{ backgroundColor: customization.background_color }}
            >
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 
              className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2"
              style={{ 
                fontFamily: customization.heading_font,
                fontSize: `${customization.heading_size * 2.5}px`
              }}
            >
              {storeData?.store?.store_name || "Store Name"}
            </h1>
            <p 
              className="text-xl font-medium text-white drop-shadow-lg mb-4"
              style={{ 
                fontFamily: customization.body_font,
                fontSize: `${customization.body_size * 1.2}px`
              }}
            >
              by {artisan.name}
            </p>
            <div className="flex flex-wrap gap-3 mb-2">
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {store.rating > 0 ? `${store.rating} (${storeData?.seller?.total_ratings || 0} reviews)` : 'No ratings yet'}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                {store.followers > 0 ? `${store.followers.toLocaleString()} followers` : '0 followers'}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {store.location}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {store.yearsActive} years active
              </span>
            </div>
          </div>
        </div>
        <div className="absolute right-8 top-8 flex gap-3">
          <button 
            className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: customization.background_color, 
              color: customization.primary_color,
              borderColor: customization.primary_color
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }
            }}
            onClick={onFollow}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
          </button>
          <button 
            className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
            style={{ 
              backgroundColor: customization.background_color, 
              color: customization.primary_color,
              borderColor: customization.primary_color
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = customization.accent_color;
              e.target.style.color = customization.text_color;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = customization.background_color;
              e.target.style.color = customization.primary_color;
            }}
            onClick={onMessage}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Message
                  </button>
          <button 
            className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
            style={{ 
              backgroundColor: customization.background_color, 
              color: customization.primary_color,
              borderColor: customization.primary_color
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = customization.accent_color;
              e.target.style.color = customization.text_color;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = customization.background_color;
              e.target.style.color = customization.primary_color;
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
                  </button>
                </div>
              </div>

      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-8 z-10 relative">
        <div 
          className="rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4"
          style={{ backgroundColor: customization.background_color }}
        >
          <div className="flex-1">
            <p 
              className="text-2xl font-semibold mb-2"
              style={{ 
                color: customization.text_color,
                fontFamily: customization.heading_font,
                fontSize: `${customization.heading_size * 1.3}px`
              }}
            >
              Discover amazing products crafted by {artisan.name}
            </p>
            {storeData?.store?.store_description && (
              <p 
                className="text-base font-medium mb-4"
                style={{ 
                  color: customization.text_color,
                  fontFamily: customization.body_font,
                  fontSize: `${customization.body_size}px`
                }}
              >
                {storeData.store.store_description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {store.categories.map((cat) => (
                <span 
                  key={cat} 
                  className="font-semibold px-4 py-1 rounded-full text-sm shadow"
                  style={{ 
                    backgroundColor: customization.accent_color, 
                    color: customization.text_color 
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
            </div>
            
      {/* Search, Filters, Sort Bar */}
      <div 
        className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row items-center gap-4 rounded-xl shadow p-6"
        style={{ backgroundColor: customization.background_color }}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full px-5 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg"
              style={{ 
                borderColor: customization.accent_color,
                backgroundColor: customization.background_color,
                color: customization.text_color
              }}
            />
            <span className="absolute left-3 top-3.5 text-lg" style={{ color: customization.text_color }}></span>
                      </div>
          <button 
            className="px-4 py-2 rounded-lg font-semibold border transition"
            style={{ 
              backgroundColor: customization.accent_color,
              color: customization.text_color,
              borderColor: customization.accent_color
            }}
          >
            Filters
          </button>
                      </div>
        <select 
          className="px-4 py-2 rounded-lg border font-semibold"
          style={{ 
            borderColor: customization.accent_color,
            backgroundColor: customization.background_color,
            color: customization.text_color
          }}
        >
          <option>All</option>
        </select>
        <div className="font-semibold" style={{ color: customization.text_color }}>
          {products.length} products
                    </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: customization.text_color }}>Sort:</span>
          <select 
            className="px-2 py-1 rounded-lg border font-semibold"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <option>Most Popular</option>
          </select>
          <button 
            className="p-2 rounded-lg border transition"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className="p-2 rounded-lg border transition"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="3" rx="1.5" fill="currentColor"/>
              <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/>
              <rect x="3" y="18" width="18" height="3" rx="1.5" fill="currentColor"/>
            </svg>
                      </button>
                    </div>
                  </div>

      {/* Product Grid */}
      <div 
        className="max-w-6xl mx-auto mt-8 mb-16 grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${Math.min(customization.desktop_columns, 4)}, 1fr)`
        }}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div
                className="rounded-2xl shadow p-5 flex flex-col relative group transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{ 
                  minHeight: 450,
                  backgroundColor: customization.background_color
                }}
              >
                {product.isNew && (
                  <span 
                    className="absolute top-3 left-3 font-bold px-3 py-1 rounded-full text-xs shadow transition"
                    style={{ 
                      backgroundColor: customization.accent_color,
                      color: customization.text_color
                    }}
                  >
                    New
                        </span>
                )}
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow group-hover:bg-red-400 transition">-{product.discount}%</span>
                )}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl mb-5 group-hover:brightness-95 group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 rounded-xl mb-5 flex items-center justify-center group-hover:bg-gray-300 transition duration-300">
                    <div className="text-center text-gray-500">
                      <svg className="w-14 h-14 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium">No Image</p>
                    </div>
                  </div>
                )}
                <div
                  className="text-xs font-bold mb-1 uppercase inline-block px-2 py-1 rounded transition"
                  style={{ 
                    
                    letterSpacing: 1,
                    color: customization.primary_color,
                    backgroundColor: `${customization.accent_color}20`
                  }}
                >
                  {product.category}
                </div>
                <h3 
                  className="font-semibold text-lg mb-2 transition"
                  style={{ 
                    color: customization.text_color,
                    fontFamily: customization.heading_font,
                    fontSize: `${customization.heading_size * 1.1}px`
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={i} className="text-yellow-500 drop-shadow">★</span>
                  ))}
                  {product.rating % 1 !== 0 && <span className="text-yellow-500 drop-shadow">★</span>}
                  <span className="text-xs ml-1" style={{ color: customization.text_color }}>({product.rating})</span>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span 
                    className="font-bold text-xl transition"
                    style={{ 
                      color: customization.primary_color,
                      fontSize: `${customization.heading_size * 1.3}px`
                    }}
                  >
                    {product.price}
                  </span>
                  {product.oldPrice && <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>}
            </div>
                <button
                  className="mt-auto w-full font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 text-base"
                  style={{ 
                    backgroundColor: customization.accent_color,
                    color: customization.text_color,
                    focusRingColor: customization.accent_color
                  }}
                >
                  View Product
              </button>
            </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 " >
            <p className="text-lg" style={{ color: customization.text_color }}>
              No products available yet.
            </p>
          </div>
        )}
        </div>
    </div>
  );
};

export default ArtisanDetail;