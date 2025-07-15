import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../api";
import bgImg from "../Assets/background_img.png";
import { useNavigate } from 'react-router-dom';

function Register({ onRegisterSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillInput = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('password', form.password);
    data.append('location', form.location);
    data.append('skills', JSON.stringify(skills));
    if (profilePhoto) data.append('profilePhoto', profilePhoto);
    try {
      await axios.post(`${API_BASE_URL}/users/register`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage("Registration successful! Redirecting to profile...");
      if (onRegisterSuccess) onRegisterSuccess();
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative font-sans py-8"
      style={{
        background: `url(${bgImg}) center/cover no-repeat`
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-indigo-900/45 z-10"></div>
      
      {/* Register Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl shadow-2xl min-w-[320px] max-w-lg w-full mx-4 z-20 relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2 tracking-wide">Join TradeTogether</h2>
          <p className="text-gray-600">Create your account and start trading</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                name="name" 
                onChange={handleChange} 
                placeholder="Enter your full name" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                name="email" 
                type="email"
                onChange={handleChange} 
                placeholder="Enter your email" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                name="password" 
                type="password" 
                onChange={handleChange} 
                placeholder="Create a password" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input 
                name="location" 
                onChange={handleChange} 
                placeholder="City, Country (optional)" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills & Expertise
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <span 
                  key={skill} 
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-indigo-600 hover:text-indigo-800 text-lg font-bold leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={handleSkillInput}
              onKeyDown={handleSkillKeyDown}
              placeholder="Add a skill (press Enter or comma)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo (optional)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Create Account
          </button>

          {/* Message */}
          {message && (
            <div className={`text-center py-3 px-4 rounded-lg font-medium ${
              message.includes('success') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              Sign in here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register; 