import React, { useState, useMemo } from "react";
import "../styles/Auth.css";
import logo from "../assets/logo1.png";
import { FaEnvelope, FaLock } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data);
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

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FaEnvelope/>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <FaLock/>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button className="ai-btn">
            Access Dashboard
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