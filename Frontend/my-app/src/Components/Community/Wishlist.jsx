import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaPlus, FaEye, FaTrash, FaBookmark, FaLightbulb } from 'react-icons/fa';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ wishlistItems: [], inspirationBoards: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('wishlist');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    images: []
  });
  const [newBoard, setNewBoard] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load wishlist");
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/users/wishlist`, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewItem({ title: '', description: '', category: '', priority: 'Medium', images: [] });
      setShowAddForm(false);
      fetchWishlist();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/users/inspiration-board`, newBoard, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewBoard({ name: '', description: '', isPublic: true });
      setShowBoardForm(false);
      fetchWishlist();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create board');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/users/wishlist/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWishlist();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading wishlist...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-4">My Wishlist & Inspiration</h1>
          <p className="text-xl text-pink-600 max-w-2xl mx-auto">
            Keep track of items you want and save inspiration for your next creative project.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center ${
                  activeTab === 'wishlist' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-600 hover:text-pink-500'
                }`}>
                <FaHeart className="mr-2" />
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('inspiration')}
                className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center ${
                  activeTab === 'inspiration' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-600 hover:text-pink-500'
                }`}>
                <FaLightbulb className="mr-2" />
                Inspiration Boards
              </button>
            </div>
          </div>
        </div>

        {/* Add Buttons */}
        <div className="flex justify-center mb-8 space-x-4">
          {activeTab === 'wishlist' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center">
              <FaPlus className="mr-2" />
              Add Wishlist Item
            </button>
          )}
          {activeTab === 'inspiration' && (
            <button
              onClick={() => setShowBoardForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center">
              <FaPlus className="mr-2" />
              Create Inspiration Board
            </button>
          )}
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Wishlist Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200">
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Board Form */}
        {showBoardForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Inspiration Board</h2>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Board Name *</label>
                  <input
                    type="text"
                    value={newBoard.name}
                    onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newBoard.description}
                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newBoard.isPublic}
                    onChange={(e) => setNewBoard({ ...newBoard, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">Make board public</label>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                    Create Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBoardForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                {/* Product Image */}
                {item.images && item.images.length > 0 && (
                  <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.images[0].startsWith('/') ? `http://localhost:4000${item.images[0]}` : item.images[0]}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="text-red-500 hover:text-red-700 transition-colors">
                    <FaTrash />
                  </button>
                </div>
                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {item.category}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inspiration' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.inspirationBoards.map((board) => (
              <div key={board._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{board.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    board.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {board.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {board.description && (
                  <p className="text-gray-600 mb-4">{board.description}</p>
                )}
                <div className="text-sm text-gray-500 mb-4">
                  {board.items?.length || 0} items • Created {new Date(board.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => navigate(`/inspiration-board/${board._id}`)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                  View Board
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'wishlist' && wishlist.wishlistItems.length === 0) ||
          (activeTab === 'inspiration' && wishlist.inspirationBoards.length === 0)) && (
          <div className="text-center py-16">
            <FaHeart className="text-6xl text-pink-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {activeTab === 'wishlist' ? 'Your Wishlist is Empty' : 'No Inspiration Boards Yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'wishlist' 
                ? 'Start adding items you\'d like to trade for!' 
                : 'Create your first inspiration board to save ideas and inspiration!'}
            </p>
            <button
              onClick={() => activeTab === 'wishlist' ? setShowAddForm(true) : setShowBoardForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200">
              {activeTab === 'wishlist' ? 'Add First Item' : 'Create First Board'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 