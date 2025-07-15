import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

function GamificationHub() {
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [selectedPeriod, setSelectedPeriod] = useState('AllTime');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedPeriod]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch achievements
      const achievementsRes = await axios.get(`${API_BASE_URL}/gamification/achievements`, { headers });
      setAchievements(achievementsRes.data.achievements);
      setUserStats({
        totalPoints: achievementsRes.data.totalPoints,
        level: achievementsRes.data.level,
        badges: achievementsRes.data.badges
      });

      // Fetch challenges
      const challengesRes = await axios.get(`${API_BASE_URL}/gamification/challenges`);
      setChallenges(challengesRes.data);

      // Fetch leaderboards
      const leaderboardsRes = await axios.get(
        `${API_BASE_URL}/gamification/leaderboards?category=${selectedCategory}&period=${selectedPeriod}`
      );
      setLeaderboards(leaderboardsRes.data.entries || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/gamification/challenges/${challengeId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Joined challenge successfully!');
      fetchData();
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert('Failed to join challenge. Please try again.');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-orange-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading gamification hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* User Stats Header */}
        {userStats && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🏆</div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{userStats.totalPoints}</div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-4xl mr-4">⭐</div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">Level {userStats.level}</div>
                    <div className="text-gray-600">Current Level</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🎖️</div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{userStats.badges.length}</div>
                    <div className="text-gray-600">Badges Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'achievements', label: 'Achievements', count: achievements.length },
            { id: 'challenges', label: 'Challenges', count: challenges.length },
            { id: 'leaderboards', label: 'Leaderboards', count: null }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`rounded-xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                    achievement.isUnlocked 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                      : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 opacity-75'
                  }`}>
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <div className="text-4xl">{achievement.icon || '🏆'}</div>
                        {achievement.isUnlocked && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                        <p className="text-gray-600 text-sm">{achievement.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-800">{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(achievement.progress)}`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-bold">+{achievement.points} points</span>
                      <span className="text-purple-600 text-sm font-medium">{achievement.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Active Challenges</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {challenges.map((challenge) => (
                  <div key={challenge._id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.category === 'Crafting' ? 'bg-blue-100 text-blue-800' :
                        challenge.category === 'Trading' ? 'bg-green-100 text-green-800' :
                        challenge.category === 'Community' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{challenge.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">📅 Ends</div>
                        <div className="font-semibold text-gray-800">
                          {new Date(challenge.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">👥 Participants</div>
                        <div className="font-semibold text-gray-800">{challenge.participants.length}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {challenge.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Rewards:</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          +{challenge.rewards.points} points
                        </span>
                        {challenge.rewards.badges.map((badge, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      {challenge.userParticipation ? (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-600 font-semibold">Participating</span>
                            <span className="text-sm font-bold text-gray-800">{challenge.userParticipation.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.userParticipation.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                          onClick={() => handleJoinChallenge(challenge._id)}
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboards' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Leaderboards</h2>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Overall">Overall</option>
                    <option value="Crafting">Crafting</option>
                    <option value="Trading">Trading</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Period:</label>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="AllTime">All Time</option>
                    <option value="ThisMonth">This Month</option>
                    <option value="ThisWeek">This Week</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {leaderboards.map((entry, index) => (
                  <div key={entry._id} className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-500 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                        {entry.user.profilePhoto ? (
                          <img 
                            src={`${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${entry.user.profilePhoto}`} 
                            alt={entry.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {entry.user.name ? entry.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{entry.user.name}</div>
                        <div className="text-sm text-gray-600">{entry.user.artisanLevel} Artisan</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{entry.points}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamificationHub; 