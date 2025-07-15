import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

function MentorshipHub() {
  const [activeTab, setActiveTab] = useState('mentors');
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myMentorships, setMyMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch mentors and mentees
      const [mentorsRes, menteesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/mentorship/mentors`),
        axios.get(`${API_BASE_URL}/mentorship/mentees`)
      ]);

      setMentors(mentorsRes.data);
      setMentees(menteesRes.data);

      // Fetch user-specific data
      const [requestsRes, mentorshipsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/mentorship/requests`, { headers }),
        axios.get(`${API_BASE_URL}/mentorship/my-mentorships`, { headers })
      ]);

      setRequests(requestsRes.data);
      setMyMentorships(mentorshipsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
      setLoading(false);
    }
  };

  const handleMentorshipRequest = async (mentorId) => {
    try {
      const token = localStorage.getItem('token');
      const message = prompt('Please describe what you hope to learn and your goals:');
      
      if (!message) return;

      await axios.post(
        `${API_BASE_URL}/mentorship/mentors/${mentorId}/request`,
        {
          message,
          skills: currentUser.skills || [],
          goals: ['Improve skills', 'Learn new techniques']
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Mentorship request sent successfully!');
      fetchData();
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      alert('Failed to send request. Please try again.');
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const responseMessage = status === 'Accepted' 
        ? 'I would be happy to mentor you!' 
        : 'Thank you for your interest, but I cannot take on new mentees at this time.';

      await axios.put(
        `${API_BASE_URL}/mentorship/requests/${requestId}`,
        { status, responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Request ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request. Please try again.');
    }
  };

  const toggleMentorStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const isCurrentlyMentor = mentors.some(m => m._id === currentUser.id);
      
      await axios.put(
        `${API_BASE_URL}/mentorship/toggle-mentor`,
        { isMentor: !isCurrentlyMentor },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Mentor status ${!isCurrentlyMentor ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling mentor status:', error);
      alert('Failed to update mentor status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading mentorship hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">Mentorship Hub</h1>
          <p className="text-xl text-blue-600 max-w-2xl mx-auto mb-8">
            Connect with experienced artisans and share your knowledge
          </p>
          
          {currentUser && (
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                mentors.some(m => m._id === currentUser.id) 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              onClick={toggleMentorStatus}
            >
              {mentors.some(m => m._id === currentUser.id) ? 'Disable Mentor Mode' : 'Enable Mentor Mode'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'mentors', label: 'Find Mentors', count: mentors.length },
            { id: 'mentees', label: 'Find Mentees', count: mentees.length },
            { id: 'requests', label: 'Requests', count: requests.length },
            { id: 'my-mentorships', label: 'My Mentorships', count: myMentorships.length }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'mentors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div key={mentor._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      {mentor.profilePhoto ? (
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${mentor.profilePhoto}`} 
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                          {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{mentor.name}</h3>
                      <p className="text-blue-600 font-medium">{mentor.artisanLevel} Artisan</p>
                    </div>
                  </div>
                  
                  {mentor.location && (
                    <p className="text-gray-600 mb-3">📍 {mentor.location}</p>
                  )}
                  
                  {mentor.bio && (
                    <p className="text-gray-700 mb-4 line-clamp-3">{mentor.bio}</p>
                  )}
                  
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-yellow-600 font-semibold">⭐ {mentor.ratings || 0}</span>
                    <span className="text-purple-600 font-semibold">🏆 {mentor.points || 0} pts</span>
                  </div>
                  
                  {currentUser && currentUser.id !== mentor._id && (
                    <button 
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                      onClick={() => handleMentorshipRequest(mentor._id)}
                    >
                      Request Mentorship
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mentees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentees.map((mentee) => (
                <div key={mentee._id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      {mentee.profilePhoto ? (
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${mentee.profilePhoto}`} 
                          alt={mentee.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                          {mentee.name ? mentee.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{mentee.name}</h3>
                      <p className="text-green-600 font-medium">{mentee.artisanLevel} Artisan</p>
                    </div>
                  </div>
                  
                  {mentee.location && (
                    <p className="text-gray-600 mb-3">📍 {mentee.location}</p>
                  )}
                  
                  {mentee.bio && (
                    <p className="text-gray-700 mb-4 line-clamp-3">{mentee.bio}</p>
                  )}
                  
                  {mentee.skills && mentee.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mentee.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div key={request._id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {request.mentee.profilePhoto ? (
                          <img 
                            src={`${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${request.mentee.profilePhoto}`} 
                            alt={request.mentee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {request.mentee.name ? request.mentee.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800">{request.mentee.name}</h4>
                        <p className="text-purple-600 font-medium">{request.mentee.artisanLevel} Artisan</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700"><strong>Message:</strong> {request.message}</p>
                      {request.skills && request.skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.skills.map((skill, index) => (
                              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        onClick={() => handleRequestResponse(request._id, 'Accepted')}
                      >
                        Accept
                      </button>
                      <button 
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        onClick={() => handleRequestResponse(request._id, 'Declined')}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Requests Yet</h3>
                  <p className="text-gray-500">You don't have any mentorship requests at the moment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-mentorships' && (
            <div className="space-y-6">
              {myMentorships.length > 0 ? (
                myMentorships.map((mentorship) => (
                  <div key={mentorship._id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={mentorship.mentor.profilePhoto ? `${API_BASE_URL.replace('/api', '')}/uploads/profilePhotos/${mentorship.mentor.profilePhoto}` : '/default-avatar.png'} 
                            alt={mentorship.mentor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{mentorship.mentor.name}</h4>
                          <p className="text-orange-600 font-medium">Mentor</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mentorship.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mentorship.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{mentorship.message}</p>
                    
                    <div className="text-sm text-gray-500">
                      Started: {new Date(mentorship.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Active Mentorships</h3>
                  <p className="text-gray-500">You don't have any active mentorship relationships yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorshipHub; 