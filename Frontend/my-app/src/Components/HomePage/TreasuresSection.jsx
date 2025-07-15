import React, { useEffect, useState } from "react";
import { FaHeart, FaCommentDots, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import { useNavigate } from "react-router-dom";

const TreasuresSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`)
      .then(res => {
        setProducts(res.data.slice(0, 6)); // Show first 6 products
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

    const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Creative Treasures...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold mb-4 shadow">🌃 Creative Treasures</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Handcrafted with Love</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every piece tells a story. Discover unique handmade treasures waiting for their perfect home.
          </p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Treasures Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to add a creative treasure to our community!</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
            >
              Add Your First Treasure
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="relative w-full h-48 mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={BACKEND_BASE_URL + product.images[0]} 
                        alt={product.title} 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">
                        🎨
                      </div>
                    )}
                    {product.category && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                        {product.category}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 text-pink-500 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1">
                      <FaHeart /> {product.likes || Math.floor(Math.random()*100+50)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-orange-600 font-medium mb-1">
                    by <span>{product.owner?.name || 'Unknown Artisan'}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description || 'A beautiful handcrafted treasure'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {(product.tags || ["Handmade", "Unique", "Artisan"]).slice(0, 2).map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-green-600 font-semibold mb-4">
                    {product.value ? `$${product.value}` : 'Trade Available'}
                  </p>
                  <div className="flex gap-2 w-full mt-auto">
                    <button 
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 px-4 font-semibold hover:bg-gray-200 transition flex items-center justify-center text-sm"
                      onClick={() => navigate(`/chat?user=${product.owner?._id}`)}
                    >
                      <FaCommentDots className="mr-1" /> Chat
                    </button>
                    <button 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg py-2 px-4 font-semibold hover:from-orange-600 hover:to-pink-600 transition flex items-center justify-center text-sm"
                      onClick={() => navigate(`/trade/${product._id}`)}
                    >
                      Trade <FaArrowRight className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => navigate('/creative-treasures')}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg shadow hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
              >
                Explore All Treasures
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TreasuresSection;
