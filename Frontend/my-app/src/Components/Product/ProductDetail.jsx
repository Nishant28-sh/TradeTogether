import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import { FaComments, FaArrowRight } from "react-icons/fa";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("No product found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-12 text-lg">Loading...</div>;
  if (error || !product) return <div className="text-center py-12 text-red-600 text-lg font-semibold">No product found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-10 p-0" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
      {/* Product Image */}
      <div className="relative h-56 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img src={BACKEND_BASE_URL + product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">No Image</div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">{product.category}</span>
        )}
        <span className="absolute top-3 right-3 bg-white/90 text-pink-500 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1">
          <span className="mr-1">❤</span> {product.likes || Math.floor(Math.random()*100+50)}
        </span>
      </div>
      {/* Product Content */}
      <div className="p-6 flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{product.title}</h2>
        <div className="text-md mb-1">
          by <span className="text-[#e67c2f] font-semibold">{product.owner?.name || 'Unknown'}</span>
        </div>
        <div className="text-gray-600 text-base mb-2">{product.description || 'Original paintings of local wildflowers'}</div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {(product.tags || ["Original", "Nature", "Wall Art"]).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
          ))}
        </div>
        {/* Trade Value */}
        <div className="text-green-600 text-lg font-semibold mb-4">
          {product.value ? `Trade for $${product.value}` : 'Trade for textiles'}
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg text-lg shadow hover:bg-gray-200 transition"
            onClick={() => navigate(`/chat?user=${product.owner?._id}`)}
          >
            <FaComments className="text-xl" /> Chat
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-3 rounded-lg text-lg shadow hover:from-orange-500 hover:to-pink-500 transition"
            onClick={() => navigate(`/trade/${product._id}`)}
          >
            Trade <FaArrowRight className="text-xl" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
} 