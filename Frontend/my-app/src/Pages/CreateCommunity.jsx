import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    rules: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const allowedCategories = ['Crafts', 'Art', 'Jewelry', 'Textiles', 'Pottery', 'General'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('FormData name:', form.name); // Debug log
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      // Ensure category is valid
      const category = allowedCategories.includes(form.category) ? form.category : 'General';
      formData.append('category', category);
      // Send rules as JSON array
      const rulesArray = form.rules.split('\n').map(r => r.trim()).filter(Boolean);
      formData.append('rules', JSON.stringify(rulesArray));
      if (form.image) formData.append('image', form.image);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/communities`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      navigate(`/communities/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 flex flex-col items-center py-10 px-2 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-100">
        <h1 className="text-3xl font-extrabold text-purple-700 mb-6 text-center">Create a New Community</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-orange-700 mb-2">Community Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-white shadow"
              placeholder="Enter community name"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-orange-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-white shadow"
              placeholder="Describe your community"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-orange-700 mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-white shadow"
              placeholder="e.g. Pottery, Painting, Jewelry"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-orange-700 mb-2">Community Rules</label>
            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 bg-white shadow"
              placeholder="List any rules for your community"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-orange-700 mb-2">Community Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg bg-white"
            />
            {preview && (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mt-3 mx-auto shadow" />
            )}
          </div>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity; 