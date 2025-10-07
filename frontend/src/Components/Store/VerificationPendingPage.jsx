import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationPending from './VerificationPending';
import api from '../../api';

const VerificationPendingPage = () => {
  const [storeData, setStoreData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stores/me');
        
        if (response.data && response.data.store) {
          setStoreData({
            storeName: response.data.store.store_name,
            category: response.data.store.category,
            ownerName: response.data.store.owner_name,
            ownerEmail: response.data.store.owner_email,
            status: response.data.store.status
          });
        } else {
          // No store found, redirect to create store
          navigate('/create-store');
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        setError('Failed to load store information');
        // If there's an error, redirect to create store
        navigate('/create-store');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [navigate]);

  const handleCheckStatus = async () => {
    try {
      const response = await api.get('/stores/me');
      
      if (response.data && response.data.store) {
        const status = response.data.store.status;
        
        if (status === 'approved') {
          // Store approved, redirect to seller dashboard
          navigate('/seller');
        } else if (status === 'rejected') {
          // Store rejected, redirect to create store to resubmit
          navigate('/create-store');
        }
        
        // Update store data with new status
        setStoreData(prev => ({
          ...prev,
          status: status
        }));
      }
    } catch (error) {
      console.error('Error checking store status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/create-store')}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <VerificationPending 
      storeData={storeData}
      onCheckStatus={handleCheckStatus}
    />
  );
};

export default VerificationPendingPage;
