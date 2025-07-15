import React from "react";
import { FaUsers, FaHandshake, FaPaintBrush, FaComments, FaGift, FaGlobeAmericas } from "react-icons/fa";

const features = [
  {
    icon: <FaUsers />,
    title: "Creative Community",
    desc: "Join a vibrant group of artists, makers, and dreamers from around the world.",
  },
  {
    icon: <FaPaintBrush />,
    title: "Share Your Craft",
    desc: "Upload your handmade creations and let others discover your unique style.",
  },
  {
    icon: <FaHandshake />,
    title: "Trade with Trust",
    desc: "Safely exchange handmade goods with other artisans in a trusted space.",
  },
  {
    icon: <FaComments />,
    title: "Connect & Collaborate",
    desc: "Chat, comment, and team up on creative projects with fellow makers.",
  },
  {
    icon: <FaGift />,
    title: "Surprise Swaps",
    desc: "Join seasonal gift swaps to share and receive mystery handmade packages.",
  },
  {
    icon: <FaGlobeAmericas />,
    title: "Global Reach",
    desc: "Meet makers from every corner of the globe and exchange cultural creativity.",
  },
];

const CommunityFeatures = () => (
  <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-emerald-100">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold mb-4 shadow">👥 Community Perks</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Why Join the TradeTogether?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We’re more than a marketplace — we’re a movement. Discover what makes our community shine.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
        {features.map((feature, idx) => (
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center" key={idx}>
            <div className="text-4xl text-green-500 mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
     
    </div>
  </section>
);

export default CommunityFeatures;
