import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/100';
  if (url.startsWith('http')) return url; // Use as-is for Google URLs!
  if (url.startsWith('/uploads')) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/uploads/profilePhotos/${url}`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;

        // Fetch user data
        const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        // Fetch user's products
        const productsResponse = await axios.get(`${API_BASE_URL}/products`);
        const userProducts = productsResponse.data.filter(p => p.owner && p.owner._id === userId);
        setProducts(userProducts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', selectedImage);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/users/${user._id}/upload-profile-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.profilePhoto) {
        setUser({ ...user, profilePhoto: response.data.profilePhoto });
        setSelectedImage(null);
        setPreviewUrl(null);
        toast.success('Profile photo uploaded successfully!');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !user) return;
    
    const updatedSkills = user.skills ? [...user.skills, newSkill.trim()] : [newSkill.trim()];
    setUser({ ...user, skills: updatedSkills });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!user) return;
    
    const updatedSkills = user.skills.filter(skill => skill !== skillToRemove);
    setUser({ ...user, skills: updatedSkills });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-lg text-red-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200" />
                ) : user.profilePhoto ? (
                  <img 
                    src={getImageUrl(user.profilePhoto)} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                  Change Photo
                </label>
                {selectedImage && (
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                    onClick={handleUpload} 
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Save Photo'}
                  </button>
                )}
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              {user.location && (
                <p className="text-gray-600 mb-6">📍 {user.location}</p>
              )}
              
              {/* Skills Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map(skill => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        {skill}
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-lg font-bold"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">No skills listed yet</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
                  />
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    onClick={handleAddSkill}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map(product => (
                <div key={product._id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={`${BACKEND_BASE_URL}${product.images[0]}`} 
                      alt={product.title} 
                      className="w-full h-48 object-cover" 
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                      No Image
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{product.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags && product.tags.map(tag => (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {product.value ? `$${product.value}` : 'Trade Only'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
                <p className="text-gray-500">You haven't listed any products yet.</p>
                <p className="text-gray-500">Start sharing your creations with the community!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 