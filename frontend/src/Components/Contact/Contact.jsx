import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Contact Us</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Get In Touch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our platform, artisans, or products? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><MapPin className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Our Location</h3>
                      <p className="text-gray-600 text-sm">123 Artisan Street, Calamba City, Laguna</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><Phone className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Phone Number</h3>
                      <p className="text-gray-600 text-sm">+63 (49) 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><Mail className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Email Address</h3>
                      <p className="text-gray-600 text-sm">info@craftconnect.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><Clock className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-gray-600 text-sm">Mon-Fri: 9am-6pm, Sat: 9am-12pm, Sun: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Connect With Us</h2>
                <div className="flex space-x-4">
                  {["Facebook", "Instagram", "Twitter"].map((name, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#a47c68]/10 flex items-center justify-center hover:bg-[#a47c68] hover:text-white transition-colors" aria-label={name}>
                      <span className="text-sm font-bold uppercase">{name[0]}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
                {isSubmitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700 mb-4">We'll get back to you as soon as possible.</p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Send Another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Find Us</h2>
          <div className="rounded-lg overflow-hidden h-[400px] bg-gray-200 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-[#a47c68] mx-auto mb-2" />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            {["How can I become a seller?", "What payment methods are accepted?", "How long does shipping take?", "What is your return policy?"]
              .map((q, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">{q}</h3>
                  <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
