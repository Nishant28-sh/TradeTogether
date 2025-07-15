import React, { useState, useEffect } from 'react';
import { FaStar, FaExchangeAlt, FaUsers, FaHandshake, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';

const CommunityShowcase = () => {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feed/community`);
      setCommunityData(response.data);
    } catch (err) {
      console.error('Error fetching community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/logo192.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\\?uploads\\?/, 'uploads/').replace(/^\/+/, '');
    return `http://localhost:4000/${cleanPath}`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!communityData) return null;

  return (
    <div className="py-16 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-700 mb-4">Community Showcase</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing trades, meet talented artisans, and explore trending creations from our vibrant community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <FaUsers className="text-3xl text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{communityData.stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <FaStar className="text-3xl text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{communityData.stats.totalArtisans}</div>
            <div className="text-sm text-gray-600">Artisans</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <FaExchangeAlt className="text-3xl text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{communityData.stats.totalProducts}</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <FaHandshake className="text-3xl text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{communityData.stats.totalTrades}</div>
            <div className="text-sm text-gray-600">Successful Trades</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Trades */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-purple-700">Latest Trades</h3>
              <FaExchangeAlt className="text-orange-500 text-xl" />
            </div>
            
            <div className="space-y-4">
              {communityData.latestTrades.slice(0, 3).map((trade, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={getImageUrl(trade.proposer.profilePhoto)}
                      alt={trade.proposer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{trade.proposer.name}</div>
                      <div className="text-xs text-gray-500">traded with {trade.receiver.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {trade.offeredProducts.length} items for {trade.requestedProducts.length} items
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/trades')}
              className="w-full mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              View All Trades <FaArrowRight />
            </button>
          </div>

          {/* Featured Artisans */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-purple-700">Featured Artisans</h3>
              <FaStar className="text-yellow-500 text-xl" />
            </div>
            
            <div className="space-y-4">
              {communityData.featuredUsers.slice(0, 3).map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => navigate(`/artisan/${user._id}`)}>
                  <img
                    src={getImageUrl(user.profilePhoto)}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {renderStars(Math.round(user.ratings))}
                      <span>{user.ratings.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-500">{user.artisanLevel} • {user.successfulTrades} trades</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/creative-treasures')}
              className="w-full mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              Discover More <FaArrowRight />
            </button>
          </div>

          {/* Trending Items */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-purple-700">Trending Items</h3>
              <FaExchangeAlt className="text-green-500 text-xl" />
            </div>
            
            <div className="space-y-4">
              {communityData.trendingItems.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => navigate(`/products/${product._id}`)}>
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{product.title}</div>
                    <div className="text-sm text-green-600 font-semibold">₹{product.value}</div>
                    <div className="text-xs text-gray-500">by {product.owner.name}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/creative-treasures')}
              className="w-full mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              Browse All <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Join Our Creative Community</h3>
            <p className="text-lg mb-6 opacity-90">
              Start trading your handmade creations and connect with fellow artisans
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Trading Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityShowcase;