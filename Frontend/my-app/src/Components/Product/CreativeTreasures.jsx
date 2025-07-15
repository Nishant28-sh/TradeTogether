import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import { FaHeart, FaRegHeart, FaCommentDots, FaArrowRight, FaFilter, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

const CreativeTreasures = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'newest'
  });
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/products`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
    // Fetch wishlist from backend
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Extract product IDs from wishlistItems
      const wishlistProductIds = (res.data.wishlistItems || []).map(item => item._id || item.productId || item.title);
      setWishlist(wishlistProductIds);
    } catch (err) {
      // Not logged in or error
      setWishlist([]);
    }
  };

  // Filter and search products
  useEffect(() => {
    let filtered = [...products]; // Create a copy to avoid mutating original array

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.title && product.title.toLowerCase().includes(searchQuery)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = Number(product.value) || 0;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (Number(a.value) || 0) - (Number(b.value) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        break;
    }

    console.log('Filtering results:', {
      totalProducts: products.length,
      filteredCount: filtered.length,
      searchQuery,
      filters,
      sampleFiltered: filtered.slice(0, 3)
    });
    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleFilterChange = (filterType, value) => {
    console.log(`Filter changed: ${filterType} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      sortBy: 'newest'
    });
  };

  const getUniqueCategories = () => {
    const categories = products.map(p => p.category).filter(Boolean);
    const uniqueCategories = [...new Set(categories)];
    console.log('Available categories:', uniqueCategories);
    return uniqueCategories;
  };

  const toggleWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to use wishlist!');
      return;
    }
    try {
      if (wishlist.includes(productId)) {
        // Optionally, implement remove from wishlist API here
        setWishlist(wishlist.filter(id => id !== productId));
        toast.info('Removed from wishlist');
      } else {
        // Find the product details to send required fields
        const product = products.find(p => p._id === productId);
        if (!product) throw new Error('Product not found');
        await axios.post(
          `${API_BASE_URL}/users/wishlist/${productId}`,
          {
            title: product.title,
            description: product.description,
            category: product.category,
            images: product.images,
            tags: product.tags,
            priority: 'Medium'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist([...wishlist, productId]);
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Creative Treasures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {searchQuery ? (
            <>
              <p className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold mb-4 shadow">🔍 Search Results</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
                Results for "{searchQuery}"
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching your search. Use the filters to refine your results.
              </p>
              <button
                onClick={() => navigate('/creative-treasures')}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <FaTimes /> Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold mb-4 shadow">🌃 Creative Treasures</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
                Handcrafted with Love
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every piece tells a story. Discover unique handmade treasures waiting for their perfect home.
              </p>
            </>
          )}
        </div>

        {/* Main Content with Sidebar Layout */}
        {(products.length > 0 || searchQuery) ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-orange-200/50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaFilter /> {searchQuery ? 'Search & Filters' : 'Filters'}
                </span>
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} products
                </span>
              </button>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-orange-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaFilter /> Filters
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-orange-600 transition flex items-center gap-1"
                    >
                      <FaTimes /> Clear All
                    </button>
                  </div>

                  {/* Search Results Info */}
                  {searchQuery && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Search results for: <span className="font-semibold text-orange-600">"{searchQuery}"</span>
                      </p>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </p>
                  </div>

                  {/* Filter Options */}
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        {getUniqueCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">All Prices</option>
                        <option value="0-50">Under $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-200">$100 - $200</option>
                        <option value="200-500">$200 - $500</option>
                        <option value="500-">$500+</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>

                    {/* Active Filters Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Active Filters</label>
                      <div className="flex flex-wrap gap-2">
                        {filters.category && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            {filters.category}
                          </span>
                        )}
                        {filters.priceRange && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            {filters.priceRange === '500-' ? '$500+' : `$${filters.priceRange}`}
                          </span>
                        )}
                        {!filters.category && !filters.priceRange && (
                          <span className="text-gray-400 text-xs">No filters applied</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-orange-200/50 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaFilter /> {searchQuery ? 'Search & Filters' : 'Filters'}
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-orange-600 transition flex items-center gap-1"
                  >
                    <FaTimes /> Clear All
                  </button>
                </div>

                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Search results for: <span className="font-semibold text-orange-600">"{searchQuery}"</span>
                    </p>
                  </div>
                )}

                {/* Results Count */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {/* Filter Options */}
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Prices</option>
                      <option value="0-50">Under $50</option>
                      <option value="50-100">$50 - $100</option>
                      <option value="100-200">$100 - $200</option>
                      <option value="200-500">$200 - $500</option>
                      <option value="500-">$500+</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Active Filters Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Active Filters</label>
                    <div className="flex flex-wrap gap-2">
                      {filters.category && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          {filters.category}
                        </span>
                      )}
                      {filters.priceRange && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          {filters.priceRange === '500-' ? '$500+' : `$${filters.priceRange}`}
                        </span>
                      )}
                      {!filters.category && !filters.priceRange && (
                        <span className="text-gray-400 text-xs">No filters applied</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Treasures Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product._id} 
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 relative"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={BACKEND_BASE_URL + product.images[0]} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            🎨
                          </div>
                        )}
                        {product.category && (
                          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                            {product.category}
                          </span>
                        )}
                        {/* Wishlist Icon */}
                        <button
                          className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-pink-100 transition"
                          onClick={e => { e.stopPropagation(); toggleWishlist(product._id); }}
                          aria-label="Add to wishlist"
                        >
                          {wishlist.includes(product._id) ? (
                            <FaHeart className="text-pink-500 text-xl" />
                          ) : (
                            <FaRegHeart className="text-gray-400 text-xl" />
                          )}
                        </button>
                        <span className="absolute top-3 right-12 bg-white/90 text-pink-500 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1">
                          <FaHeart /> {product.likes || Math.floor(Math.random()*100+50)}
                        </span>
                      </div>

                      {/* Product Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{product.title}</h3>
                        <p className="text-orange-600 font-medium mb-1">
                          by <span>{product.owner?.name || 'Unknown Artisan'}</span>
                        </p>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description || 'A beautiful handcrafted treasure'}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(product.tags || ["Handmade", "Unique", "Artisan"]).slice(0, 3).map((tag, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Trade Value */}
                        <p className="text-green-600 font-semibold mb-4">
                          {product.value ? `$${product.value}` : 'Trade Available'}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button 
                            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 px-3 font-semibold hover:bg-gray-200 transition flex items-center justify-center text-sm"
                            onClick={() => navigate(`/chat?user=${product.owner?._id}`)}
                          >
                            <FaCommentDots className="mr-1" /> Chat
                          </button>
                          <button 
                            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg py-2 px-3 font-semibold hover:from-orange-600 hover:to-pink-600 transition flex items-center justify-center text-sm"
                            onClick={() => navigate(`/trade/${product._id}`)}
                          >
                            Trade <FaArrowRight className="ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No products at all - show CTA */
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
        )}

        {/* Add Product CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-8 rounded-lg shadow hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 mx-auto"
          >
            ✨ Add Your Creative Treasure
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreativeTreasures; 