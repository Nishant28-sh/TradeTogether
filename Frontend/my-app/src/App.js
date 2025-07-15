import React from "react";
import AuthBox from "./Components/Auth/AuthBox";
import NavBar from "./Components/NavBar/NavBar";
import Shop from "./Pages/Shop";
import ProductList from "./Components/Product/ProductList";
import Profile from "./Components/User/Profile";
import ArtisanProfile from "./Components/User/ArtisanProfile";
import WelcomeLanding from "./Components/HomePage/WelcomeLanding";
import ChatPage from "./Components/Chat/ChatPage";
import CommunityWelcome from "./Components/Community/CommunityWelcome";
import Wishlist from "./Components/Community/Wishlist";
import ProductDetail from "./Components/Product/ProductDetail";
import CreativeTreasures from "./Components/Product/CreativeTreasures";
import TradePage from "./Pages/TradePage";
import TradeDashboard from "./Components/Trade/TradeDashboard";
import CreateCommunity from './Pages/CreateCommunity';
import CommunityDetail from './Pages/CommunityDetail';
import Challenges from './Pages/Challenges';
import CreateChallenge from './Pages/CreateChallenge';
import AdminDashboard from './Components/AdminDashboard';
import CreateEvent from './Pages/CreateEvent';
import CommunityShowcase from "./Components/Community/CommunityShowcase";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useUser } from "./UserContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user, setUser } = useUser();
  const [showWelcome, setShowWelcome] = React.useState(true);

  if (showWelcome) {
    return <WelcomeLanding onStart={() => setShowWelcome(false)} />;
  }

  if (!user) {
    return <AuthBox onLogin={setUser} />;
  }

  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/creative-treasures" element={<CreativeTreasures />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/artisan/:userId" element={<ArtisanProfile />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/community-welcome" element={<CommunityWelcome />} />
          <Route path="/communities" element={<CommunityShowcase />} />
          <Route path="/communities/:id" element={<CommunityDetail />} />
          <Route path="/trade/:productId" element={<TradePage />} />
          <Route path="/trades" element={<TradeDashboard />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/create-challenge" element={<CreateChallenge />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events/create" element={<CreateEvent />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </div>
  );
}

export default App;

