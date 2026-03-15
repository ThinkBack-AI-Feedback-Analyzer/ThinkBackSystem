import React from "react";
import "../styles/Auth.css";
import aiImage from "../assets/ai-feedback.jpg";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-wrapper">

      {/* Left Side Image */}
      <div className="auth-image">

        <img src={aiImage} alt="AI Feedback Analyzer"/>

        <div className="image-overlay">
          <h1>Think Back</h1>
          <p>AI-Powered Student Feedback Analyzer</p>
        </div>

      </div>

      {/* Right Side Form */}
      <div className="auth-form-container">

        <div className="auth-card">

          <h2>{title}</h2>
          <p className="subtitle">{subtitle}</p>

          {children}

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;