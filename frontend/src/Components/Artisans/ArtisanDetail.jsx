import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Feel free to chat with the artisan." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
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
            if (data.profile_picture_path) {
              return `http://localhost:8000/storage/${data.profile_picture_path}`;
            }
            if (data.user.profile_photo_url && data.user.profile_photo_url.trim() !== "") {
              return data.user.profile_photo_url;
            }
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
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();
  }, [id]);

  // Chat send handler
  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "user", text: newMessage }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks for your message! The artisan will reply soon." },
      ]);
    }, 800);
    setNewMessage("");
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
    <div className="min-h-screen bg-white pb-48"> {/* space for chat */}
      <div className="container mx-auto px-6 max-w-6xl py-16">
        <Link
          to="/artisan"
          className="inline-flex items-center mb-12 text-[#a4785a] hover:text-[#7a5c44] transition-colors font-semibold cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Artisans
        </Link>

        {/* Artisan Info Section */}
        <div className="flex flex-col md:flex-row gap-10 bg-white rounded-xl border border-gray-300 shadow-sm p-8">
          <img
            src={artisan.image}
            alt={artisan.name}
            className="w-36 h-36 rounded-full object-cover border-4 border-[#a4785a] shadow-md self-center md:self-start"
            loading="lazy"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-5xl font-extrabold text-gray-900">{artisan.name}</h1>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-5 w-5" />
                Chat
              </Button>
            </div>
            <p className="uppercase text-[#a4785a] font-semibold tracking-wide mb-6">
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
                      <p className="text-[#a4785a] font-bold text-xl">
                        ₱{Number(product.price).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fixed Chat at Bottom */}
      {isChatOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg">
          <div className="max-w-6xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#a4785a] text-white px-4 py-2 rounded-t-lg">
              <h3 className="font-semibold">Chat with {artisan.name}</h3>
              <button onClick={() => setIsChatOpen(false)} className="border border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto bg-gray-50 rounded-b-lg">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#a4785a] text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t p-3 bg-white">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a4785a]"
              />
              <button
                onClick={handleSend}
                className="border border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanDetail;
