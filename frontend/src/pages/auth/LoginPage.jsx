import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo_4.png";
import { login } from "../../services/auth";

function AuthField({ label, htmlFor, type, name, placeholder, value, onChange, disabled, required }) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <input
        id={htmlFor}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
      />
    </div>
  );
}

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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await login(data.email, data.password);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      const userRole = response.user.role;
      if (userRole === 'system_admin') {
        navigate("/superadmin");
      } else if (userRole === 'institution_admin') {
        navigate("/institution-dashboard");
      } else if (userRole === 'coordinator' || userRole === 'lecturer') {
        navigate("/staff-dashboard");
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/">
            <img src={logo} alt="ThinkBack Logo" className="h-12 mx-auto mb-3 object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#13462D] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3a26] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need a new account for your institution?{' '}
            <Link to="/register" className="font-semibold text-[#13462D] transition hover:text-[#0f3a26]">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
