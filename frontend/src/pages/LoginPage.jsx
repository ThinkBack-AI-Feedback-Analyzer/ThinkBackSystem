import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import logo from "../assets/logo1.png";
import { FaEnvelope, FaLock } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import { login } from "../services/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await login(data.email, data.password);
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Store user data (including role)
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on user role
      const userRole = response.data.user.role;
      if (userRole === 'institution_admin') {
        navigate("/institution-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Invalid email or password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate bubbles only once
  const bubbles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      width: `${10 + Math.random() * 30}px`,
      height: `${10 + Math.random() * 30}px`,
      animationDuration: `${5 + Math.random() * 15}s`,
      animationDelay: `${Math.random() * 10}s`
    }));
  }, []); // empty dependency → runs only once

  return (
    <div className="ai-container">

      <div className="bubble-bg">
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: bubble.left,
              width: bubble.width,
              height: bubble.height,
              animationDuration: bubble.animationDuration,
              animationDelay: bubble.animationDelay
            }}
          ></div>
        ))}
      </div>

      <div className="grid-bg"></div>

      <div className="ai-card">

        <div className="logo-title">
          <img src={logo} alt="ThinkBack Logo" className="logo-img"/>
          <h1 className="logo">ThinkBack</h1>
        </div>

        <h2>Welcome Back</h2>

        <p className="tagline">
          Sign in to your account to continue
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FaEnvelope/>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={data.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <FaLock/>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={data.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button className="ai-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Access Dashboard"}
          </button>

        </form>

        <p className="switch">
          No account? <a href="/register">Register</a>
        </p>

      </div>

    </div>
  );
};

export default LoginPage;