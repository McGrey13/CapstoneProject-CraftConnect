import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowRight, X, AlertCircle } from "lucide-react";
import api from "../../api";
import "./Register.css";
import { useUser } from "../Context/UserContext";

const Register = () => {
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    userPassword_confirmation: "",
    userContactNumber: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const navigate = useNavigate();
  const { register } = useUser();

  // Auto-dismiss error modal after 7 seconds
  useEffect(() => {
    if (showErrorModal) {
      const timer = setTimeout(() => {
        setShowErrorModal(false);
        setError("");
        setErrorMessages([]);
      }, 7000); // 7 seconds

      return () => clearTimeout(timer);
    }
  }, [showErrorModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear general error if it exists
    if (error) {
      setError("");
    }
  };

  const handleRole = (type) => {
    setForm({ ...form, role: type });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    // Client-side validation
    const validationErrors = {};
    
    // Ensure all required fields are filled
    if (!form.role) {
      setErrorMessages(["Please select a role"]);
      setError("Please select a role");
      setShowErrorModal(true);
      return;
    }
    
    if (!form.userName || form.userName.trim() === "") {
      validationErrors.userName = ["The name field is required."];
    }
    
    if (!form.userEmail || form.userEmail.trim() === "") {
      validationErrors.userEmail = ["The email field is required."];
    } else if (!/\S+@\S+\.\S+/.test(form.userEmail)) {
      validationErrors.userEmail = ["The email must be a valid email address."];
    }
    
    if (!form.userPassword || form.userPassword === "") {
      validationErrors.userPassword = ["The password field is required."];
    } else if (form.userPassword.length < 8) {
      validationErrors.userPassword = ["The password must be at least 8 characters."];
    }
    
    if (!form.userPassword_confirmation || form.userPassword_confirmation === "") {
      validationErrors.userPassword_confirmation = ["The password confirmation field is required."];
    } else if (form.userPassword !== form.userPassword_confirmation) {
      validationErrors.userPassword_confirmation = ["The password confirmation does not match."];
    }
    
    if (!form.userContactNumber || form.userContactNumber.trim() === "") {
      validationErrors.userContactNumber = ["The contact number field is required."];
    }
    
    // If there are client-side validation errors, show them and don't submit
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const messages = Object.values(validationErrors).flat();
      setErrorMessages(messages);
      setError("Please correct the errors below.");
      setShowErrorModal(true);
      return;
    }

    try {
      // Reset errors
      setError("");
      setFieldErrors({});
      
      console.log("📝 Submitting registration with data:", {
        userName: form.userName,
        userEmail: form.userEmail,
        userPassword: form.userPassword ? `***${form.userPassword.length} chars***` : '(empty)',
        userPassword_confirmation: form.userPassword_confirmation ? `***${form.userPassword_confirmation.length} chars***` : '(empty)',
        userContactNumber: form.userContactNumber,
        role: form.role
      });
      
      // Call the register function from UserContext
      const result = await register({
        userName: form.userName.trim(),
        userEmail: form.userEmail.trim(),
        userPassword: form.userPassword,
        userPassword_confirmation: form.userPassword_confirmation,
        userContactNumber: form.userContactNumber.trim(),
        role: form.role,
      });

      console.log("Registration result:", result);
      
      // Navigate to OTP verification page with the email and next destination
      navigate("/verify-otp", { 
        state: { 
          email: result.userEmail || form.userEmail,
          registrationSuccess: true,
          redirectTo: form.role === 'seller' ? '/create-store' : undefined
        } 
      });
      
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", {
        status: err.response?.status,
        data: err.response?.data,
        errors: err.response?.data?.errors
      });
      
      if (err.response) {
        // Handle validation errors from the server
        if (err.response.status === 422 && err.response.data?.errors) {
          // Set field-specific errors
          setFieldErrors(err.response.data.errors);
          // Collect all error messages
          const messages = Object.values(err.response.data.errors).flat();
          setErrorMessages(messages.length > 0 ? messages : [err.response.data.message || 'Please correct the errors below.']);
          setError(err.response.data.message || 'Please correct the errors below.');
          setShowErrorModal(true);
          
          // Log detailed validation errors
          console.error("🔴 Validation errors:", JSON.stringify(err.response.data.errors, null, 2));
          return;
        } else if (err.response.data?.message) {
          // For other types of errors with a message
          setErrorMessages([err.response.data.message]);
          setError(err.response.data.message);
          setShowErrorModal(true);
          return;
        }
      }
      
      // Fallback error message
      setErrorMessages(['Registration failed. Please try again later.']);
      setError('Registration failed. Please try again later.');
      setShowErrorModal(true);
    }
  };
  

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setError("");
    setErrorMessages([]);
  };

  return (
    <div className="register-bg">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={handleCloseErrorModal}>
          <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <div className="error-modal-icon-wrapper">
                <AlertCircle className="error-modal-icon" />
              </div>
              <h3 className="error-modal-title">Registration Error</h3>
              <button
                onClick={handleCloseErrorModal}
                className="error-modal-close"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="error-modal-body">
              {errorMessages.length > 0 ? (
                <ul className="error-modal-list">
                  {errorMessages.map((message, index) => (
                    <li key={index} className="error-modal-item">
                      {message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="error-modal-text">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="register-card register-card-large">
        <div className="register-header">
          <div className="register-avatar">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="register-title">Create Account</div>
          <div className="register-subtitle">Sign up for CraftConnect</div>
        </div>
        <div className="register-tabs">
          <button
            type="button"
            className={`register-tab${form.role === "customer" ? " active" : ""}`}
            onClick={() => handleRole("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`register-tab${form.role === "seller" ? " active" : ""}`}
            onClick={() => handleRole("seller")}
          >
            Seller
          </button>
          <button
            type="button"
            className={`register-tab${form.role === "administrator" ? " active" : ""}`}
            onClick={() => handleRole("administrator")}
          >
            Admin
          </button>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="userName">Name</label>
          <input
            id="userName"
            name="userName"
            placeholder="Your name"
            type="text"
            value={form.userName}
            onChange={handleChange}
            required
            className={fieldErrors.userName ? 'border-red-500' : ''}
          />
          {fieldErrors.userName && (
            <div className="text-red-500 text-sm mt-1">
              {Array.isArray(fieldErrors.userName) ? fieldErrors.userName[0] : fieldErrors.userName}
            </div>
          )}
          <label htmlFor="userEmail">Email</label>
          <div className="input-wrapper">
            <input
              id="userEmail"
              name="userEmail"
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              placeholder="Email"
              required
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.userEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {fieldErrors.userEmail && (
            <div className="text-red-500 text-sm mt-1">
              {Array.isArray(fieldErrors.userEmail) ? fieldErrors.userEmail[0] : fieldErrors.userEmail}
            </div>
          )}
          <label htmlFor="userPassword">Password</label>
          <input
            id="userPassword"
            name="userPassword"
            placeholder="Password (minimum 8 characters)"
            type="password"
            value={form.userPassword}
            onChange={handleChange}
            required
            className={fieldErrors.userPassword ? 'border-red-500' : ''}
          />
          {fieldErrors.userPassword && (
            <div className="text-red-500 text-sm mt-1">
              {Array.isArray(fieldErrors.userPassword) ? fieldErrors.userPassword[0] : fieldErrors.userPassword}
            </div>
          )}
          <label htmlFor="userPassword_confirmation">Confirm Password</label>
          <input
            id="userPassword_confirmation"
            name="userPassword_confirmation"
            placeholder="Confirm Password"
            type="password"
            value={form.userPassword_confirmation}
            onChange={handleChange}
            required
            className={fieldErrors.userPassword_confirmation ? 'border-red-500' : ''}
          />
          {fieldErrors.userPassword_confirmation && (
            <div className="text-red-500 text-sm mt-1">
              {Array.isArray(fieldErrors.userPassword_confirmation) ? fieldErrors.userPassword_confirmation[0] : fieldErrors.userPassword_confirmation}
            </div>
          )}
          <label htmlFor="userContactNumber">Contact Number</label>
          <input
            id="userContactNumber"
            name="userContactNumber"
            placeholder="+63XXXXXXXXXX"
            type="text"
            value={form.userContactNumber}
            onChange={handleChange}
            required
            className={fieldErrors.userContactNumber ? 'border-red-500' : ''}
          />
          {fieldErrors.userContactNumber && (
            <div className="text-red-500 text-sm mt-1">
              {Array.isArray(fieldErrors.userContactNumber) ? fieldErrors.userContactNumber[0] : fieldErrors.userContactNumber}
            </div>
          )}
          <button type="submit" className="submit-btn">
            Register <ArrowRight className="h-4 w-4" />
          </button>
          <div className="register-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;