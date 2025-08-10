import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const HeroSection = ({
  title = "Discover Unique Handcrafted Treasures",
  subtitle = "Connect directly with skilled artisans and bring their one-of-a-kind creations into your home.",
  ctaText = "Explore Products",
  onCtaClick = () => {},
  slides = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&q=80",
      title: "Handcrafted Ceramics",
      artisan: "Sarah's Pottery",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=1200&q=80",
      title: "Artisan Jewelry",
      artisan: "Copper & Stone",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80",
      title: "Handwoven Textiles",
      artisan: "Mountain Weavers",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80",
      title: "Wooden Home Decor",
      artisan: "Forest Crafts",
    },
  ],
}) => {
  return (
    <section className="w-full h-[500px] relative overflow-hidden bg-gray-50">
      {/* Hero Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {slides.map((slide) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <h3 className="text-2xl font-bold">{slide.title}</h3>
                    <p className="text-sm opacity-90">by {slide.artisan}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 z-10" />
          <CarouselNext className="right-4 z-10" />
        </Carousel>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <Button size="lg" className="text-base font-medium bg-[#a47c68]" asChild>
            <Link to="/products" onClick={onCtaClick}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
