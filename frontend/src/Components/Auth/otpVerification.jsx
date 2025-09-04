import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from Register.jsx redirect
  const email = location.state?.email;

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-red-500 font-medium">No email provided. Please register first.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const res = await api.post("/verify-otp", { userEmail: email, otp });
  
      // Save token
      localStorage.setItem("auth_token", res.data.token);
  
      // ✅ Fetch profile right away
      const profile = await api.get("/profile");
      localStorage.setItem("user", JSON.stringify(profile.data.user));
  
      // Redirect based on role
      if (res.data.user.role === "administrator") {
        navigate("/admin");
      } else if (res.data.user.role === "seller") {
        navigate("/seller");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "OTP verification failed. Try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Verify Your Email</h2>
        <p className="text-gray-600 text-center mb-6">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
