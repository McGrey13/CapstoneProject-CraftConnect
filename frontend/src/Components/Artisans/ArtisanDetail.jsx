import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const mockArtisans = [

  {
    "id": "art-1",
    "name": "Alex Manalo",
    "location": "Calamba, Laguna",
    "specialty": "Miniature & Souvenir Crafting",
    "bio": "An artisan from Calamba specializing in miniature replicas of historical landmarks and traditional Filipino souvenirs.",
    "image": "https://images.unsplash.com/photo-1542845242-421712a23075?q=80&w=500",
    "rating": 4.9,
    "productCount": 38,
    "featured": true,
    "story": "Growing up in Calamba, Alex was inspired by the rich history of his hometown, particularly the legacy of Dr. Jose Rizal. He started crafting miniature versions of Rizal’s house and other local landmarks, expanding his work to include a variety of handcrafted souvenirs that capture the spirit of Filipino heritage.",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    "id": "art-2",
    "name": "Tatay Cesar",
    "location": "Biñan, Laguna",
    "specialty": "Rubber Stamp Engraving",
    "bio": "A master artisan from Biñan who creates intricate, hand-carved rubber stamps.",
    "image": "https://images.unsplash.com/photo-1550993510-444a49c661b1?q=80&w=500",
    "rating": 4.7,
    "productCount": 52,
    "featured": false,
    "story": "From a young age, Tatay Cesar was fascinated by the detail in everyday objects. He honed his skills in carving, eventually finding his niche in personalized rubber stamps. Each stamp he creates is a small work of art, a testament to his patience and passion for transforming simple materials into something personal and meaningful.",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    "id": "art-3",
    "name": "Baby Mae",
    "location": "Biñan, Laguna",
    "specialty": "Traditional Garment & Accessory Making",
    "bio": "An artisan from Biñan who makes traditional Filipino garments, headdresses, and beaded accessories.",
    "image": "https://images.unsplash.com/photo-1596707323281-9b63a9f0298a?q=80&w=500",
    "rating": 4.8,
    "productCount": 41,
    "featured": true,
    "story": "Inspired by the vibrant culture and history of the Philippines, Baby Mae began crafting traditional accessories to preserve her heritage. Her work is a celebration of indigenous artistry, with each piece carefully designed to reflect the beauty and spirit of Filipino traditions, ensuring these skills and designs are passed down to future generations.",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    "id": "art-4",
    "name": "Tatay Tiko",
    "location": "Santa Cruz, Laguna",
    "specialty": "Statuary & Sculpture Painting",
    "bio": "A skilled artisan from Santa Cruz who creates and paints religious and cultural sculptures.",
    "image": "https://images.unsplash.com/photo-1629859595240-a379374092b7?q=80&w=500",
    "rating": 4.9,
    "productCount": 27,
    "featured": false,
    "story": "A painter at heart, Tatay Tiko discovered his calling in painting and sculpting religious figures and local folk characters. His workshop in Santa Cruz is a testament to his devotion, where he transforms simple figures into powerful, expressive works of art that are cherished by collectors and communities alike.",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    "id": "art-5",
    "name": "Renel Batralo",
    "location": "Pila, Laguna",
    "specialty": "Weaving & Fiber Arts",
    "bio": "A versatile artisan from Pila known for his intricate work in jewelry, beadwork, and traditional weaving.",
    "image": "https://images.unsplash.com/photo-1549646631-5f21295b9a89?q=80&w=500",
    "rating": 4.7,
    "productCount": 63,
    "featured": false,
    "story": "Hailing from the historic town of Pila, Renel has mastered a variety of traditional crafts. His journey began with learning beadwork, then expanded into the age-old art of weaving. He draws inspiration from his local surroundings, creating pieces that blend practicality with art, from stylish accessories to functional and beautifully woven baskets.",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

const mockProducts = [

  {
    "id": "prod-1",
    "artisanId": "art-1",
    "title": "Handcrafted Miniature of Rizal's House",
    "price": 250,
    "image": "https://images.unsplash.com/photo-1621215096538-3163a34a3f3b?q=80&w=400"
  },
  {
    "id": "prod-2",
    "artisanId": "art-1",
    "title": "Hand-painted Wooden Hand Fan",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1627960309228-56a849206d44?q=80&w=400"
  },
  {
    "id": "prod-3",
    "artisanId": "art-2",
    "title": "Personalized Hand-Carved Rubber Stamp",
    "price": 500,
    "image": "https://images.unsplash.com/photo-1629859595240-a379374092b7?q=80&w=400"
  },
  {
    "id": "prod-4",
    "artisanId": "art-2",
    "title": "Set of Custom-Made Engraved Stamps",
    "price": 1000,
    "image": "https://images.unsplash.com/photo-1549646631-5f21295b9a89?q=80&w=400"
  },
  {
    "id": "prod-5",
    "artisanId": "art-3",
    "title": "Handmade Beaded Necklace",
    "price": 90,
    "image": "https://images.unsplash.com/photo-1596707323281-9b63a9f0298a?q=80&w=400"
  },
  {
    "id": "prod-6",
    "artisanId": "art-3",
    "title": "Woven Traditional Scarf",
    "price": 299,
    "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
  },
  {
    "id": "prod-7",
    "artisanId": "art-4",
    "title": "Hand-Painted Religious Statue",
    "price": 999,
    "image": "https://images.unsplash.com/photo-1621577785501-c8b82a7f53a4?q=80&w=400"
  },
  {
    "id": "prod-8",
    "artisanId": "art-4",
    "title": "Intricately Carved Wooden Sculpture",
    "price": 1200,
    "image": "https://images.unsplash.com/photo-1579783900970-873b2255757d?q=80&w=400"
  },
  {
    "id": "prod-9",
    "artisanId": "art-5",
    "title": "Hand-Woven Rattan Basket",
    "price": 399,
    "image": "https://images.unsplash.com/photo-1533153578335-e63d41f36402?q=80&w=400"
  },
  {
    "id": "prod-10",
    "artisanId": "art-5",
    "title": "Tribal-Inspired Beaded Bracelet",
    "price": 89,
    "image": "https://images.unsplash.com/photo-1589335606497-8c3b9b478d38?q=80&w=400"
  }
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
