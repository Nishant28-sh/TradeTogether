import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import ReviewSystem from '../Review/ReviewSystem';

function ArtisanProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtisanProfile();
  }, [userId]);

  const fetchArtisanProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      setArtisan(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching artisan profile:', error);
      setLoading(false);
    }
  };

  const handleChat = () => {
    navigate('/chat');
  };

  const handleReviewAdded = () => {
    // Refresh artisan data to show updated ratings
    fetchArtisanProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading artisan profile...</p>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-lg text-red-600">Artisan not found</p>
        </div>
      </div>
    );
  }

  // Use first specialty as tag, or fallback
  const tag = artisan.specialties && artisan.specialties.length > 0 ? artisan.specialties[0] : (artisan.isArtisan ? `${artisan.artisanLevel} Artisan` : 'Artisan');
  // Use ratings and number of reviews as trades
  const rating = artisan.ratings || 0;
  const trades = artisan.reviews ? artisan.reviews.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {artisan.profilePhoto ? (
                    <img
                      className="w-full h-full object-cover"
                      src={`${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${artisan.profilePhoto}`}
                      alt={artisan.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold">
                      {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                  {tag}
                </span>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{artisan.name}</h1>
                <p className="text-purple-100 text-lg mb-2">
                  {artisan.isArtisan ? artisan.artisanLevel + ' Artisan' : 'Artisan'}
                </p>
                {artisan.location && (
                  <p className="text-purple-100 mb-4">📍 {artisan.location}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-xl">★</span>
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  </div>
                  <div className="text-purple-100">
                    <span className="font-semibold">{trades}</span> trades
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={handleChat}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  💬 Start Chat
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Bio Section */}
            {artisan.bio && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
                <p className="text-gray-600 leading-relaxed">{artisan.bio}</p>
              </div>
            )}

            {/* Skills Section */}
            {artisan.skills && artisan.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {artisan.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties Section */}
            {artisan.specialties && artisan.specialties.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {artisan.specialties.map((specialty, index) => (
                    <span 
                      key={index} 
                      className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-xl p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{rating.toFixed(1)}</div>
                <div className="text-gray-600 text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{trades}</div>
                <div className="text-gray-600 text-sm">Completed Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {artisan.isArtisan ? artisan.artisanLevel : 'New'}
                </div>
                <div className="text-gray-600 text-sm">Artisan Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSystem userId={userId} onReviewAdded={handleReviewAdded} />
      </div>
    </div>
  );
}

export default ArtisanProfile; 