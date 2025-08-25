import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const mockArtisans = [
  {
    id: "art-1",
    name: "Sheweliz M. Antinero",
    location: "Calamba, Laguna",
    specialty: "Ceramics",
    story:
      "Sheweliz's passion for ceramics started in her childhood surrounded by nature. Her work blends traditional Filipino techniques with modern styles to create unique pottery that tells a story.",
    videoUrl: "https://www.youtube.com/embed/VXeaSKjpceI?si=bJLXoKlPDYnOHiHg",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
  },
  {
    id: "art-2",
    name: "Gio Mc Grey O. Calugas",
    location: "San Pedro, Laguna",
    specialty: "Jewelry",
    story:
      "Gio sources local materials and uses time-honored jewelry techniques to craft unique pieces inspired by Philippine heritage.",
    videoUrl: "https://www.youtube.com/embed/ZzFP2UCR_64?si=zp12_F1AImSJyRWq",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  },
  {
    id: "art-3",
    name: "Denisse Kaith D. Malabana",
    location: "Victoria, Laguna",
    specialty: "Textiles",
    story:
      "Denisse's textiles merge traditional patterns with modern aesthetics, preserving cultural heritage while embracing innovation.",
    videoUrl: "https://www.youtube.com/embed/9apzhyHYdpI?si=wpZAt_O6kmDj3DCH",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
  },
];

const mockProducts = [
  {
    id: "prod-1",
    artisanId: "art-1",
    title: "Handcrafted Ceramic Mug",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80",
  },
  {
    id: "prod-2",
    artisanId: "art-1",
    title: "Ceramic Vase",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1549887530-3b8a945ec160?w=400&q=80",
  },
  {
    id: "prod-3",
    artisanId: "art-2",
    title: "Silver Necklace",
    price: 65.0,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    id: "prod-4",
    artisanId: "art-2",
    title: "Gold Earrings",
    price: 80.5,
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&q=80",
  },
  {
    id: "prod-5",
    artisanId: "art-3",
    title: "Woven Textile Scarf",
    price: 38.99,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
  {
    id: "prod-6",
    artisanId: "art-3",
    title: "Handmade Textile Bag",
    price: 45.0,
    image:
      "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=400&q=80",
  },
];

const ArtisanDetail = () => {
  const { id } = useParams();

  const artisan = mockArtisans.find((a) => a.id === id);
  const artisanProducts = mockProducts.filter((p) => p.artisanId === id);

  if (!artisan) {
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
                    <p className="text-[#a4785a] font-bold text-xl">₱{product.price.toFixed(2)}</p>
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
