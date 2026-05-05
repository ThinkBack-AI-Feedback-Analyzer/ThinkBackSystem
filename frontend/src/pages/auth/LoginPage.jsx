import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo_4.png";
import { login } from "../../services/auth";

const inputClassName =
  'w-full rounded-[24px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-5 py-4 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]';

function AuthField({ label, htmlFor, type, name, placeholder, value, onChange, disabled, required }) {
  return (
    <div className="group relative block mb-6">
      <label
        htmlFor={htmlFor}
        className="absolute left-5 top-0 z-10 -translate-y-1/2 rounded-full border border-[#dbe4db] bg-[#fcfbf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#244e39] shadow-sm transition-all group-focus-within:border-[#184d35] group-focus-within:text-[#184d35]"
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
        className={inputClassName}
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

  return (
    <div className="min-h-screen bg-[#f1efe8] text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link to="/">
            <img src={logo} alt="ThinkBack Logo" className="h-16 mx-auto mb-4 object-contain" />
          </Link>
          <h1 className="text-4xl font-semibold text-[#184d35]">Welcome Back</h1>
          <p className="mt-3 text-slate-500">Sign in to your account to continue</p>
        </div>

        <div className="rounded-[34px] border border-[#d8ddd3] bg-[#fcfbf7] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-10">
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
              className="w-full mt-4 rounded-3xl bg-[#184d35] px-6 py-5 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-8 rounded-[26px] border border-[#d6ddd3] bg-[linear-gradient(180deg,#ffffff_0%,#f6f8f3_100%)] px-5 py-4 text-center shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              Need a new account for your institution?
              <Link
                to="/register"
                className="ml-2 font-semibold text-[#184d35] transition hover:text-[#123925]"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
