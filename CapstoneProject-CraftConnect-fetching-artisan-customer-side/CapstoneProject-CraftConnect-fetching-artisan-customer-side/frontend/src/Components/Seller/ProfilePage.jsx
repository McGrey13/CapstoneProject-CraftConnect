import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const ProfilePage = () => {
    // State to hold the original user data
    const [user, setUser] = useState(null);
    // State to hold a temporary copy of user data for editing
    const [editableUser, setEditableUser] = useState({
        userName: '',
        userEmail: '',
        userBirthday: '',
        userContactNumber: '',
        userAddress: '',
    });
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Function to fetch the current user's data from the backend
    const fetchUserData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication token not found. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.statusText}`);
            }

            const userData = await response.json();
            setUser(userData);
            setEditableUser(userData); // Initialize editable state with fetched data
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect hook to fetch user data when the component mounts
    useEffect(() => {
        fetchUserData();
    }, []);

    // Handles changes to the input fields in edit mode
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableUser(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handles the "Save" action, sending a PUT request to the backend
    const handleSave = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editableUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile.');
            }

            const updatedUser = await response.json();
            setUser(updatedUser); // Update the main user state with the new data
            setIsEditing(false); // Exit edit mode
            alert("Profile updated successfully!");
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle account deactivation
    const handleDeactivate = async () => {
        if (!window.confirm("Are you sure you want to deactivate your account?")) {
            return;
        }

        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch('http://localhost:8000/api/profile/deactivate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("Account deactivated successfully. You will now be logged out.");
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            } else {
                const errorData = await response.json();
                alert(`Deactivation failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Deactivation error:', error);
            alert("An error occurred during deactivation.");
        }
    };

    // Function to handle account deletion
    const handleDelete = async () => {
        if (!window.confirm("WARNING: Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("Account deleted successfully. You will now be logged out.");
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            } else {
                const errorData = await response.json();
                alert(`Deletion failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Deletion error:', error);
            alert("An error occurred during deletion.");
        }
    };

    if (isLoading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return <div>No user data available.</div>;
    }

    return (
        <div className="flex-1 p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>View and edit your personal details.</CardDescription>
                    </div>
                    {isEditing ? (
                        <div className="space-x-2">
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={() => {
                                setIsEditing(false);
                                setEditableUser(user); // Revert changes on cancel
                            }}>Cancel</Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="userName">Name</Label>
                        <Input
                            id="userName"
                            name="userName"
                            value={isEditing ? editableUser.userName : user.userName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label htmlFor="userEmail">Email</Label>
                        <Input
                            id="userEmail"
                            name="userEmail"
                            value={isEditing ? editableUser.userEmail : user.userEmail}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" name="role" value={user.role} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="userBirthday">Birthday</Label>
                        <Input
                            id="userBirthday"
                            name="userBirthday"
                            value={isEditing ? editableUser.userBirthday : user.userBirthday}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label htmlFor="userContactNumber">Contact Number</Label>
                        <Input
                            id="userContactNumber"
                            name="userContactNumber"
                            value={isEditing ? editableUser.userContactNumber || '' : user.userContactNumber || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <Label htmlFor="userAddress">Address</Label>
                        <Input
                            id="userAddress"
                            name="userAddress"
                            value={isEditing ? editableUser.userAddress || '' : user.userAddress || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account status and data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={handleDeactivate}>Deactivate Account</Button>
                        <span className="text-sm text-gray-500">Temporarily disable your account.</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="destructive" onClick={handleDelete}>Delete Account</Button>
                        <span className="text-sm text-gray-500">Permanently delete your account and all data.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;