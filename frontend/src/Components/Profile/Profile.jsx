import React, { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userContactNumber: '',
    userAddress: '',
    userBirthday: '',
    userCity: '',
    userPostalCode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        userContactNumber: user.userContactNumber || '',
        userAddress: user.userAddress || '',
        userBirthday: user.userBirthday || '',
        userCity: user.userCity || '',
        userPostalCode: user.userPostalCode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll just update the local state
      updateUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                {isEditing ? (
                  <Input
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userContactNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </Label>
                {isEditing ? (
                  <Input
                    id="userContactNumber"
                    name="userContactNumber"
                    value={formData.userContactNumber}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userContactNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userBirthday" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Birthday
                </Label>
                {isEditing ? (
                  <Input
                    id="userBirthday"
                    name="userBirthday"
                    type="date"
                    value={formData.userBirthday}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userBirthday}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              {isEditing ? (
                <Input
                  id="userAddress"
                  name="userAddress"
                  value={formData.userAddress}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="text-sm text-gray-600">{formData.userAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userCity" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </Label>
                {isEditing ? (
                  <Input
                    id="userCity"
                    name="userCity"
                    value={formData.userCity}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userCity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPostalCode" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Postal Code
                </Label>
                {isEditing ? (
                  <Input
                    id="userPostalCode"
                    name="userPostalCode"
                    value={formData.userPostalCode}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{formData.userPostalCode}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
