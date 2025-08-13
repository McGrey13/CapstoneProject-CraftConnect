import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, ShoppingBag, Store, Mail } from "lucide-react";
import api from "../../api";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/login", { userEmail: email, userPassword: password });
      localStorage.setItem("token", res.data.token);
      // Set the token in the API headers for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      // Redirect based on user type
      if (res.data.user_type === "admin") {
        navigate("/admin");
      } else if (res.data.user_type === "seller") {
        navigate("/seller");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card login-card-large">
        <div className="login-header">
          <div className="login-avatar">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="login-title">Welcome Back</div>
          <div className="login-subtitle">Sign in to your CraftConnect account</div>
        </div>
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${role === "customer" ? " active" : ""}`}
            onClick={() => setRole("customer")}
          >
            <ShoppingBag className="h-4 w-4" /> Customer
          </button>
          <button
            type="button"
            className={`login-tab${role === "seller" ? " active" : ""}`}
            onClick={() => setRole("seller")}
          >
            <Store className="h-4 w-4" /> Seller
          </button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="remember-row">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          <button type="submit" className="submit-btn">
            {role === "customer" ? "Sign in as Customer" : "Sign in as Seller"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="login-or">
            <div className="login-or-line" />
            <span className="login-or-text">Or</span>
            <div className="login-or-line" />
          </div>
          <div className="login-footer">
            Don't have an account?{" "}
            <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
