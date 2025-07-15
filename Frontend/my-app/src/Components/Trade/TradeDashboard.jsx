import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaCheck, FaTimes, FaHandshake, FaClock, FaUser, FaMoneyBillWave, FaBox } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { useUser } from '../../UserContext';
import { toast } from 'react-toastify';

const TradeDashboard = () => {
  const { user } = useUser();
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterForm, setCounterForm] = useState({
    offeredProducts: [],
    cashComponent: 0,
    address: ''
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrades(response.data.trades);
      setStats(response.data.stats);
    } catch (err) {
      toast.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeAction = async (tradeId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/trades/${tradeId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Trade ${action}ed successfully!`);
      fetchTrades();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} trade`);
    }
  };

  const handleCounterTrade = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const counterData = {
        offeredProducts: counterForm.offeredProducts,
        requestedProducts: selectedTrade.offeredProducts,
        cashComponent: counterForm.cashComponent,
        address: counterForm.address
      };

      await axios.post(`${API_BASE_URL}/trades/${selectedTrade._id}/counter`, counterData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Counter trade proposed successfully!');
      setShowCounterForm(false);
      setSelectedTrade(null);
      setCounterForm({ offeredProducts: [], cashComponent: 0, address: '' });
      fetchTrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose counter trade');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/logo192.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\\?uploads\\?/, 'uploads/').replace(/^\/+/, '');
    return `http://localhost:4000/${cleanPath}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'countered': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'accepted': return <FaCheck />;
      case 'declined': return <FaTimes />;
      case 'countered': return <FaExchangeAlt />;
      default: return <FaClock />;
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return trade.status === 'pending';
    if (activeTab === 'accepted') return trade.status === 'accepted';
    if (activeTab === 'declined') return trade.status === 'declined';
    if (activeTab === 'countered') return trade.status === 'countered';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100">
        <div className="text-xl font-bold text-orange-500">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Trade Dashboard</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Trades</div>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-green-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.accepted || 0}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="bg-red-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.declined || 0}</div>
              <div className="text-sm text-gray-600">Declined</div>
            </div>
            <div className="bg-blue-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.countered || 0}</div>
              <div className="text-sm text-gray-600">Countered</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'declined', 'countered'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trades List */}
        <div className="space-y-4">
          {filteredTrades.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <FaExchangeAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No trades found</h3>
              <p className="text-gray-500">You don't have any trades in this category yet.</p>
            </div>
          ) : (
            filteredTrades.map(trade => (
              <div key={trade._id} className="bg-white rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(trade.status)}`}>
                      {getStatusIcon(trade.status)}
                      {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {trade.status === 'pending' && trade.receiver._id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTradeAction(trade._id, 'accept')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleTradeAction(trade._id, 'decline')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <FaTimes /> Decline
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrade(trade);
                          setShowCounterForm(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FaExchangeAlt /> Counter
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Offered Products */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaUser className="text-orange-500" />
                      {trade.proposer._id === user?.id ? 'You Offered:' : `${trade.proposer.name} Offered:`}
                    </h4>
                    {trade.offeredProducts.length === 0 ? (
                      <div className="text-gray-500 text-sm">No products offered</div>
                    ) : (
                      <div className="space-y-2">
                        {trade.offeredProducts.map(product => (
                          <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-800">{product.title}</div>
                              <div className="text-sm text-gray-600">₹{product.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {trade.cashComponent > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-green-600 font-medium">
                        <FaMoneyBillWave />
                        + ₹{trade.cashComponent} cash
                      </div>
                    )}
                  </div>

                  {/* Requested Products */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaBox className="text-purple-500" />
                      {trade.receiver._id === user?.id ? 'You Requested:' : `${trade.receiver.name} Requested:`}
                    </h4>
                    <div className="space-y-2">
                      {trade.requestedProducts.map(product => (
                        <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-800">{product.title}</div>
                            <div className="text-sm text-gray-600">₹{product.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Counter Trade Modal */}
        {showCounterForm && selectedTrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Propose Counter Trade</h2>
              
              <form onSubmit={handleCounterTrade} className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Original Offer:</h3>
                  <p className="text-sm text-gray-600">
                    {selectedTrade.proposer.name} offered {selectedTrade.offeredProducts.length} product(s) 
                    {selectedTrade.cashComponent > 0 && ` + ₹${selectedTrade.cashComponent}`} 
                    for your {selectedTrade.requestedProducts.length} product(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Cash (₹)
                  </label>
                  <input
                    type="number"
                    name="cashComponent"
                    value={counterForm.cashComponent}
                    onChange={(e) => setCounterForm(prev => ({ ...prev, cashComponent: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={counterForm.address}
                    onChange={(e) => setCounterForm(prev => ({ ...prev, address: e.target.value }))}
                    required
                    rows="3"
                    placeholder="Enter your delivery address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaExchangeAlt /> Propose Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCounterForm(false);
                      setSelectedTrade(null);
                      setCounterForm({ offeredProducts: [], cashComponent: 0, address: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDashboard; 