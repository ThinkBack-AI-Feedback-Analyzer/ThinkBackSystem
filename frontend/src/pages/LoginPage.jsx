
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


          <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
            <AuthField
              label="Email"
              htmlFor="login-email"
              type="email"
              name="email"


              placeholder="Email Address"
              value={data.email}
              onChange={handleChange}
              disabled={loading}
              required

            />

            <AuthField
              label="Password"
              htmlFor="login-password"
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


            <button
              type="submit"
              className="w-full rounded-[24px] bg-[#184d35] px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-5 rounded-[26px] border border-[#d6ddd3] bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f3_100%)] px-5 py-3.5 text-center shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              Need a new account for your institution?
              <Link
                to="/institutions/register"
                className="ml-2 font-semibold text-[#184d35] transition hover:text-[#123925]"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
