import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowRight, Mail } from "lucide-react";
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
  const navigate = useNavigate();
  const { register } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRole = (type) => {
    setForm({ ...form, role: type });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Ensure all required fields are filled
    if (!form.role) {
      setError("Please select a role");
      return;
    }

    try {
      // Call the register function from UserContext
      const result = await register({
        userName: form.userName,
        userEmail: form.userEmail,
        userPassword: form.userPassword,
        userPassword_confirmation: form.userPassword_confirmation,
        userContactNumber: form.userContactNumber,
        role: form.role,
      });

      console.log("Registration result:", result);
      
      // Navigate to OTP verification page with the email
      navigate("/verify-otp", { 
        state: { 
          email: result.userEmail || form.userEmail 
        } 
      });
      
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        // Handle validation errors from the server
        if (err.response.data?.errors) {
          errorMessage = Object.values(err.response.data.errors)
            .flat()
            .join('\n');
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    }
  };
  

  return (
    <div className="register-bg">
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
            name="userName" // Corrected name to match state and model
            placeholder="Your name"
            type="text"
            value={form.userName}
            onChange={handleChange}
            required
          />
          <label htmlFor="userEmail">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="userEmail"
              name="userEmail" // Corrected name to match state and model
              placeholder="you@example.com"
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              required
            />
          </div>
          <label htmlFor="userPassword">Password</label>
          <input
            id="userPassword"
            name="userPassword" // Corrected name to match state and model
            placeholder="Password"
            type="password"
            value={form.userPassword}
            onChange={handleChange}
            required
          />
          <label htmlFor="userPassword_confirmation">Confirm Password</label>
          <input
            id="userPassword_confirmation"
            name="userPassword_confirmation" // This name is standard for Laravel's 'confirmed' rule
            placeholder="Confirm Password"
            type="password"
            value={form.userPassword_confirmation}
            onChange={handleChange}
            required
          />
          <label htmlFor="userContactNumber">Contact Number</label>
          <input
            id="userContactNumber"
            name="userContactNumber" // Corrected name to match state and model
            placeholder="+63XXXXXXXXXX"
            type="text"
            value={form.userContactNumber}
            onChange={handleChange}
            required
          />
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
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