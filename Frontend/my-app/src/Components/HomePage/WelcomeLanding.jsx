import React from "react";
import frontImg from "../Assets/front_img.png";
import logo from "../Assets/logo.png";

function WelcomeLanding({ onStart }) {
  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center relative font-sans bg-cover bg-center"
      style={{ backgroundImage: `url(${frontImg})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      <div className="z-20 text-white text-center relative flex flex-col items-center">
        <img
          src={logo}
          alt="TradeTogether Logo"
          className="w-24 h-24 rounded-2xl mb-4 shadow-lg"
        />
        <div className="text-2xl font-semibold mb-2 tracking-wide">TradeTogether</div>
        <div className="text-lg font-normal mb-8 text-indigo-100">Maker Community</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Welcome to TradeTogether</h1>
        <h3 className="text-2xl font-normal mb-8">Discover, trade, and connect together</h3>
        <button
          onClick={onStart}
          className="px-9 py-3 text-lg rounded-lg bg-white text-gray-800 font-semibold border-none cursor-pointer shadow-md hover:bg-indigo-100 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default WelcomeLanding; 