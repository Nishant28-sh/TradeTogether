import React from "react";
import { FaStar, FaArrowRight, FaUser } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "../../api";
import ChatPage from "../Chat/ChatPage";
import { useNavigate } from "react-router-dom";



const FeaturedArtisansContent = () => {
  const navigate = useNavigate();
  const [artisans, setArtisans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showPayment, setShowPayment] = React.useState(false);
  const [selectedArtisan, setSelectedArtisan] = React.useState(null);
  const [showChat, setShowChat] = React.useState(false);
  const [user, setUser] = React.useState(null);

  // Fetch users who have posted products
  React.useEffect(() => {
    const fetchUsersWithProducts = async () => {
      try {
        console.log('Fetching products...');
        // First get all products to find unique owners
        const productsResponse = await axios.get(`${API_BASE_URL}/products`);
        const products = productsResponse.data;
        console.log('All products:', products);
        
        // Get unique user IDs who have posted products (handle populated owner)
        const userIds = [...new Set(products.map(product => product.owner?._id || product.owner))].filter(Boolean);
        console.log('Unique user IDs with products:', userIds);
        
        // Also log the first product to see the structure
        if (products.length > 0) {
          console.log('First product structure:', products[0]);
        }
        
        if (userIds.length > 0) {
          // Fetch user details for those who have posted products
          const usersWithProducts = [];
          
          for (const userId of userIds.slice(0, 4)) { // Take only first 4 users
            try {
              console.log(`Processing user ID: ${userId}`);
              // Get user details from products data
              const userProducts = products.filter(product => 
                (product.owner?._id || product.owner) === userId
              );
              console.log(`Products by user ${userId}:`, userProducts);
              
              if (userProducts.length > 0) {
                // Get user details from the first product's owner data (populated)
                const firstProduct = userProducts[0];
                const ownerData = firstProduct.owner;
                console.log('Owner data from product:', ownerData);
                
                const userData = {
                  _id: userId,
                  name: ownerData?.name || 'Unknown User',
                  location: ownerData?.location || 'Location not specified',
                  bio: ownerData?.bio || 'Passionate creator sharing unique handmade treasures.',
                  skills: ownerData?.skills || ['Product Creator'],
                  profilePhoto: ownerData?.profilePhoto || null
                };
                
                console.log('Processed user data:', userData);
                
                usersWithProducts.push({
                  ...userData,
                  productCount: userProducts.length,
                  latestProduct: userProducts[0] // Most recent product
                });
              }
            } catch (error) {
              console.error(`Error processing user ${userId}:`, error);
            }
          }
          
          console.log('Final users with products:', usersWithProducts);
          setArtisans(usersWithProducts);
        } else {
          console.log('No users found with products');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users with products:', error);
        setLoading(false);
      }
    };

    fetchUsersWithProducts();
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: payload.name || payload.email || 'User', ...payload });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const navigateToLogin = () => {
    window.location.assign('/login');
  };

  const handleChat = (artisan) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: payload.name || payload.email || 'User', ...payload });
      } catch {
        setUser(null);
      }
      setSelectedArtisan(artisan);
      setShowChat(true);
    } else {
      localStorage.setItem('intendedChatUser', artisan.name);
      navigateToLogin();
    }
  };

  const handleTrade = (artisan) => {
    setSelectedArtisan(artisan);
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setSelectedArtisan(null);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedArtisan(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center overflow-hidden animate-pulse"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
            <div className="w-20 h-3 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-3 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2 w-full mt-auto">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Product Creators Yet</h3>
        <p className="text-gray-600 mb-6">Be the first to add products to our community!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {artisans.map((artisan, idx) => (
          <div
            className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden"
            key={artisan._id || idx}
          >
            <span className="absolute top-4 right-4 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
              {artisan.productCount} Products
            </span>
            
            {/* Profile Image */}
            {artisan.profilePhoto ? (
              <img 
                src={`${BACKEND_BASE_URL}/uploads/profilePhotos/${artisan.profilePhoto}`} 
                alt={artisan.name} 
                className="w-24 h-24 object-cover rounded-full border-4 border-orange-200 mb-4 shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-24 h-24 rounded-full border-4 border-orange-200 mb-4 shadow flex items-center justify-center bg-orange-100 ${artisan.profilePhoto ? 'hidden' : 'flex'}`}
            >
              <FaUser className="text-3xl text-orange-500" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-1">{artisan.name}</h3>
            <p className="text-orange-600 font-medium mb-1">
              {artisan.skills && artisan.skills.length > 0 ? artisan.skills[0] : 'Product Creator'}
            </p>
            <p className="text-gray-500 text-sm mb-2">{artisan.location || 'Location not specified'}</p>
            
            <p className="flex items-center justify-center gap-2 text-yellow-600 font-semibold mb-2">
              <FaStar className="inline-block" /> 
              {artisan.ratings ? artisan.ratings.toFixed(1) : '4.5'} 
              <span className="text-gray-400 font-normal">
                {artisan.productCount} items
              </span>
            </p>
            
            <p className="text-gray-600 text-sm mb-4">
              {artisan.bio || 'Passionate creator sharing unique handmade treasures.'}
            </p>
            
            <div className="flex gap-2 w-full mt-auto">
              <button className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg py-2 px-4 font-semibold hover:bg-orange-100 transition" type="button">
                ♡ Follow
              </button>
              <button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg py-2 px-4 font-semibold hover:from-orange-600 hover:to-pink-600 transition" 
                onClick={() => handleChat(artisan)}
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>
      {showPayment && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl min-w-[320px]">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">Trade with {selectedArtisan.name}</h2>
            <p className="mb-6">Proceed to payment to complete your trade.</p>
            <div className="flex gap-4">
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-semibold transition" onClick={closePayment}>
                Pay Now
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-indigo-700 py-2 px-6 rounded-lg font-semibold transition" onClick={closePayment}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showChat && selectedArtisan && user && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl min-w-[350px] min-h-[400px] max-w-[95vw] relative">
            <button onClick={closeChat} aria-label="Close chat" className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg px-3 py-1 transition-colors duration-200">Close</button>
            <ChatPage user={user} otherUser={selectedArtisan} isPrivate={true} />
          </div>
        </div>
      )}
    </>
  );
};

const FeaturedArtisans = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-orange-50 to-amber-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold mb-4 shadow">Featured Product Creators</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Meet Our Creative Hearts</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing creators who have shared their handmade treasures with our community
          </p>
        </div>
        <FeaturedArtisansContent />
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => navigate('/creative-treasures')}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg shadow hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
          >
            Discover All Products <FaArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtisans;
