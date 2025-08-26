import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const Artisan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [artisans, setArtisans] = useState([]);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/get/sellers", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("Raw seller data:", data);
        const mapped = data.map((seller) => {
          // Get the profile image URL properly
          let profileImageUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=artisan";
          
          // Use the new profile_image_url field if available
          if (seller.profile_image_url && seller.profile_image_url.trim() !== "") {
            profileImageUrl = seller.profile_image_url;
            console.log(`Seller ${seller.sellerID} profile image from URL:`, profileImageUrl);
          } else if (seller.profile_picture_path) {
            // Fallback to constructing URL from path
            if (!seller.profile_picture_path.startsWith('http')) {
              profileImageUrl = `http://localhost:8000/storage/${seller.profile_picture_path}`;
            } else {
              profileImageUrl = seller.profile_picture_path;
            }
            console.log(`Seller ${seller.sellerID} profile image from path:`, profileImageUrl);
          }
          
          return {
            // Access nested user object for user details
            id: seller.sellerID,
            name: seller.user.userName, // Corrected to use seller.user.userName
            location: seller.user.userAddress || "Unknown", // Corrected
            bio: seller.story || "No bio provided.", // Bio is on the seller object
            image: profileImageUrl,
            // These properties should be on the seller object, not user
            specialty: seller.specialty || "Crafts", 
            rating: seller.rating || 0,
            productCount: seller.productCount || 0,
            featured: seller.featured || false,
            story: seller.story || "",
            videoUrl: seller.video_url || "",
          };
        });
        console.log("Mapped seller data:", mapped);
        setArtisans(mapped);
      })
      .catch((err) => {
        console.error("Error fetching sellers:", err);
        setArtisans([]);
      });
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    filterArtisans(searchQuery, filterFeatured);
  };

  const filterArtisans = (query, onlyFeatured) => {
    // The filter logic is fine, it will work on the 'mapped' data
    let filtered = artisans;
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (artisan) =>
          artisan.name?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.specialty?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.location?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.bio?.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (onlyFeatured) {
      filtered = filtered.filter((artisan) => artisan.featured);
    }
    setArtisans(filtered);
  };

  const toggleFeatured = () => {
    const newValue = !filterFeatured;
    setFilterFeatured(newValue);
    filterArtisans(searchQuery, newValue);
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
          <span className="font-medium">Artisans</span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meet Our Artisans</h1>
          <p className="text-gray-600">
            Discover the talented craftspeople behind our unique handcrafted products
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search artisans by name, specialty, or location..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Button
                variant={filterFeatured ? "default" : "outline"}
                onClick={toggleFeatured}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Featured Artisans
              </Button>
            </div>
          </div>
        </div>

        {/* Artisans Grid */}
        {artisans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {artisans.map((artisan) => (
              <Link to={`/artisans/${artisan.id}`} key={artisan.id}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={artisan.image} // This now correctly uses the image URL from the API response
                      alt={artisan.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {artisan.featured && (
                      <Badge className="absolute top-2 right-2 bg-amber-500">
                        Featured Artisan
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{artisan.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{artisan.location}</span>
                      <span className="mx-2">•</span>
                      <span>{artisan.specialty}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(artisan.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">
                          {artisan.rating?.toFixed(1) ?? "0.0"}
                        </span>
                      </div>
                      <span className="ml-auto text-sm text-gray-500">
                        {artisan.productCount} products
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{artisan.story}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No artisans found matching your search</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterFeatured(false);
                // The useEffect hook already handles re-fetching on mount, so just reset state
                // Re-fetch logic can be simplified by calling the original fetch function
                fetch("http://localhost:8000/api/get/sellers", {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Raw seller data:", data);
                    const mapped = data.map((seller) => {
                      // Get the profile image URL properly
                      let profileImageUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=artisan";
                      
                      // Use the new profile_image_url field if available
                      if (seller.profile_image_url && seller.profile_image_url.trim() !== "") {
                        profileImageUrl = seller.profile_image_url;
                        console.log(`Seller ${seller.sellerID} profile image from URL:`, profileImageUrl);
                      } else if (seller.profile_picture_path) {
                        // Fallback to constructing URL from path
                        if (!seller.profile_picture_path.startsWith('http')) {
                          profileImageUrl = `http://localhost:8000/storage/${seller.profile_picture_path}`;
                        } else {
                          profileImageUrl = seller.profile_picture_path;
                        }
                        console.log(`Seller ${seller.sellerID} profile image from path:`, profileImageUrl);
                      }
                      
                      return {
                        id: seller.sellerID,
                        name: seller.user.userName,
                        location: seller.user.userAddress || "Unknown",
                        bio: seller.story || "No bio provided.",
                        image: profileImageUrl,
                        specialty: seller.specialty || "Crafts",
                        rating: seller.rating || 0,
                        productCount: seller.productCount || 0,
                        featured: seller.featured || false,
                        story: seller.story || "",
                        videoUrl: seller.video_url || "",
                      };
                    });
                    console.log("Mapped seller data:", mapped);
                    setArtisans(mapped);
                  });
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artisan;