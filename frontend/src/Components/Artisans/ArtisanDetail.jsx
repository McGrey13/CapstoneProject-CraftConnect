import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
          location: data.user.userAddress || "Unknown",
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

      {/* Store Preview with Customization */}
      {storeData ? (
        <ArtisanStorePreview 
          storeData={storeData} 
          artisan={artisan}
          artisanProducts={artisanProducts}
          videoUrl={artisan.videoUrl}
        />
      ) : (
        /* Fallback to original design if no store data */
        <div className="min-h-screen bg-white py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Artisan Info Section */}
            <div className="flex flex-col md:flex-row gap-10 bg-white rounded-xl border border-gray-300 shadow-sm p-8">
              <img
                src={artisan.image}
                alt={artisan.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-md self-center md:self-start"
                loading="lazy"
              />
              <div className="flex-1">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">{artisan.name}</h1>
                <p className="uppercase text-blue-600 font-semibold tracking-wide mb-6">
                  {artisan.location} &bull; {artisan.specialty}
                </p>
                <section className="max-w-prose text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    Artist's Story
                  </h2>
                  <p>{artisan.story}</p>
                </section>
              </div>
            </div>

            {/* Demo Video Container */}
            {artisan.videoUrl && (
              <section className="mt-14 max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-300 p-8">
                <h2 className="text-3xl font-semibold text-gray-800 border-b border-gray-300 pb-4 mb-6">
                  Demo Video
                </h2>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <iframe
                    src={artisan.videoUrl}
                    title={`${artisan.name} demo video`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </section>
            )}

            {/* Products Container */}
            <section className="mt-16 max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-300 p-8">
              <h2 className="text-3xl font-semibold text-gray-800 border-b border-gray-300 pb-4 mb-8">
                Products by {artisan.name}
              </h2>
              {artisanProducts.length === 0 ? (
                <p className="text-gray-500 text-lg text-center italic">No products available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {artisanProducts.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id}>
                      <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                          loading="lazy"
                        />
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.title}</h3>
                          <p className="text-blue-600 font-bold text-xl">₱{Number(product.price).toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

// Artisan Store Preview Component (exact same as StorefrontCustomizer)
const ArtisanStorePreview = ({ storeData, artisan, artisanProducts, videoUrl }) => {
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

  const previewStyle = {
    '--primary-color': customization.primary_color,
    '--secondary-color': customization.secondary_color,
    '--background-color': customization.background_color,
    '--text-color': customization.text_color,
    '--accent-color': customization.accent_color,
    '--heading-font': customization.heading_font,
    '--body-font': customization.body_font,
    '--heading-size': `${customization.heading_size}px`,
    '--body-size': `${customization.body_size}px`,
  };

  // Fallback data if storeData is not available
  const storeName = storeData?.store?.store_name || `${artisan.name}'s Store`;
  const storeDescription = storeData?.store?.store_description || `Discover amazing products crafted by ${artisan.name}`;
  const ownerName = storeData?.store?.owner_name || artisan.name;
  const ownerEmail = storeData?.store?.owner_email || "contact@store.com";
  const ownerPhone = storeData?.store?.owner_phone || "+63 123 456 7890";
  const ownerAddress = storeData?.store?.owner_address || artisan.location;

  return (
    <div className="store-preview min-h-screen" style={previewStyle}>
      <style>{`
        .store-preview {
          font-family: var(--body-font);
          color: var(--text-color);
          background-color: var(--background-color);
          ${imagePreviews.background ? `
            background-image: url('${imagePreviews.background}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
          ` : ''}
        }
        .store-preview h1, .store-preview h2, .store-preview h3 {
          font-family: var(--heading-font);
          font-size: var(--heading-size);
          color: var(--text-color);
          font-weight: 700;
        }
        .store-preview p, .store-preview span {
          font-size: var(--body-size);
          line-height: 1.6;
        }
        .store-preview .btn-primary {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .store-preview .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .store-preview .btn-secondary {
          background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .store-preview .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .store-preview .accent {
          color: var(--accent-color);
          font-weight: 600;
        }
        .store-preview .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .store-preview .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .store-preview .hero-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6));
          backdrop-filter: blur(2px);
        }
      `}</style>
      
      {/* Store Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              {imagePreviews.logo && (
                <div className="p-2 bg-white rounded-full shadow-md">
                  <img 
                    src={imagePreviews.logo} 
                    alt="Store Logo" 
                    className="h-10 w-10 object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
                <p className="text-sm text-gray-600">Premium Quality Products</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {customization.show_hero_section && (
        <div className="relative overflow-hidden">
          <div className="hero-overlay absolute inset-0 z-10"></div>
          <div className="relative z-20 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">
                  Welcome to {storeName}
                </h2>
                <p className="text-2xl mb-10 text-white/90 drop-shadow-md leading-relaxed">
                  {storeDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="btn-secondary px-10 py-5 rounded-xl text-xl font-bold">
                    Explore Products
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm text-black px-10 py-5 rounded-xl text-xl font-bold border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>
      )}

      {/* Featured Products */}
      {customization.show_featured_products && (
        <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4 text-gray-900">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
            </div>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${customization.desktop_columns} gap-8`}>
              {artisanProducts.length > 0 ? artisanProducts.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <div className="card group overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="relative z-10 text-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -20%
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        High-quality product with excellent features and durability
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold accent">₱{Number(product.price).toFixed(2)}</span>
                          <span className="text-lg text-gray-400 line-through">₱{Number(product.price * 1.25).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600">4.{index + 5}</span>
                        </div>
                      </div>
                      <button className="btn-primary w-full py-3 rounded-xl text-lg font-bold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              )) : (
                // Show placeholder products if no real products
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="card group overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <span className="text-2xl"></span>
                        </div>
                        <span className="text-gray-600 font-medium">Product Image {item}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -20%
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                        Premium Product {item}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        High-quality product with excellent features and durability
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold accent">₱{29.99 + item * 10}</span>
                          <span className="text-lg text-gray-400 line-through">₱{39.99 + item * 10}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600">4.{item + 5}</span>
                        </div>
                      </div>
                      <button className="btn-primary w-full py-3 rounded-xl text-lg font-bold">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-12">
              <button className="btn-secondary px-8 py-4 rounded-xl text-lg font-bold">
                View All Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanDetail;