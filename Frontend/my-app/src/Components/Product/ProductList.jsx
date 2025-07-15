import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import ChatPage from "../Chat/ChatPage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from "react-router-dom";
import { FaCamera, FaCode, FaHammer, FaPaintBrush, FaTableTennis } from "react-icons/fa";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", value: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [showTrade, setShowTrade] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [tradeForm, setTradeForm] = useState({ offeredProductId: '', cash: '', address: '' });
  const [tradeStatus, setTradeStatus] = useState({ loading: false, error: '', success: '' });
  const [hybridPayment, setHybridPayment] = useState(false);
  const [skills, setSkills] = useState([]);
  const skillOptions = [
    { label: "Coding", value: "coding", icon: <FaCode /> },
    { label: "Woodworking", value: "woodworking", icon: <FaHammer /> },
    { label: "Badminton", value: "badminton", icon: <FaTableTennis /> },
    { label: "Painting", value: "painting", icon: <FaPaintBrush /> },
  ];
  const toggleSkill = (value) => {
    setSkills((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const filteredProducts = searchQuery
    ? products.filter(p => p.title && p.title.toLowerCase().includes(searchQuery))
    : products;

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`).then(res => setProducts(res.data));
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      axios.get(`${API_BASE_URL}/products`).then(res => {
        setUserProducts(res.data.filter(p => p.owner && p.owner._id === userId));
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("value", form.value);
      if (image) formData.append("image", image);
      await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setProducts([...products]);
      setForm({ title: "", description: "", value: "" });
      setImage(null);
      setPreview(null);
      setMessage("Product added!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Add failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleTrade = (product) => {
    setSelectedProduct(product);
    setSelectedOwner(product.owner);
    setTradeForm({ offeredProductId: '', cash: '', address: '' });
    setTradeStatus({ loading: false, error: '', success: '' });
    setShowTrade(true);
  };
  const closeTrade = () => setShowTrade(false);

  const handleTradeFormChange = (e) => {
    setTradeForm({ ...tradeForm, [e.target.name]: e.target.value });
  };

  const submitTrade = async (e) => {
    e.preventDefault();
    setTradeStatus({ loading: true, error: '', success: '' });
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const proposer = payload.id;
      const receiver = selectedOwner._id;
      const offeredProducts = tradeForm.offeredProductId ? [tradeForm.offeredProductId] : [];
      const requestedProducts = selectedProduct._id ? [selectedProduct._id] : [];
      const cashComponent = tradeForm.cash ? Number(tradeForm.cash) : 0;
      const address = tradeForm.address;
      await axios.post(`${API_BASE_URL}/trades/propose`, {
        proposer,
        receiver,
        offeredProducts,
        requestedProducts,
        cashComponent,
        address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTradeStatus({ loading: false, error: '', success: 'Trade proposed successfully!' });
      toast.success('Trade proposed successfully!');
      setTimeout(() => {
        setShowTrade(false);
      }, 1500);
    } catch (err) {
      setTradeStatus({ loading: false, error: err.response?.data?.message || 'Trade failed', success: '' });
      toast.error(err.response?.data?.message || 'Trade failed');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">Peer-to-Peer Skill-Based Product Exchange Platform</h3>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Add Product</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-400 transition relative bg-purple-50">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <FaCamera className="text-3xl text-purple-300 mb-1" />
                      <span className="text-xs text-purple-400">Upload a image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <div className="flex-1 space-y-2">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 text-gray-800 placeholder-gray-400 text-base bg-gray-50"
                  />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 text-gray-800 placeholder-gray-400 text-base bg-gray-50 mt-2"
                  />
                </div>
              </div>
            </div>
            {/* Value */}
            <div>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="Value"
                type="number"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 text-gray-800 placeholder-gray-400 text-base bg-gray-50"
              />
            </div>
            {/* Hybrid Payment Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hybrid Payment</label>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${!hybridPayment ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white text-gray-400 border-gray-200'}`}>Off</span>
                <button
                  type="button"
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ${hybridPayment ? 'bg-purple-500' : 'bg-gray-200'}`}
                  onClick={() => setHybridPayment((v) => !v)}
                >
                  <span className={`inline-block w-6 h-6 transform bg-white rounded-full shadow transition-transform duration-200 ${hybridPayment ? 'translate-x-6' : ''}`}></span>
                </button>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${hybridPayment ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-400 border-gray-200'}`}>On</span>
              </div>
            </div>
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
              <div className="flex flex-wrap gap-3">
                {skillOptions.map((skill) => (
                  <button
                    type="button"
                    key={skill.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-150 ${skills.includes(skill.value)
                      ? 'bg-purple-100 border-purple-300 text-purple-700 shadow'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-purple-50 hover:border-purple-200'}
                    `}
                    onClick={() => toggleSkill(skill.value)}
                  >
                    {skill.icon} {skill.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Add Product Button */}
            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition-all duration-200 mt-2"
            >
              Add Product
            </button>
          </form>
          {message && (
            <div className="mt-4 text-center text-green-600 font-medium">{message}</div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {showTrade && selectedProduct && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 min-w-[350px] max-w-[95vw] relative shadow-2xl">
            <button 
              onClick={closeTrade} 
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg px-3 py-1 transition-colors duration-200"
            >
              Close
            </button>
            <h2 className="text-2xl font-bold text-orange-600 mb-2">Trade for {selectedProduct.title}</h2>
            <p className="text-gray-600 mb-6">Trade with {selectedOwner.name}</p>
            
            <form onSubmit={submitTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer your product:
                </label>
                <select 
                  name="offeredProductId" 
                  value={tradeForm.offeredProductId} 
                  onChange={handleTradeFormChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select your product</option>
                  {userProducts.map(p => (
                    <option key={p._id} value={p._id}>{p.title} (${p.value})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash offer (optional):
              </label>
                <input 
                  name="cash" 
                  type="number" 
                  min="0" 
                  value={tradeForm.cash} 
                  onChange={handleTradeFormChange} 
                  placeholder="0" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery address:
              </label>
                <input 
                  name="address" 
                  type="text" 
                  value={tradeForm.address} 
                  onChange={handleTradeFormChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={tradeStatus.loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {tradeStatus.loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Propose Trade'
                )}
              </button>
              
              {tradeStatus.error && (
                <div className="text-red-600 text-center">{tradeStatus.error}</div>
              )}
              {tradeStatus.success && (
                <div className="text-green-600 text-center">{tradeStatus.success}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList; 