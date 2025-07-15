import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { useUser } from '../UserContext';

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [approving, setApproving] = useState({}); // { userId: true/false }
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCommunity() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/communities`);
        const found = res.data.find(c => c._id === id);
        setCommunity(found);
        setLoading(false);
      } catch (err) {
        setError('Failed to load community');
        setLoading(false);
      }
    }
    fetchCommunity();
  }, [id]);

  // Fetch pending requests if admin
  useEffect(() => {
    async function fetchRequests() {
      if (!community || !user) return;
      const isAdmin = community.admins && community.admins.includes(user._id);
      if (!isAdmin) return;
      setLoadingRequests(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/community/${id}/requests`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPendingRequests(res.data);
      } catch (err) {
        // ignore error
      } finally {
        setLoadingRequests(false);
      }
    }
    fetchRequests();
  }, [community, user, id]);

  const handleApprove = async (userId) => {
    setApproving(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.post(`${API_BASE_URL}/community/${id}/approve-request`, { userId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingRequests(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setApproving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this community?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/communities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/communities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete community');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  if (error || !community) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">{error || 'Community not found'}</div>;

  const imageUrl = community.image
    ? community.image.startsWith('http')
      ? community.image
      : `http://localhost:4000/${community.image.replace(/^\\?uploads\\?/, 'uploads/')}`
    : '/default-image.png';

  const isAdmin = user && community && community.admins && community.admins.includes(user._id);
  console.log('Logged in user:', user);
  console.log('Community admins:', community.admins);
  console.log('Is admin:', isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border-2 border-green-100">
        <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
          <img src={imageUrl} alt={community.name} className="w-48 h-48 object-cover rounded-2xl shadow-md border border-green-100" />
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-green-700 mb-2">{community.name}</h1>
            <p className="text-gray-600 mb-4 text-lg">{community.description}</p>
            <div className="text-base text-green-700 mb-2">Category: {community.category}</div>
            <div className="text-base text-green-700 mb-2">Members: {community.members?.length || 0}</div>
            <div className="text-base text-green-700 mb-2">Admins: {community.admins?.length || 0}</div>
            {community.rules && community.rules.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-green-800 mb-1">Community Rules:</div>
                <ul className="list-disc list-inside text-gray-700">
                  {community.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Pending Requests Section for Admins */}
        {isAdmin && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-green-700 mb-2">Pending Join Requests</h2>
            {loadingRequests ? (
              <div className="text-gray-500">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <ul className="space-y-2">
                {pendingRequests.map(u => (
                  <li key={u._id} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2">
                    <span>{u.name} ({u.email})</span>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                      onClick={() => handleApprove(u._id)}
                      disabled={approving[u._id]}
                    >
                      {approving[u._id] ? 'Approving...' : 'Approve'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {deleting ? 'Deleting...' : 'Delete Community'}
        </button>
        {error && <div className="text-red-600 text-center font-semibold mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default CommunityDetail; 