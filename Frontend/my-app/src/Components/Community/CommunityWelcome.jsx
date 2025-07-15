import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const bgUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

function CommunityWelcome() {
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  const handleJoin = () => {
    setJoined(true);
    // Optionally, call backend join API here
    setTimeout(() => navigate("/communities"), 1200);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: `url(${bgUrl}) center/cover no-repeat`
      }}
    >
      <div className="bg-black/70 rounded-2xl p-12 max-w-2xl w-full mx-4 text-white text-center shadow-2xl relative">
        <div className="bg-amber-900 text-amber-200 rounded-xl px-6 py-2 text-base font-medium inline-block mb-6 tracking-wide">
          Welcome to the Creative Community
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Share Your <span className="text-amber-400 italic">Creative Heart</span>
        </h1>
        
        <div className="text-amber-200 text-lg mb-8 leading-relaxed">
          Connect with makers, trade handcrafted treasures, and discover the joy of sharing creativity in our warm community of artisans and dreamers.
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg px-8 py-3 font-bold text-lg cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={() => navigate("/products")}
          >
            Start Creating →
          </button>
          <button
            className={`${
              joined 
                ? 'bg-green-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer transform hover:scale-105'
            } text-white border-none rounded-lg px-8 py-3 font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2`}
            disabled={joined}
            onClick={handleJoin}
          >
            <span className="text-xl">🧑‍🤝‍🧑</span> 
            {joined ? 'Joined!' : 'Join Community'}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-8 text-amber-200 font-bold text-lg">
          <div>
            <div className="text-2xl font-black text-amber-400">2.5k+</div>
            <div>Makers</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">15k+</div>
            <div>Crafts Shared</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">8k+</div>
            <div>Happy Trades</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityWelcome; 