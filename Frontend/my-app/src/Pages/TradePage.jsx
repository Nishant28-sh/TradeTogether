import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft, FaComments, FaExchangeAlt, FaMoneyBillWave, FaCheck, FaTimes, FaHandshake } from 'react-icons/fa';
import { useUser } from '../UserContext';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { toast } from 'react-toastify';

const TradePage = () => {
  const { productId } = useParams();
  const { user } = useUser();
  const [product, setProduct] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    offeredProducts: [],
    cashComponent: 0,
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchUserProducts();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      setProduct(response.data);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to only show user's available products
      const userOwnedProducts = response.data.filter(p => 
        p.owner && p.owner._id === user?.id && p.status === 'available'
      );
      setUserProducts(userOwnedProducts);
    } catch (err) {
      console.error('Error fetching user products:', err);
    }
  };

  const handleTradeFormChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({
      ...prev,
      [name]: name === 'cashComponent' ? parseFloat(value) || 0 : value
    }));
  };

  const toggleProductSelection = (productId) => {
    setTradeForm(prev => ({
      ...prev,
      offeredProducts: prev.offeredProducts.includes(productId)
        ? prev.offeredProducts.filter(id => id !== productId)
        : [...prev.offeredProducts, productId]
    }));
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const tradeData = {
        receiver: product.owner._id,
        offeredProducts: tradeForm.offeredProducts,
        requestedProducts: [productId],
        cashComponent: tradeForm.cashComponent,
        address: tradeForm.address
      };

      await axios.post(`${API_BASE_URL}/trades/propose`, tradeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Trade proposed successfully!');
      setShowTradeForm(false);
      setTradeForm({ offeredProducts: [], cashComponent: 0, address: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose trade');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/logo192.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\\?uploads\\?/, 'uploads/').replace(/^\/+/, '');
    return `http://localhost:4000/${cleanPath}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100">
      <div className="text-xl font-bold text-orange-500">Loading...</div>
    </div>
  );

  if (error || !product) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100">
      <div className="text-xl font-bold text-red-500">{error || 'Product not found'}</div>
    </div>
  );

  const totalOfferedValue = userProducts
    .filter(p => tradeForm.offeredProducts.includes(p._id))
    .reduce((sum, p) => sum + (p.value || 0), 0) + tradeForm.cashComponent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 flex flex-col items-center py-10 px-2 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 relative border-2 border-orange-100">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-6 top-6 text-orange-500 hover:text-pink-500 text-xl"
        >
          <FaArrowLeft />
        </button>

        {/* Product Details */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <img 
            src={getImageUrl(product.images?.[0])} 
            alt={product.title} 
            className="w-full md:w-64 h-64 object-cover rounded-2xl shadow-md border border-orange-100" 
          />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-purple-700 mb-2">{product.title}</h1>
              <div className="flex items-center mb-2">
                <FaUserCircle className="text-2xl text-orange-400 mr-2" />
                <span className="font-semibold text-orange-600">{product.owner?.name || 'Unknown Seller'}</span>
              </div>
              <p className="text-gray-600 mb-4 text-lg">{product.description}</p>
              <div className="text-2xl font-bold text-green-600 mb-4">₹{product.value}</div>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full font-bold shadow hover:from-orange-500 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 text-lg"
                onClick={() => setShowTradeForm(true)}
              >
                <FaExchangeAlt /> Propose Trade
              </button>
              <button 
                className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-full font-bold shadow hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 text-lg" 
                onClick={() => navigate(`/chat?user=${product.owner?._id}`)}
              >
                <FaComments /> Chat with Seller
              </button>
            </div>
          </div>
        </div>

        {/* Trade Form Modal */}
        {showTradeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-700">Propose Trade</h2>
                <button 
                  onClick={() => setShowTradeForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleTradeSubmit} className="space-y-6">
                {/* Trade Summary */}
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-purple-700 mb-4">Trade Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">You're Offering:</h4>
                      <div className="text-2xl font-bold text-green-600">₹{totalOfferedValue}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">You're Requesting:</h4>
                      <div className="text-2xl font-bold text-purple-600">₹{product.value}</div>
                    </div>
                  </div>
                </div>

                {/* Select Your Products */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 mb-4">Select Your Products</h3>
                  {userProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FaExchangeAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                      <p>You don't have any products to trade yet.</p>
                      <button 
                        type="button"
                        onClick={() => navigate('/products')}
                        className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Add a product first
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {userProducts.map(userProduct => (
                        <div 
                          key={userProduct._id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            tradeForm.offeredProducts.includes(userProduct._id)
                              ? 'border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => toggleProductSelection(userProduct._id)}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={tradeForm.offeredProducts.includes(userProduct._id)}
                              onChange={() => {}}
                              className="w-4 h-4 text-orange-600"
                            />
                            <img 
                              src={getImageUrl(userProduct.images?.[0])} 
                              alt={userProduct.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{userProduct.title}</h4>
                              <p className="text-sm text-gray-600">₹{userProduct.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cash Component */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Cash (₹)
                  </label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="cashComponent"
                      value={tradeForm.cashComponent}
                      onChange={handleTradeFormChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={tradeForm.address}
                    onChange={handleTradeFormChange}
                    required
                    rows="3"
                    placeholder="Enter your delivery address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting || (!tradeForm.offeredProducts.length && !tradeForm.cashComponent)}
                    className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Proposing Trade...
                      </>
                    ) : (
                      <>
                        <FaHandshake /> Propose Trade
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTradeForm(false)}
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

export default TradePage; 