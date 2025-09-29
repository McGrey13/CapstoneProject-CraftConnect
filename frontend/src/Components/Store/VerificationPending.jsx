import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Mail, Phone, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../api';

const VerificationPending = ({ storeData, onCheckStatus }) => {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [storeStatus, setStoreStatus] = useState(storeData.status || 'pending');
  const [lastChecked, setLastChecked] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkingStatus) {
        checkStoreStatus();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [checkingStatus]);

  const checkStoreStatus = async () => {
    try {
      setCheckingStatus(true);
      await onCheckStatus();
    } catch (error) {
      console.error('Error checking store status:', error);
    } finally {
      setCheckingStatus(false);
      setLastChecked(new Date());
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusIcon = () => {
    switch (storeStatus) {
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-amber-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (storeStatus) {
      case 'approved':
        return {
          title: 'Store Approved!',
          message: 'Congratulations! Your store has been approved and verified. You will be redirected to your seller dashboard shortly.',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          title: 'Store Under Review',
          message: 'Your store application needs additional information. Please contact support for details.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Store Under Review',
          message: 'Your store application is being reviewed by our team. We will notify you once the review is complete.',
          color: 'text-amber-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {statusInfo.message}
              </p>
            </div>

            {/* Store Information */}
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-700 mb-4">Your Store Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Store Name:</span> {storeData.storeName}</p>
                <p><span className="font-medium">Category:</span> {storeData.category}</p>
                <p><span className="font-medium">Owner:</span> {storeData.ownerName}</p>
                <p><span className="font-medium">Email:</span> {storeData.ownerEmail}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    storeStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    storeStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {storeStatus.charAt(0).toUpperCase() + storeStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Need Help?</h3>
              <div className="flex items-center justify-center space-x-6 text-blue-700">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">support@craftconnect.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm">+63 123 456 7890</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={checkStoreStatus}
                disabled={checkingStatus}
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                {checkingStatus ? 'Checking...' : 'Check Status'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Logout
              </Button>
            </div>

            {/* Last Checked */}
            <div className="text-sm text-gray-500">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>

            {/* Auto-check notice */}
            <div className="text-xs text-gray-400 bg-gray-100 rounded-lg p-3">
              <p className="font-medium mb-1">Automatic Status Updates</p>
              <p>We automatically check your store status every 30 seconds. You can also manually check using the button above.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPending;
