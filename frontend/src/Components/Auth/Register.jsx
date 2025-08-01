import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowRight, Mail } from "lucide-react";
import api from "../../api";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    // These keys MUST match your User.php $fillable array exactly
    userName: "",
    userPassword: "",
    password_confirmation: "", // This is for frontend and backend validation, not saved directly to DB
    userAge: "",
    userBirthDay: "",
    userEmail: "",
    userContactNumber: "",
    userAddress: "",
    userType: "customer",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserType = (type) => {
    setForm({ ...form, userType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/register", {
        userName: form.userName,
        userEmail: form.userEmail,
        userPassword: form.userPassword,
        password_confirmation: form.password_confirmation,
        userAge: form.userAge,
        userBirthDay: form.userBirthDay,
        userContactNumber: form.userContactNumber,
        userAddress: form.userAddress,
        userType: form.userType,
      });
      // Store the token
      localStorage.setItem("token", res.data.token);
      // Set the token in the API headers for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      // Redirect based on user type
      if (res.data.user.userType === "admin") {
        navigate("/admin-dashboard");
      } else if (res.data.user.userType === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        "Registration failed."
      );
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
            className={`register-tab${form.userType === "customer" ? " active" : ""}`}
            onClick={() => handleUserType("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`register-tab${form.userType === "seller" ? " active" : ""}`}
            onClick={() => handleUserType("seller")}
          >
            Seller
          </button>
          <button
            type="button"
            className={`register-tab${form.userType === "admin" ? " active" : ""}`}
            onClick={() => handleUserType("admin")}
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
          <label htmlFor="password_confirmation">Confirm Password</label>
          <input
            id="password_confirmation"
            name="password_confirmation" // This name is standard for Laravel's 'confirmed' rule
            placeholder="Confirm Password"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />
          <div className="register-row">
            <div className="register-col">
              <label htmlFor="userAge">Age</label>
              <input
                id="userAge"
                name="userAge" // Corrected name to match state and model
                placeholder="Your age"
                type="number"
                value={form.userAge}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-col">
              <label htmlFor="userBirthDay">Birth Date</label>
              <input
                id="userBirthDay"
                name="userBirthDay" // Corrected name to match state and model
                type="date"
                value={form.userBirthDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>
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
          <label htmlFor="userAddress">Address</label>
          <input
            id="userAddress"
            name="userAddress" // Corrected name to match state and model
            placeholder="Your address"
            type="text"
            value={form.userAddress}
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