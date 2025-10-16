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
  const [showUnfollowWarning, setShowUnfollowWarning] = useState(false);
  const [discountStats, setDiscountStats] = useState(null);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

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
          average_rating: typeof data.average_rating === 'number' ? data.average_rating : 0,
          total_reviews: typeof data.total_reviews === 'number' ? data.total_reviews : 0,
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

    const intervalId = setInterval(fetchArtisan, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Fetch seller discount statistics
  useEffect(() => {
    const fetchDiscountStats = async () => {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:8000/api/analytics/seller/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.discount_stats) {
            setDiscountStats(data.discount_stats);
          }
          if (data && Array.isArray(data.discount_codes)) {
            setDiscountCodes(data.discount_codes);
          }
        }
      } catch (err) {
        console.error('Failed to fetch seller analytics:', err);
      }
    };
    fetchDiscountStats();
    const intervalId = setInterval(fetchDiscountStats, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Fetch Workshops & Events for this seller (public endpoint, then filter)
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/work-and-events/public');
        if (!res.ok) return;
        const payload = await res.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        const filtered = list.filter((item) => String(item?.seller?.sellerID ?? item?.seller_id) === String(id));
        setWorkshops(filtered);
      } catch (e) {
        console.error('Failed to fetch workshops/events:', e);
        setWorkshops([]);
      }
    };
    fetchWorkshops();
    const intervalId = setInterval(fetchWorkshops, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Fetch seller discount statistics
  useEffect(() => {
    const fetchDiscountStats = async () => {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:8000/api/analytics/seller/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.discount_stats) {
            setDiscountStats(data.discount_stats);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchDiscountStats();
  }, [id]);

  // Check follow status on component mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch(`http://localhost:8000/api/sellers/${id}/follow-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.is_following);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    if (id) {
      checkFollowStatus();
    }
  }, [id]);

  // Follow/Unfollow functionality
  const handleFollow = async () => {
    // If trying to unfollow, show warning first
    if (isFollowing) {
      setShowUnfollowWarning(true);
      return;
    }

    // If following, proceed directly
    await performFollowAction('follow');
  };

  const performFollowAction = async (action) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to follow sellers');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/sellers/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Follow/Unfollow response:', data);
        
        setIsFollowing(data.is_following);
        
        // Update followers count with the actual count from backend
        if (storeData?.seller && data.followers_count !== undefined) {
          setStoreData(prev => ({
            ...prev,
            seller: {
              ...prev.seller,
              followers_count: data.followers_count
            }
          }));
        }
        
        // Show success message
        if (action === 'follow') {
          alert('Successfully followed! You will now receive updates about new products and offers.');
        } else {
          alert('Successfully unfollowed.');
        }
      } else {
        console.error('Failed to follow/unfollow seller');
        alert('Failed to update follow status. Please try again.');
      }
    } catch (error) {
      console.error('Error following/unfollowing seller:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setShowUnfollowWarning(false);
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

  // Share functionality
  const handleShare = () => {
    setShowShareModal(true);
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
          onShare={handleShare}
          isFollowing={isFollowing}
          isLoading={isLoading}
          discountStats={discountStats}
          discountCodes={discountCodes}
          workshops={workshops}
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

        {/* Unfollow Warning Modal */}
        {showUnfollowWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                Unfollow {storeData?.store?.store_name || 'this store'}?
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-600 text-center mb-4">
                  If you unfollow this store, you will:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Stop receiving updates about new products</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Miss notifications about special offers and discounts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>No longer see their items in your followed sellers feed</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Miss updates about workshops, events, and promotions</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnfollowWarning(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => performFollowAction('unfollow')}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Unfollowing...' : 'Yes, Unfollow'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Share {storeData?.store?.store_name || 'this store'}
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6 text-center">
                Share this amazing artisan store with your friends!
              </p>

              {/* Professional Preview of what will be shared */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <p className="text-sm font-semibold text-gray-700">Preview of your share</p>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                
                {/* Social Media Style Preview Card */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  {/* Header with gradient */}
                  <div className="relative h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                  
                  {/* Profile Section */}
                  <div className="relative px-6 pb-4">
                    <div className="flex items-start gap-4 -mt-10">
                      <div className="relative">
                        <img 
                          src={storeData?.logo_url || artisan?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=store"} 
                          alt="Store logo" 
                          className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {storeData?.store?.store_name || `${artisan?.name}'s Store`}
                          </h4>
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">✨ by {artisan?.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{storeData?.seller?.average_rating || '4.8'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            <span>{storeData?.seller?.followers_count || '1.2K'} followers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {storeData?.store?.store_description || `🌟 Discover amazing handcrafted products by ${artisan?.name}. Each piece is carefully made with love and attention to detail. Support local artisans and find unique treasures! ✨`}
                      </p>
                    </div>
                    
                    {/* Store Banner/Featured Image */}
                    {storeData?.background_url && (
                      <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={storeData.background_url} 
                          alt="Store showcase" 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    
                    {/* Action Buttons Preview */}
                    <div className="mt-4 flex gap-2">
                      <div className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm">
                        Visit Store
                      </div>
                      <div className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm">
                        Follow
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom decoration */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`🌟 Check out this amazing artisan store "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>

                {/* Debug Facebook Share Button */}
                <button
                  onClick={() => {
                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`🌟 Check out this amazing artisan store "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨`)}`;
                    console.log('🔍 DEBUG Facebook Share URL:', shareUrl);
                    console.log('🔍 DEBUG Current URL:', window.location.href);
                    console.log('🔍 DEBUG Store Data:', storeData);
                    console.log('🔍 DEBUG Artisan Data:', artisan);
                    alert(`Debug Info:\n\nShare URL: ${shareUrl}\n\nCheck console for more details.`);
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                  }}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Debug FB
                </button>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🌟 Check out "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨ #Handmade #Artisan #CraftConnect`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🌟 Check out this amazing artisan store "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! 

Discover unique handcrafted products and support local artisans. ✨

${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>

                {/* Pinterest */}
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(`🌟 Check out "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨ #Handmade #Artisan #CraftConnect`)}&media=${encodeURIComponent(storeData?.logo_url || storeData?.background_url || artisan?.image || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                  Pinterest
                </a>
              </div>

              {/* Debug Buttons Row */}
              <div className="mt-4">
                <div className="text-center mb-3">
                  <span className="text-sm text-gray-600 font-medium">Debug Tools</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const debugData = {
                        currentUrl: window.location.href,
                        storeName: storeData?.store?.store_name || `${artisan?.name}'s Store`,
                        artisanName: artisan?.name,
                        storeDescription: storeData?.store?.store_description,
                        storeLogo: storeData?.logo_url,
                        storeBackground: storeData?.background_url,
                        fullStoreData: storeData,
                        fullArtisanData: artisan
                      };
                      console.log('🔍 DEBUG Full Share Data:', debugData);
                      alert('Debug data logged to console. Check browser developer tools.');
                    }}
                    className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                  >
                    Log Data
                  </button>
                  
                  <button
                    onClick={() => {
                      // Test different Facebook share URL formats
                      const currentUrl = window.location.href;
                      const shareText = `🌟 Check out this amazing artisan store "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨`;
                      
                      // Test different Facebook share URL formats
                      const shareUrls = {
                        'Old Format (sharer.php)': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`,
                        'New Format (dialog/share)': `https://www.facebook.com/dialog/share?app_id=823045633579448&href=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`,
                        'Simple Format': `https://www.facebook.com/sharer.php?u=${encodeURIComponent(currentUrl)}`,
                        'Dialog Format': `https://www.facebook.com/dialog/share?app_id=823045633579448&href=${encodeURIComponent(currentUrl)}&redirect_uri=${encodeURIComponent(currentUrl)}`,
                        'Feed Format': `https://www.facebook.com/dialog/feed?app_id=823045633579448&link=${encodeURIComponent(currentUrl)}&name=${encodeURIComponent(storeData?.store?.store_name || `${artisan?.name}'s Store`)}&description=${encodeURIComponent(shareText)}&redirect_uri=${encodeURIComponent(currentUrl)}`
                      };
                      
                      console.log('🔍 DEBUG Facebook Share URL Tests:', shareUrls);
                      
                      // Show all formats in an alert
                      let alertText = 'Facebook Share URL Tests:\n\n';
                      Object.entries(shareUrls).forEach(([name, url]) => {
                        alertText += `${name}:\n${url}\n\n`;
                      });
                      alertText += 'Check console for full details.';
                      alert(alertText);
                      
                      // Open the first format in a new window
                      window.open(shareUrls['Old Format (sharer.php)'], '_blank', 'width=600,height=400');
                    }}
                    className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                  >
                    Test URLs
                  </button>
                  
                  <button
                    onClick={() => {
                      // Check if the current URL is accessible and has proper meta tags
                      const currentUrl = window.location.href;
                      
                      // Test if the URL is accessible
                      fetch(currentUrl)
                        .then(response => {
                          if (response.ok) {
                            return response.text();
                          }
                          throw new Error(`HTTP ${response.status}`);
                        })
                        .then(html => {
                          // Check for Open Graph meta tags
                          const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
                          const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
                          const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
                          const ogUrl = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
                          
                          const metaTags = {
                            title: ogTitle ? ogTitle[1] : 'Not found',
                            description: ogDescription ? ogDescription[1] : 'Not found',
                            image: ogImage ? ogImage[1] : 'Not found',
                            url: ogUrl ? ogUrl[1] : 'Not found'
                          };
                          
                          console.log('🔍 DEBUG Meta Tags Check:', metaTags);
                          
                          let alertText = 'Meta Tags Check:\n\n';
                          Object.entries(metaTags).forEach(([key, value]) => {
                            alertText += `${key}: ${value}\n`;
                          });
                          alertText += '\nCheck console for full details.';
                          alert(alertText);
                        })
                        .catch(error => {
                          console.error('🔍 DEBUG URL Check Error:', error);
                          alert(`URL Check Failed: ${error.message}\n\nCheck console for details.`);
                        });
                    }}
                    className="px-3 py-2 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 font-medium"
                  >
                    Check Meta
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentUrl = window.location.href;
                      const shareText = `🌟 Check out this amazing artisan store "${storeData?.store?.store_name || `${artisan?.name}'s Store`}" by ${artisan?.name}! Discover unique handcrafted products and support local artisans. ✨`;
                      
                      // Create the Facebook share URL
                      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
                      
                      // Open Facebook share in a new window
                      const shareWindow = window.open(facebookShareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
                      
                      // Also log the URL for debugging
                      console.log('🔍 DEBUG Facebook Share Test:', {
                        originalUrl: currentUrl,
                        shareUrl: facebookShareUrl,
                        shareText: shareText,
                        storeData: storeData,
                        artisan: artisan
                      });
                      
                      // Show confirmation
                      alert(`Facebook Share Test Opened!\n\nShare URL: ${facebookShareUrl}\n\nCheck the popup window and console for details.`);
                    }}
                    className="px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium"
                  >
                    Test Share
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentUrl = window.location.href;
                      
                      // Facebook Sharing Debugger URL
                      const facebookDebuggerUrl = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentUrl)}`;
                      
                      // Open Facebook's URL debugger
                      window.open(facebookDebuggerUrl, '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
                      
                      console.log('🔍 DEBUG Facebook URL Debugger:', {
                        originalUrl: currentUrl,
                        debuggerUrl: facebookDebuggerUrl
                      });
                      
                      alert(`Facebook URL Debugger Opened!\n\nThis tool will:\n- Check if your URL is accessible\n- Show Open Graph meta tags\n- Test how Facebook sees your page\n- Clear Facebook's cache if needed\n\nDebugger URL: ${facebookDebuggerUrl}`);
                    }}
                    className="px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 font-medium"
                  >
                    FB Debugger
                  </button>
                </div>
              </div>

              {/* Copy Link Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 font-semibold">Or copy link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

// Artisan Store Preview Component (using StorefrontCustomizer WYSIWYG design)
const ArtisanStorePreview = ({ storeData, artisan, artisanProducts, onFollow, onMessage, onShare, isFollowing, isLoading, discountCodes = [], workshops = [] }) => {
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

  const computedRating = (() => {
    const candidates = [
      artisan?.average_rating,
      storeData?.seller?.average_rating,
      storeData?.seller?.avg_rating,
      storeData?.seller?.rating,
      storeData?.store?.average_rating,
      storeData?.store?.avg_rating,
      storeData?.average_rating,
      storeData?.avg_rating,
    ];
    const val = candidates.find((v) => v !== undefined && v !== null);
    const r = Number(val);
    return Number.isFinite(r) ? r : 0;
  })();

  const totalRatings = (() => {
    const candidates = [
      artisan?.total_reviews,
      storeData?.seller?.total_ratings,
      storeData?.seller?.reviews_count,
      storeData?.store?.total_ratings,
      storeData?.store?.reviews_count,
      storeData?.total_ratings,
      storeData?.reviews_count,
    ];
    const val = candidates.find((v) => v !== undefined && v !== null);
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  })();

  const store = {
    name: storeData?.store?.store_name || `${artisan.name}'s Store`,
    logo: imagePreviews.logo || "https://api.dicebear.com/7.x/avataaars/svg?seed=store",
    banner: imagePreviews.background || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    rating: computedRating,
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
                {store.rating > 0 ? `${store.rating.toFixed(1)} (${totalRatings} reviews)` : 'No ratings yet'}
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
            onClick={onShare}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
                  </button>
                </div>
              </div>

      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-8 z-10 relative">
        <div 
          className="rounded-2xl shadow p-6 flex flex-col gap-4"
          style={{ backgroundColor: customization.background_color }}
        >
          <div>
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
                  key={String(cat)} 
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
            
      {/* Seller Discounts - separate section (matches verification card style) */}
      <div className="max-w-5xl mx-auto mt-6 z-10 relative">
        <div 
          className="rounded-2xl shadow p-6"
          style={{ backgroundColor: customization.background_color }}
        >
          <div 
            className="w-full rounded-xl border p-4" 
            style={{ borderColor: customization.accent_color, backgroundColor: customization.background_color }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold" style={{ color: customization.primary_color }}>Seller Discounts</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {Array.isArray(discountCodes) && discountCodes.length > 0 ? (
                discountCodes.map((dc, idx) => (
                  <div 
                    key={dc.id ?? dc.code ?? dc.name ?? `dc-${idx}`}
                    className="rounded-lg border px-3 py-2"
                    style={{ borderColor: `${customization.accent_color}55` }}
                  >
                    <div className="text-sm font-semibold" style={{ color: customization.primary_color }}>
                      {dc.code || dc.name || 'DISCOUNT'}
                    </div>
                    <div className="text-xs" style={{ color: customization.text_color }}>
                      {(dc.type === 'percentage' || dc.type === 'percent') ? `${dc.value}% off` : `₱${Number(dc.value).toFixed(2)} off`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm" style={{ color: customization.text_color }}>No discount codes yet.</div>
              )}
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
          products.map((product, index) => (
            <Link to={`/product/${product.id}`} key={`prod-${product.id ?? index}`}>
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

  {/* Workshops & Events - now after products */}
  <div className="max-w-5xl mx-auto mt-16 mb-12">
    <div className="text-center mb-8">
      <h2 
        className="text-3xl font-extrabold mb-2"
        style={{ 
          color: customization.primary_color,
          fontFamily: customization.heading_font,
          fontSize: `${customization.heading_size * 1.8}px`
        }}
      >
        Workshops & Events
      </h2>
      <p 
        className="text-lg"
        style={{ 
          color: customization.text_color,
          fontFamily: customization.body_font,
          fontSize: `${customization.body_size}px`
        }}
      >
        Learn hands-on crafting skills and join our community events
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(workshops) && workshops.length > 0 ? (
        workshops.map((ev, idx) => (
          <div
            key={ev.works_and_events_id ?? `${ev.title ?? 'we'}-${idx}`}
            className="rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
            style={{ backgroundColor: customization.background_color }}
          >
            <div className="absolute top-3 right-3 z-10">
              <span 
                className="font-bold px-2 py-1 rounded-full text-xs shadow"
                style={{ 
                  backgroundColor: ev.status === 'upcoming' ? '#bfdbfe' : '#bbf7d0',
                  color: ev.status === 'upcoming' ? '#1d4ed8' : '#166534'
                }}
              >
                {ev.status ? ev.status.charAt(0).toUpperCase() + ev.status.slice(1) : 'Event'}
              </span>
            </div>
            {ev.image_url ? (
              <img
                src={ev.image_url}
                alt={ev.title || 'Event image'}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">No Image</p>
                </div>
              </div>
            )}
            <div className="p-6">
              <h3 
                className="font-bold text-xl mb-2"
                style={{ 
                  color: customization.text_color,
                  fontFamily: customization.heading_font,
                  fontSize: `${customization.heading_size * 1.1}px`
                }}
              >
                {ev.title || 'Event'}
              </h3>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
                <span>{ev.date || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>
                <span>{ev.time || 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: customization.text_color }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>
                <span>{ev.participants ? `${ev.participants} participants` : (ev.location || 'TBA')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span 
                  className="font-bold text-xl"
                  style={{ 
                    color: customization.primary_color,
                    fontSize: `${customization.heading_size * 1.2}px`
                  }}
                >
                  {ev.price ? ev.price : ''}
                </span>
                <button 
                  className="font-semibold px-4 py-2 rounded-lg hover:transition"
                  style={{ 
                    backgroundColor: customization.accent_color,
                    color: customization.text_color
                  }}
                  onClick={() => {
                    if (ev.link) window.open(ev.link, '_blank');
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-10" style={{ color: customization.text_color }}>
          No workshops or events yet.
        </div>
      )}
    </div>
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