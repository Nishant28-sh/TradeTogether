import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../api";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function AuthBox({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    if (mode === "login") {
      setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    } else {
      setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/login', loginForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      setMessage("Login successful!");
      if (onLogin) onLogin(res.data.user);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', registerForm);
      setMessage("Registration successful! Please login.");
      setMode("login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId="590154599751-p9qpkbp2u13775vcasiassr0ka2iujsv.apps.googleusercontent.com">
      <div className="min-h-screen w-full relative bg-[#f8ecd7] font-sans overflow-hidden">
        {/* Background Illustration */}
        <img src="/login_background.png" alt="Product Exchange Illustration" className="absolute inset-0 min-h-screen w-full h-full object-fill object-center z-0 bg-[#2d2a7a]" />
        {/* Auth Card Tall Left-aligned */}
        <div className="absolute left-0 top-0 h-full flex items-center z-10" style={{ width: '37vw', minWidth: 340 }}>
          <div className="h-[90vh] w-full flex flex-col justify-center bg-[#bfa77a] rounded-[2.5rem] shadow-2xl p-12 gap-8">
            <h2 className="text-5xl font-bold text-[#f6e7c1] mb-8">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <label className="text-[#f6e7c1] text-xl font-medium">Email</label>
                <input
                  name="email"
                  value={loginForm.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="rounded-lg border-none p-4 bg-[#e7dbc2] text-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77a]"
                />
                <label className="text-[#f6e7c1] text-xl font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="rounded-lg border-none p-4 bg-[#e7dbc2] text-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77a]"
                />
                <button
                  type="submit"
                  className="mt-4 bg-[#3d3322] text-[#f6e7c1] rounded-lg py-3 text-xl font-bold hover:bg-[#5a4732] transition"
                >
                  Log In
                </button>
                {/* Google Login Button */}
                <div className="flex justify-center my-2">
                  <GoogleLogin
                    text="icon"
                    onSuccess={async (credentialResponse) => {
                      try {
                        const res = await axios.post('/api/users/google-login', { token: credentialResponse.credential });
                        localStorage.setItem("token", res.data.token);
                        localStorage.setItem("userId", res.data.user._id);
                        setMessage("Login successful!");
                        if (onLogin) onLogin(res.data.user);
                      } catch (err) {
                        setMessage(err.response?.data?.message || "Google login failed");
                      }
                    }}
                    onError={() => {
                      setMessage("Google login failed");
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <span className="text-base text-[#222] mt-2">or</span>
                  <span className="text-base text-[#222]">Don’t have an account?</span>
                  <button
                    type="button"
                    className="mt-1 text-lg text-[#222] font-semibold hover:underline focus:outline-none"
                    onClick={() => { setMode('register'); setMessage(''); }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-6">
                <label className="text-[#f6e7c1] text-xl font-medium">Name</label>
                <input
                  name="name"
                  value={registerForm.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="rounded-lg border-none p-4 bg-[#e7dbc2] text-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77a]"
                />
                <label className="text-[#f6e7c1] text-xl font-medium">Email</label>
                <input
                  name="email"
                  value={registerForm.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="rounded-lg border-none p-4 bg-[#e7dbc2] text-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77a]"
                />
                <label className="text-[#f6e7c1] text-xl font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="rounded-lg border-none p-4 bg-[#e7dbc2] text-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77a]"
                />
                <button
                  type="submit"
                  className="mt-6 bg-[#3d3322] text-[#f6e7c1] rounded-lg py-4 text-2xl font-bold hover:bg-[#5a4732] transition"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className="mt-4 bg-[#e7dbc2] text-[#3d3322] rounded-lg py-3 text-xl font-semibold border border-[#bfa77a] hover:bg-[#f6e7c1] transition"
                  onClick={() => { setMode('login'); setMessage(''); }}
                >
                  Back to Login
                </button>
              </form>
            )}
            {message && (
              <div className={`mt-4 text-center font-medium p-3 rounded-lg ${
                message.includes('success')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
} 