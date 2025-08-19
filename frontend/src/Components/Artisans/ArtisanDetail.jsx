import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const ArtisanDetail = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sellers/${id}/details`);
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
          image:
            data.user.profile_photo_url && data.user.profile_photo_url.trim() !== ""
              ? data.user.profile_photo_url
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
        });
        const mappedProducts = (data.products || []).map((p) => ({
          id: p.id,
          title: p.productName,
          price: p.productPrice,
          image:
            p.productImage && p.productImage.trim() !== ""
              ? p.productImage.startsWith("http")
                ? p.productImage
                : `http://localhost:8000/storage/${p.productImage}`
              : "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80",
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
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-6 max-w-6xl">
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
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">{artisan.name}</h1>
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
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.title}</h3>
                    <p className="text-[#a4785a] font-bold text-xl">₱{Number(product.price).toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ArtisanDetail;