import React, { useState } from "react";
import "../styles/Auth.css";
import logo from "../assets/logo1.png";
import { FaUser, FaEnvelope, FaUniversity, FaLock } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";

const RegisterPage = () => {

  const [form,setForm] = useState({});

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = (e)=>{
    e.preventDefault();
    console.log(form);
  };

  return (

    <div className="ai-container">

<div className="bubble-bg">
  {Array.from({length: 20}).map((_, i) => (
    <div
      key={i}
      className="bubble"
      style={{
        left: `${Math.random() * 100}%`,
        width: `${10 + Math.random() * 30}px`,
        height: `${10 + Math.random() * 30}px`,
        animationDuration: `${5 + Math.random() * 15}s`,
        animationDelay: `${Math.random() * 10}s`
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

        <h2>Create Your Account</h2>

        <p className="tagline">
          Join thousands of educators using AI to improve curriculum quality
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FaUser/>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <FaEnvelope/>
            <input
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <FaUniversity/>
            <input
              name="university"
              placeholder="University"
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

          <div className="input-group">
            <FaLock/>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              onChange={handleChange}
            />
          </div>

          <button className="ai-btn">
            Create Account
          </button>

        </form>

        <p className="switch">
          Already have account? <a href="/">Login</a>
        </p>

      </div>

    </div>

  );
};

export default RegisterPage;
