import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Calendar, Clock, MapPin, Users, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import api from "../../api";
import { useUser } from "../Context/UserContext";
import NotificationModal from "../ui/NotificationModal";

const WorkshopsEventsGrid = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const { user } = useUser();

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/work-and-events/public');
        const payload = response?.data;
        
        // Handle different response structures
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.work_and_events)
          ? payload.work_and_events
          : [];
        
        // Filter only upcoming events (excluding cancelled and completed)
        const upcomingWorkshops = list.filter(w => 
          w.status === 'upcoming' || 
          w.status === 'in-progress' || 
          w.status === 'ongoing'
        );
        setWorkshops(upcomingWorkshops.slice(0, 6)); // Limit to 6 for homepage
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setError(err.message);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkshops();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const handleRegister = async (workshopId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setNotification({ show: true, type: 'error', message: 'Please login to register for events' });
      return;
    }

    // Find the workshop to check current participant count
    const currentWorkshop = workshops.find(w => 
      (w.works_and_events_id === workshopId) || (w.id === workshopId)
    );

    if (!currentWorkshop) {
      setNotification({ show: true, type: 'error', message: 'Workshop not found' });
      return;
    }

    // Check if already full
    if (currentWorkshop.participants <= 0) {
      setNotification({ show: true, type: 'error', message: 'No available spots remaining for this event' });
      return;
    }

    try {
      setRegistering(prev => ({ ...prev, [workshopId]: true }));
      
      // Optimistically update the UI immediately for better UX
      const newParticipantCount = Math.max(0, (currentWorkshop.participants || 0) - 1);
      setWorkshops(prev => prev.map(w => 
        (w.works_and_events_id === workshopId || w.id === workshopId)
          ? { ...w, participants: newParticipantCount }
          : w
      ));

      const response = await api.post(`/work-and-events/public/${workshopId}/register`);
      
      // Update with actual response data from backend
      if (response.data && (response.data.success !== false)) {
        const updatedParticipants = response.data.data?.participants ?? response.data.participants ?? newParticipantCount;
        
        // Update the workshop in the list with new participant count from backend
        setWorkshops(prev => prev.map(w => 
          (w.works_and_events_id === workshopId || w.id === workshopId)
            ? { ...w, participants: updatedParticipants }
            : w
        ));
        
        setNotification({ 
          show: true, 
          type: 'success', 
          message: response.data.message || 'Successfully registered for the event!' 
        });
      } else {
        // If registration failed, revert the optimistic update
        setWorkshops(prev => prev.map(w => 
          (w.works_and_events_id === workshopId || w.id === workshopId)
            ? { ...w, participants: currentWorkshop.participants }
            : w
        ));
        
        const errorMsg = response.data?.message || 'Failed to register for event. Please try again.';
        setNotification({ show: true, type: 'error', message: errorMsg });
      }
    } catch (err) {
      // Revert optimistic update on error
      setWorkshops(prev => prev.map(w => 
        (w.works_and_events_id === workshopId || w.id === workshopId)
          ? { ...w, participants: currentWorkshop.participants }
          : w
      ));
      
      const errorMessage = err.response?.data?.message || 'Failed to register for event. Please try again.';
      setNotification({ show: true, type: 'error', message: errorMessage });
    } finally {
      setRegistering(prev => ({ ...prev, [workshopId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#fefefe] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || workshops.length === 0) {
    return null; // Don't show section if no workshops
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#fefefe] to-[#f5f0eb] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#5c3d28] mb-3">
            Upcoming Workshops & Events
          </h2>
          <p className="text-base md:text-lg text-[#7b5a3b] max-w-2xl mx-auto">
            Join our community workshops and learn from talented artisans
          </p>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <Card 
              key={workshop.works_and_events_id || workshop.id}
              className="overflow-hidden h-full border-2 border-[#d5bfae] shadow-md hover:shadow-xl transition-all duration-300"
            >
                <div 
                  className="relative h-48 overflow-hidden bg-gray-100"
                  style={{ 
                    backgroundImage: `url(${workshop.image_url || workshop.image || '/placeholder-workshop.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#a4785a] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {workshop.status === 'upcoming' ? 'Upcoming' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg text-[#5c3d28] mb-3 line-clamp-2">
                    {workshop.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                      <Calendar className="w-4 h-4 text-[#a4785a]" />
                      <span>{formatDate(workshop.date)}</span>
                    </div>
                    {workshop.time && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <Clock className="w-4 h-4 text-[#a4785a]" />
                        <span>{workshop.time}</span>
                      </div>
                    )}
                    {workshop.location && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <MapPin className="w-4 h-4 text-[#a4785a]" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                    )}
                    {workshop.participants !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-[#7b5a3b]">
                        <Users className="w-4 h-4 text-[#a4785a]" />
                        <span>{workshop.participants > 0 ? `${workshop.participants} spots available` : 'Fully booked'}</span>
                      </div>
                    )}
                  </div>

                  {workshop.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {workshop.link && (
                      <Link
                        to={workshop.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[#a4785a] font-medium hover:text-[#7b5a3b] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Learn More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                    <Button
                      onClick={(e) => handleRegister(workshop.works_and_events_id || workshop.id, e)}
                      disabled={registering[workshop.works_and_events_id || workshop.id] || workshop.participants <= 0}
                      className="bg-[#a4785a] hover:bg-[#8f674a] text-white text-xs px-3 py-1.5 h-auto"
                      size="sm"
                    >
                      {registering[workshop.works_and_events_id || workshop.id] ? (
                        'Joining...'
                      ) : workshop.participants <= 0 ? (
                        'Full'
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ show: false, type: '', message: '' })}
      />
    </div>
  );
};

export default WorkshopsEventsGrid;

