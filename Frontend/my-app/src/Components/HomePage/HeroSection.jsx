import React, { useEffect, useState } from "react";
import { FaArrowRight, FaUser, FaUsers } from "react-icons/fa";
import backgroundImg from "../Assets/background_img.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api";

const HeroSection = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCommunities() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL.replace('/api','')}/api/communities`);
        setCommunities(res.data.slice(0, 3)); // Show first 3 featured
        setLoading(false);
      } catch (err) {
        setError("Failed to load communities");
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  const handleJoin = (id) => {
    navigate("/community-welcome");
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
        <p className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-lg font-medium mb-6 inline-block">
          Welcome to the Creative Community
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Share Your <span className="text-yellow-400">Creative Heart</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect with makers, trade handcrafted treasures, and discover the joy
          of sharing creativity in our warm community of artisans and dreamers.
        </p>
        <div className="mb-12">
          <button 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
            onClick={() => navigate('/products')}
          >
            Start Creating <FaArrowRight />
          </button>
        </div>

        {/* Featured Communities */}
        {/*
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Featured Communities
          </h3>
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading communities...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {communities.map((c) => (
                <div 
                  key={c._id} 
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {c.image && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={c.image} 
                        alt={c.name} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{c.name}</h4>
                    <p className="text-gray-600 text-sm mb-4">{c.description}</p>
                    <button
                      onClick={() => handleJoin(c._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
                    >
                      <FaUser /> Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        */}

        <div className="mb-12">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            onClick={() => navigate('/communities')}
          >
            <FaUsers /> CommunityShowcase
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">2.5k+</h2>
            <p className="text-lg">Makers</p>
          </div>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">15k+</h2>
            <p className="text-lg">Crafts Shared</p>
          </div>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">8k+</h2>
            <p className="text-lg">Happy Trades</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
