import React from 'react';
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import logo from '../Assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-orange-50 to-amber-100 pt-12 pb-4 px-4 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-12 md:gap-8">
        {/* Brand Info */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-4 mb-4">
            <img src={logo} alt="TradeTogether Logo" className="w-14 h-14 object-contain" />
            <div>
              <h3 className="text-2xl font-bold text-orange-700 mb-1">TradeTogether</h3>
              <p className="text-sm text-gray-500">Maker Community</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            A warm community where creative hearts connect, share,<br />
            and trade handmade treasures. Every craft tells a story,<br />
            every trade builds friendship.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <FaPhone className="text-orange-500" />
              <span>+91 8708639550</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <FaEnvelope className="text-orange-500" />
              <span>nishantsharma9034@gmail.com</span>
            </div>
          </div>
        </div>
        {/* Explore Links */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-lg font-semibold text-orange-700 mb-3">Explore</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="hover:text-orange-500 cursor-pointer">Featured Makers</li>
            <li className="hover:text-orange-500 cursor-pointer">Latest Crafts</li>
            <li className="hover:text-orange-500 cursor-pointer">Trading Tips</li>
            <li className="hover:text-orange-500 cursor-pointer">Success Stories</li>
          </ul>
        </div>
        {/* Community Links */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-lg font-semibold text-orange-700 mb-3">Community</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="hover:text-orange-500 cursor-pointer">Join Circle</li>
            <li className="hover:text-orange-500 cursor-pointer">Guidelines</li>
            <li className="hover:text-orange-500 cursor-pointer">Help Center</li>
            <li className="hover:text-orange-500 cursor-pointer">Contact Us</li>
          </ul>
        </div>
      </div>
      {/* Bottom line */}
      <hr className="my-8 border-orange-200" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2025 TradeTogether. Made with love by our community.</p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-orange-500">Privacy</a>
          <a href="/terms" className="hover:text-orange-500">Terms</a>
          <a href="/safety" className="hover:text-orange-500">Safety</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
