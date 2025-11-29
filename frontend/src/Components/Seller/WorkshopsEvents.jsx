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
import { Calendar, Clock, Users, MapPin, Plus, Upload, X, RefreshCw, Edit } from "lucide-react";
import { Badge } from "../ui/badge";
import { useWorkAndEvents } from "../../hooks/useWorkAndEvents";
import { toast } from "sonner";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";

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
    <Card className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-[#e5ded7] bg-white group">
      <div
        className="h-48 w-full bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${image || '/placeholder-workshop.jpg'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-3 right-3">
          <Badge className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm ${statusStyles[status] || statusStyles.upcoming}`}>
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
      <CardHeader className="py-4 px-5 border-b border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8]">
        <CardTitle className="text-lg font-bold text-[#5c3d28] line-clamp-2">{title}</CardTitle>
        <CardDescription className="text-sm text-[#7b5a3b] mt-1">
          Craft Workshop Event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-5 py-4 text-sm text-[#7b5a3b]">
        <div className="flex items-center gap-3 p-2.5 hover:bg-[#faf9f8] rounded-lg transition-colors cursor-default">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center flex-shrink-0 shadow-md">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium truncate">
            {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
          </span>
        </div>
        <div className="flex items-center gap-3 p-2.5 hover:bg-[#faf9f8] rounded-lg transition-colors cursor-default">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium truncate">{time}</span>
        </div>
        <div className="flex items-center gap-3 p-2.5 hover:bg-[#faf9f8] rounded-lg transition-colors cursor-default">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium truncate">{location}</span>
        </div>
        <div className="flex items-center gap-3 p-2.5 hover:bg-[#faf9f8] rounded-lg transition-colors cursor-default">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium truncate">{participants} participants</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 px-5 py-4 bg-[#faf9f8] border-t border-[#e5ded7]">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-lg text-[#a4785a] border-2 border-[#d5bfae] hover:bg-white hover:text-[#5c3d28] hover:border-[#a4785a] transition-all duration-200 text-sm px-4 py-2.5 font-medium shadow-sm hover:shadow-md"
          onClick={() => onEdit && onEdit()}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm px-4 py-2.5 font-medium"
          onClick={() => onDelete && onDelete()}
        >
          <X className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const WorkshopsEvents = () => {
  const { workAndEvents, loading, error, createWorkAndEvent, updateWorkAndEvent, deleteWorkAndEvent, fetchWorkAndEvents } = useWorkAndEvents();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
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

      if (editingWorkshop) {
        const result = await updateWorkAndEvent(editingWorkshop.works_and_events_id, submitData);
        if (result.success) {
          toast.success('Workshop updated successfully!');
          setShowCreateForm(false);
          setEditingWorkshop(null);
          resetForm();
        }
      } else {
        const result = await createWorkAndEvent(submitData);
        if (result.success) {
          toast.success('Workshop created successfully!');
          setShowCreateForm(false);
          resetForm();
        }
      }
    } catch (error) {
      toast.error(error.message || (editingWorkshop ? 'Failed to update workshop' : 'Failed to create workshop'));
      console.error('Error saving workshop:', error);
    }
  };

  const resetForm = () => {
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
  };

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title || '',
      description: workshop.description || '',
      location: workshop.location || '',
      date: workshop.date || '',
      time: workshop.time || '',
      participants: workshop.participants || '',
      status: workshop.status || 'upcoming',
      link: workshop.link || '',
      image: null,
    });
    setImagePreview(workshop.image_url || null);
    setShowCreateForm(true);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-6 md:p-8 overflow-visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center w-full sm:w-auto min-w-0">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Workshops & Events
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Create and manage engaging workshops and events for your customers
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <Button 
              onClick={() => fetchWorkAndEvents()}
              className="bg-white/95 text-[#5c3d28] hover:bg-white shadow-md hover:shadow-lg 
                        transition-all duration-200 px-4 py-2 
                        rounded-lg font-medium text-sm 
                        flex items-center justify-center gap-2
                        border border-white/30"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                if (showCreateForm) {
                  setShowCreateForm(false);
                  setEditingWorkshop(null);
                  resetForm();
                } else {
                  setShowCreateForm(true);
                }
              }}
              style={{
                backgroundColor: '#ffffff',
                color: '#a4785a',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              }}
              className="!bg-white !text-[#a4785a] hover:!bg-[#faf9f8] hover:!text-[#7b5a3b] !shadow-xl hover:!shadow-2xl 
                        transition-all duration-200 px-5 py-2.5 
                        rounded-lg font-bold text-sm 
                        flex items-center justify-center gap-2
                        border-2 border-white/80 backdrop-blur-sm
                        relative z-10"
            >
              <Plus className="h-4 w-4 font-bold" /> 
              <span className="font-bold">{showCreateForm ? 'Cancel' : 'Create Workshop'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {workAndEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#e5ded7] p-12 md:p-16">
          <div className="text-center">
            <div className="text-7xl md:text-8xl mb-6">🎨</div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#5c3d28] mb-3">No Workshops Yet</h2>
            <p className="text-[#7b5a3b] text-base md:text-lg mb-8 max-w-md mx-auto">
              Create your first workshop or event to start engaging with customers
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)} 
              className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg font-medium text-sm md:text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Workshop
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              onEdit={() => handleEdit(workshop)}
              onDelete={() => handleDelete(workshop.works_and_events_id)}
            />
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-6 rounded-t-2xl z-10 shadow-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    {editingWorkshop ? (
                      <>
                        <Edit className="h-7 w-7 mr-3" />
                        Edit Workshop
                      </>
                    ) : (
                      <>
                        <Plus className="h-7 w-7 mr-3" />
                        Create New Workshop
                      </>
                    )}
                  </h2>
                  <p className="text-white/90 mt-1">
                    {editingWorkshop ? 'Update your workshop details' : 'Set up an engaging workshop or event for your customers'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingWorkshop(null);
                    resetForm();
                  }}
                  className="text-white bg-[#7b5a3b] hover:bg-[#6a4c34] rounded-full p-2 transition-all shadow-md hover:shadow-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-6 w-full">
                {/* Info Banner */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Workshop Creation Tips</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Create engaging workshops to connect with customers, showcase your craft, and build your community. Include clear details and attractive images!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold text-[#5c3d28] flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Workshop Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Pottery Making"
                    className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3"
                    required
                  />
                  <p className="text-xs text-[#7b5a3b]">Choose a catchy and descriptive title</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold text-[#5c3d28]">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what participants will learn, what materials are included, and what to bring..."
                    rows={4}
                    className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg resize-none"
                    required
                  />
                  <p className="text-xs text-[#7b5a3b]">Be detailed to attract more participants</p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-base font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date *
                    </Label>
                    <Input 
                      id="date" 
                      name="date"
                      type="date" 
                      value={formData.date}
                      onChange={handleInputChange}
                      className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-base font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time *
                    </Label>
                    <Input 
                      id="time" 
                      name="time"
                      type="time" 
                      value={formData.time}
                      onChange={handleInputChange}
                      className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3" 
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold text-[#5c3d28] flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location *
                  </Label>
                  <Input 
                    id="location" 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Your Studio Address or 'Online via Zoom'" 
                    className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3"
                    required
                  />
                  <p className="text-xs text-[#7b5a3b]">Specify physical address or online platform</p>
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-base font-semibold text-[#5c3d28]">
                    Registration Link *
                  </Label>
                  <Input 
                    id="link" 
                    name="link"
                    type="url"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com/register" 
                    className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3"
                    required
                  />
                  <p className="text-xs text-[#7b5a3b]">Where customers can sign up for the workshop</p>
                </div>

                {/* Capacity & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="participants" className="text-base font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Max Participants *
                    </Label>
                    <Input 
                      id="participants" 
                      name="participants"
                      type="number" 
                      min="1"
                      value={formData.participants}
                      onChange={handleInputChange}
                      placeholder="e.g., 12" 
                      className="border-2 border-[#d5bfae] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 rounded-lg py-3" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base font-semibold text-[#5c3d28]">
                      Status *
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 focus:outline-none transition-all bg-white"
                      required
                    >
                      <option value="upcoming">📅 Upcoming</option>
                      <option value="in-progress">⏳ In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="image" className="text-base font-semibold text-[#5c3d28] block text-center w-full">
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      Workshop Image {!editingWorkshop && '*'}
                    </div>
                  </Label>
                  {!imagePreview ? (
                    <Label 
                      htmlFor="image" 
                      className="block w-full border-2 border-dashed border-[#d5bfae] rounded-lg p-8 hover:border-[#a4785a] transition-all bg-[#faf9f8] cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center text-center min-h-[200px] w-full">
                        <div className="flex items-center justify-center mb-4 w-full">
                          <Upload className="h-16 w-16 text-[#a4785a]" />
                        </div>
                        <p className="text-[#5c3d28] font-medium hover:text-[#a4785a] transition-all text-base w-full">
                          <span className="underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#7b5a3b] mt-2 w-full">
                          {editingWorkshop ? 'Leave empty to keep current image' : 'PNG, JPG, GIF up to 10MB'}
                        </p>
                      </div>
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required={!editingWorkshop}
                      />
                    </Label>
                  ) : (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-48 w-full object-cover rounded-lg shadow-lg border-2 border-[#e5ded7]"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full p-0 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {editingWorkshop && (
                        <p className="text-xs text-[#7b5a3b] mt-2 text-center">Click the X to remove and upload a new image</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-5 bg-[#faf9f8] border-t border-[#e5ded7] flex gap-3 sticky bottom-0 rounded-b-2xl">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingWorkshop(null);
                    resetForm();
                  }}
                  className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-white hover:border-[#a4785a] rounded-lg py-6 font-medium transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6 font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {editingWorkshop ? 'Updating Workshop...' : 'Creating Workshop...'}
                    </div>
                  ) : (
                    <>
                      {editingWorkshop ? (
                        <>
                          <Edit className="h-5 w-5 mr-2" />
                          Update Workshop
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Create Workshop
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsEvents;
