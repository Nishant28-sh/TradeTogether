import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBullhorn, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api/feed/community-showcase';

const badgeClass =
  'inline-block px-3 py-1 text-xs font-semibold rounded-full text-white bg-purple-600 mb-2';
const barterBadgeClass =
  'inline-block px-2 py-1 text-xs font-semibold rounded-full text-white bg-green-500 mr-2';

// Helper to handle relative and absolute URLs
const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/100';
  if (url.startsWith('http')) return url; // Use as-is for Google URLs!
  if (url.startsWith('/uploads')) return `http://localhost:4000${url}`;
  // Assume it's a filename, so prepend /uploads/profilePhotos/
  return `http://localhost:4000/uploads/profilePhotos/${url}`;
};

const CommunityShowcase = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchShowcase() {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load community showcase.');
        setLoading(false);
      }
    }
    fetchShowcase();
  }, []);

  if (loading)
    return <div className="text-center py-10">Loading Community Showcase...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 bg-[#faf6f2] min-h-screen">
      {/* Featured Trades */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Trades</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {data.featuredUsers && data.featuredUsers.length > 0 ? (
          data.featuredUsers.slice(0, 2).map((user, idx) => (
            <div
              key={user._id || idx}
              className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center p-6 gap-6 relative overflow-hidden"
            >
              <span className={badgeClass} style={{ position: 'absolute', top: 16, left: 16 }}>
                Trade
              </span>
              <img
                src={getImageUrl(user.profilePhoto || user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg')}
                alt={user.name}
                className="w-32 h-32 rounded-xl object-cover border-4 border-gray-100 shadow"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="text-xl font-bold text-gray-900">{user.name}</div>
                <div className="text-gray-600 mb-2">{user.skills && user.skills[0]}</div>
                {/* Product badge placeholder */}
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <img
                    src={getImageUrl(data.trendingItems && data.trendingItems[idx]?.images?.[0])}
                    alt="Product"
                    className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center">No featured trades found.</div>
        )}
      </div>

      {/* Recently Completed Barters & Trending Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Recently Completed Barters */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Recently Completed Barters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.latestTrades && data.latestTrades.length > 0 ? (
              data.latestTrades.slice(0, 2).map((trade, idx) => {
                const imgUrl = getImageUrl(trade.proposer?.profilePhoto || trade.proposer?.profileImage || 'https://randomuser.me/api/portraits/women/1.jpg');
                console.log('Barter proposer image URL:', imgUrl, trade.proposer);
                return (
                  <div
                    key={trade._id || idx}
                    className="bg-white rounded-2xl shadow flex flex-col items-center p-5 relative overflow-hidden"
                  >
                    <span className={barterBadgeClass} style={{ position: 'absolute', top: 16, left: 16 }}>
                      <FaCheckCircle className="inline mr-1" /> Barter
                    </span>
                    <img
                      src={imgUrl}
                      alt={trade.proposer?.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-red-500 mb-2"
                    />
                    <div className="text-lg font-bold text-gray-900">{trade.proposer?.name}</div>
                    <div className="text-gray-600 mb-1">Barter</div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center">No recent barters found.</div>
            )}
          </div>
        </div>
        {/* Trending Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Trending Products</h2>
          <div className="flex gap-4">
            {data.trendingItems && data.trendingItems.length > 0 ? (
              data.trendingItems.slice(0, 3).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white rounded-xl shadow p-3 flex flex-col items-center w-28"
                >
                  <img
                    src={getImageUrl(item.images?.[0])}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded mb-2"
                  />
                  <div className="text-xs font-semibold text-gray-800 text-center">
                    {item.title?.length > 14 ? item.title.slice(0, 14) + '…' : item.title}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center">No trending products found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Design Contest/Announcement */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <FaBullhorn className="text-3xl text-yellow-500 mr-2" />
          <div>
            <div className="font-bold text-lg">Design Contest:</div>
            <div className="text-gray-700">Enter the Summer Challenge!</div>
            <div className="text-xs text-gray-500 mt-1">July 3, 2024</div>
          </div>
        </div>
        {/* Featured Artisan Announcement */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="font-bold text-lg mb-1">Announcements</div>
          {data.announcements && data.announcements.length > 0 ? (
            data.announcements.slice(0, 1).map((a, idx) => (
              <div key={a._id || idx}>
                <div className="text-gray-700 mb-1">Meet Our Featured Artisan</div>
                <div className="font-bold text-gray-900">{a.createdBy?.name || 'Priva G.'}</div>
                <div className="text-gray-600 text-sm">{a.type || 'Textile artist'}</div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">No announcements found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityShowcase; 