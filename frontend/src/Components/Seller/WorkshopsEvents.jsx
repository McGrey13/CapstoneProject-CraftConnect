import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar, Clock, Users, MapPin, Plus, Upload, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { useWorkAndEvents } from "../../hooks/useWorkAndEvents";
import { toast } from "sonner"; // You might need to install sonner for notifications
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

// Status badge styling
const statusStyles = {
  upcoming: "bg-yellow-200 text-yellow-800",
  "in-progress": "bg-blue-200 text-blue-800",
  completed: "bg-green-200 text-green-800",
  cancelled: "bg-red-200 text-red-800",
};

const WorkshopCard = ({
  title,
  date,
  time,
  location,
  participants,
  status,
  image,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#e5ded7] bg-white">
      <div
        className="h-48 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${image || '/placeholder-workshop.jpg'})` }}
      >
        <div className="absolute top-3 right-3">
          <Badge className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg ${statusStyles[status] || statusStyles.upcoming}`}>
            {status === "upcoming"
              ? "Upcoming"
              : status === "in-progress"
              ? "In Progress"
              : status === "completed"
              ? "Completed"
              : status === "cancelled"
              ? "Cancelled"
              : "Upcoming"}
          </Badge>
        </div>
      </div>
      <CardHeader className="py-5 px-6 border-b border-[#e5ded7]">
        <CardTitle className="text-xl font-bold text-[#5c3d28]">{title}</CardTitle>
        <CardDescription className="text-sm text-[#7b5a3b] mt-1">
          Craft Workshop Event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-6 py-4 text-sm text-[#7b5a3b]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#faf9f8] rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-[#faf9f8] rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{time}</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-[#faf9f8] rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{location}</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-[#faf9f8] rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{participants} participants</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 py-5 bg-[#faf9f8] border-t border-[#e5ded7]">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-[#a4785a] hover:bg-white hover:text-[#5c3d28] transition-all duration-200"
          onClick={() => onEdit && onEdit()}
        >
          Edit
        </Button>
        <Button
          size="sm"
          className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => onDelete && onDelete()}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const WorkshopsEvents = () => {
  const { workAndEvents, loading, error, createWorkAndEvent, deleteWorkAndEvent } = useWorkAndEvents();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    participants: '',
    status: 'upcoming',
    link: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const result = await createWorkAndEvent(submitData);
      
      if (result.success) {
        toast.success('Workshop created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          date: '',
          time: '',
          participants: '',
          status: 'upcoming',
          link: '',
          image: null,
        });
        setImagePreview(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create workshop');
      console.error('Error creating workshop:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        await deleteWorkAndEvent(id);
        toast.success('Workshop deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete workshop');
        console.error('Error deleting workshop:', error);
      }
    }
  };

  if (loading && workAndEvents.length === 0) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading workshops..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState 
          message={`Error loading workshops: ${error.message}`} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              Workshops & Events
            </h1>
            <p className="text-white/90 mt-2 text-lg">
              Create and manage engaging workshops and events for your customers
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-white text-[#5c3d28] hover:bg-[#faf9f8] shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" /> 
            {showCreateForm ? 'Cancel' : 'Create New Workshop'}
          </Button>
        </div>
      </div>

      {/* Grid */}
      {workAndEvents.length === 0 ? (
        <EmptyState
          icon="🎨"
          title="No Workshops Yet"
          description="Create your first workshop or event to start engaging with customers"
          action={
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workshop
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workAndEvents.map((workshop) => (
          <WorkshopCard
              key={workshop.works_and_events_id}
              title={workshop.title}
              date={workshop.date}
              time={workshop.time}
              location={workshop.location}
              participants={workshop.participants}
              status={workshop.status}
              image={workshop.image_url}
              onDelete={() => handleDelete(workshop.works_and_events_id)}
            />
          ))}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
      <Card className="mt-6 rounded-2xl shadow-xl border-2 border-[#e5ded7] bg-white">
        <CardHeader className="px-8 pt-8 pb-6 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-2xl font-bold text-[#5c3d28]">Create New Workshop</CardTitle>
          <CardDescription className="text-base text-[#7b5a3b]">
            Set up a new workshop or event for your customers
          </CardDescription>
        </CardHeader>

          <form onSubmit={handleSubmit}>
        <CardContent className="px-6 py-6 space-y-6">
          {/* Title */}
          <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Workshop Title *
            </Label>
            <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
              placeholder="e.g., Introduction to Pottery"
              className="mt-1"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what participants will learn and what to bring..."
                  rows={4}
                  className="mt-1"
                  required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date *
              </Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date" 
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1" 
                    required
                  />
            </div>
            <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Time *
              </Label>
                  <Input 
                    id="time" 
                    name="time"
                    type="time" 
                    value={formData.time}
                    onChange={handleInputChange}
                    className="mt-1" 
                    required
                  />
            </div>
          </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location *
                </Label>
                <Input 
                  id="location" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your Studio or Online" 
                  required
                />
              </div>

              {/* Link */}
              <div>
                <Label htmlFor="link" className="text-sm font-medium text-gray-700">
                  Registration Link *
                </Label>
                <Input 
                  id="link" 
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/register" 
                  required
                />
          </div>

              {/* Capacity & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <Label htmlFor="participants" className="text-sm font-medium text-gray-700">
                    Max Participants *
              </Label>
                  <Input 
                    id="participants" 
                    name="participants"
                    type="number" 
                    value={formData.participants}
                    onChange={handleInputChange}
                    placeholder="e.g., 12" 
                    className="mt-1" 
                    required
                  />
            </div>
            <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
              </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
            </div>
          </div>

              {/* Image Upload */}
          <div>
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                  Workshop Image *
            </Label>
                <div className="mt-1">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    required
                  />
                  {imagePreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
          </div>
        </CardContent>

        <CardFooter className="px-8 py-6 bg-[#faf9f8] border-t border-[#e5ded7]">
              <Button 
                type="submit" 
                className="w-full rounded-xl bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : 'Create Workshop'}
          </Button>
        </CardFooter>
          </form>
      </Card>
      )}
    </div>
  );
};

export default WorkshopsEvents;
