import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen w-full relative bg-[#f8ecd7] font-sans overflow-hidden">
      {/* Background Illustration */}
      <img src="/login_background.png" alt="Product Exchange Illustration" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
      {/* Login Card at Bottom Left, responsive for mobile */}
      <div className="absolute left-16 bottom-16 z-10 max-w-sm w-full
        sm:left-1/2 sm:bottom-1/2 sm:transform sm:-translate-x-1/2 sm:translate-y-1/2 sm:max-w-xs">
        <div className="backdrop-blur-md bg-white/70 border border-[#e0cfa0] rounded-2xl shadow-2xl p-10 flex flex-col gap-6"
          style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)" }}>
          {/* Logo/Title */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-12 h-12 rounded-full bg-[#e0cfa0] flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-[#3d3322]">🛍️</span>
            </div>
            <h1 className="text-3xl font-bold text-[#2d2a7a]">Login</h1>
          </div>
          <form className="flex flex-col gap-4">
            <label className="text-[#2d2a7a] font-medium">Email</label>
            <input type="email" name="email" autoComplete="email" className="rounded-md border border-[#e0cfa0] p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#bfa77a]" placeholder="Enter your email" />
            <label className="text-[#2d2a7a] font-medium">Password</label>
            <input type="password" name="password" autoComplete="current-password" className="rounded-md border border-[#e0cfa0] p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#bfa77a]" placeholder="Enter your password" />
            <div className="flex justify-between items-center mt-2">
              <a href="#" className="text-xs text-[#7c6f57] hover:underline">Forgot Password?</a>
            </div>
            <button type="submit" className="mt-4 bg-[#3d3322] text-white rounded-md py-2 text-lg font-semibold hover:bg-[#5a4732] transition">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
} 