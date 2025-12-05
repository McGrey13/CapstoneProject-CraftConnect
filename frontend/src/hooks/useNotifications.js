import { useState, useEffect, useCallback } from 'react';
import api, { getToken } from '../api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    const token = getToken();
    if (!token) {
      setUnreadCount(0);
      setNotifications([]);
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notifications', {
        params: {
          per_page: params.perPage || 20,
          type: params.type || undefined,
          read: params.read || undefined,
        },
      });

      setNotifications(response.data.notifications || []);
      return response.data;
    } catch (err) {
      // Suppress expected 401 errors (user not logged in)
      if (err.response?.status === 401 || err.suppressError) {
        setUnreadCount(0);
        setNotifications([]);
        return null;
      }
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUnreadCount(0);
      return 0;
    }
    try {
      const response = await api.get('/notifications/unread-count');

      setUnreadCount(response.data.count || 0);
      return response.data.count || 0;
    } catch (err) {
      // Suppress expected 401 errors and network errors
      if (err.response?.status !== 401 && !err.suppressError) {
        console.error('Error fetching unread count:', err);
      }
      setUnreadCount(0);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read`);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationID === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read');

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );

      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);

      // Update local state
      setNotifications(prev => prev.filter(notif => notif.notificationID !== notificationId));

      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [fetchUnreadCount]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete('/notifications/read/delete-all');

      // Update local state - remove all read notifications
      setNotifications(prev => prev.filter(notif => !notif.is_read));

      return true;
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
      return false;
    }
  }, []);

  // Poll for new notifications (for real-time updates)
  useEffect(() => {
    // Only start polling if token exists
    const token = getToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    // Wait a bit to ensure auth check completes
    const timer = setTimeout(() => {
      fetchUnreadCount();
    }, 300);

    // Set up polling every 30 seconds, but check token each time
    const interval = setInterval(() => {
      const currentToken = getToken();
      if (currentToken) {
        fetchUnreadCount();
      } else {
        setUnreadCount(0);
      }
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications;

