import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaUsers, FaCalendar, FaStar, FaPlus, FaFire } from 'react-icons/fa';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState({ participating: [], created: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchChallenges() {
      setLoading(true);
      try {
        const [challengesRes, userChallengesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/challenges`),
          axios.get(`${API_BASE_URL}/challenges/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setChallenges(challengesRes.data);
        setUserChallenges(userChallengesRes.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load challenges");
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId) => {
    try {
      await axios.post(`${API_BASE_URL}/challenges/${challengeId}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh challenges
      const res = await axios.get(`${API_BASE_URL}/challenges`);
      setChallenges(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join challenge');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Monthly': return 'bg-blue-100 text-blue-700';
      case 'Seasonal': return 'bg-purple-100 text-purple-700';
      case 'Special': return 'bg-orange-100 text-orange-700';
      case 'Community': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredChallenges = () => {
    switch (activeTab) {
      case 'participating':
        return userChallenges.participating;
      case 'created':
        return userChallenges.created;
      default:
        return challenges;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading challenges...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 text-xl mb-4">⚠️</div>
        <p className="text-lg text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4">Community Challenges</h1>
          <p className="text-xl text-orange-600 max-w-2xl mx-auto">
            Join exciting challenges, showcase your skills, and win amazing prizes with fellow artisans.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}>
                All Challenges
              </button>
              <button
                onClick={() => setActiveTab('participating')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === 'participating' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}>
                Participating
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === 'created' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}>
                Created
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === 'events'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-500'
                }`}>
                Events
              </button>
            </div>
          </div>
        </div>

        {/* Create Challenge Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/create-challenge')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-8 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center mx-auto">
            <FaPlus className="mr-2" />
            Create New Challenge
          </button>
        </div>

        {/* Challenges Grid */}
        {activeTab === 'events' ? (
          <div className="text-center text-xl text-orange-700 font-semibold py-16">
            Events feature coming soon!
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChallenges().map((challenge) => (
            <div key={challenge._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Challenge Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                {challenge.image ? (
                  <img src={`http://localhost:4000/${challenge.image}`} alt={challenge.title} className="w-full h-full object-cover" />
                ) : (
                  <FaTrophy className="text-6xl text-orange-400" />
                )}
              </div>

              {/* Challenge Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{challenge.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(challenge.category)}`}>
                    {challenge.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  {challenge.theme && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {challenge.theme}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    <span>{challenge.participants?.length || 0} participants</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="mr-1" />
                    <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Prizes */}
                {challenge.prizes && challenge.prizes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Prizes</h4>
                    <div className="space-y-1">
                      {challenge.prizes.slice(0, 2).map((prize, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <FaTrophy className="text-yellow-500 mr-2" />
                          <span className="text-gray-600">{prize.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/challenges/${challenge._id}`)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                    View Details
                  </button>
                  {activeTab === 'all' && !challenge.participants?.includes(localStorage.getItem('userId')) && (
                    <button
                      onClick={() => handleJoinChallenge(challenge._id)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                      Join
                    </button>
                  )}
                </div>

                {/* Status */}
                {challenge.participants?.includes(localStorage.getItem('userId')) && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <FaFire className="mr-1" />
                      Participating
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Empty State */}
        {filteredChallenges().length === 0 && (
          <div className="text-center py-16">
            <FaTrophy className="text-6xl text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {activeTab === 'all' ? 'No Challenges Available' : 
               activeTab === 'participating' ? 'Not Participating in Any Challenges' :
               'No Challenges Created'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' ? 'Check back later for new challenges!' :
               activeTab === 'participating' ? 'Join some challenges to see them here!' :
               'Create your first challenge to get started!'}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/create-challenge')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                Create Challenge
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges; 