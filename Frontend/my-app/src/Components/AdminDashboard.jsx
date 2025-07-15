import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, [activeTab]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.data.isAdmin && response.data.role !== 'admin') {
        navigate('/');
        return;
      }
    } catch (error) {
      navigate('/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      switch (activeTab) {
        case 'events':
          const eventsResponse = await axios.get('/api/events/', { headers });
          setEvents(eventsResponse.data.events || eventsResponse.data);
          break;
        case 'challenges':
          const challengesResponse = await axios.get('/api/challenges/', { headers });
          setChallenges(challengesResponse.data);
          break;
        case 'announcements':
          const announcementsResponse = await axios.get('/api/announcements/', { headers });
          setAnnouncements(announcementsResponse.data);
          break;
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess(`${type.slice(0, -1)} deleted successfully`);
      loadData();
    } catch (error) {
      setError(`Failed to delete ${type.slice(0, -1)}`);
    }
  };

  const handleToggleFeatured = async (type, id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/${type}/${id}/toggle-featured`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess(`${type.slice(0, -1)} featured status updated`);
      loadData();
    } catch (error) {
      setError(`Failed to update ${type.slice(0, -1)} featured status`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderEventsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Events Management</h3>
        <button
          onClick={() => navigate('/admin/events/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-4">Type: {event.type}</span>
                    <span className="mr-4">Date: {formatDate(event.date)}</span>
                    <span className="mr-4">Status: {event.status}</span>
                    <span>Participants: {event.participants?.length || 0}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleFeatured('events', event._id)}
                    className={`px-3 py-1 rounded text-sm ${
                      event.isFeatured 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {event.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete('events', event._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChallengesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Challenges Management</h3>
        <button
          onClick={() => navigate('/create-challenge')}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          Create Challenge
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading challenges...</div>
      ) : (
        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{challenge.title}</h4>
                  <p className="text-gray-600 text-sm">{challenge.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-4">Category: {challenge.category}</span>
                    <span className="mr-4">Difficulty: {challenge.difficulty}</span>
                    <span className="mr-4">Start: {formatDate(challenge.startDate)}</span>
                    <span className="mr-4">End: {formatDate(challenge.endDate)}</span>
                    <span>Participants: {challenge.participants?.length || 0}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/challenges/edit/${challenge._id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('challenges', challenge._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Announcements Management</h3>
        <button
          onClick={() => navigate('/admin/announcements/create')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Announcement
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading announcements...</div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{announcement.title}</h4>
                  <p className="text-gray-600 text-sm">{announcement.content}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-4">Type: {announcement.type}</span>
                    <span className="mr-4">Priority: {announcement.priority}</span>
                    <span className="mr-4">Created: {formatDate(announcement.createdAt)}</span>
                    <span>Active: {announcement.isActive ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/announcements/edit/${announcement._id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('announcements', announcement._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage events, challenges, and announcements</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'events', name: 'Events', count: events.length },
                { id: 'challenges', name: 'Challenges', count: challenges.length },
                { id: 'announcements', name: 'Announcements', count: announcements.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'challenges' && renderChallengesTab()}
            {activeTab === 'announcements' && renderAnnouncementsTab()}
          </div>
        </div>
      </div>
    </div>
  );
} 