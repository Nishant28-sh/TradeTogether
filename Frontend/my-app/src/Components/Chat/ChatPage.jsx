import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FaPaperPlane, FaUserCircle, FaComments, FaExclamationTriangle } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import notificationSound from '../../Components/Assets/notification-18-270129.mp3';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../api';

const getInitial = (nameOrEmail) => {
  if (!nameOrEmail) return '?';
  if (nameOrEmail.includes('@')) return nameOrEmail[0].toUpperCase();
  return nameOrEmail.split(' ')[0][0].toUpperCase();
};

const ChatPage = (props) => {
  const { user } = useUser();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username] = useState(
    user?.name || user?.username || user?.email || 'User' + Math.floor(Math.random() * 1000)
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isPrivate, setIsPrivate] = useState(!!props.isPrivate);
  const [otherUser, setOtherUser] = useState(props.otherUser || null);
  const [userList, setUserList] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const [sendError, setSendError] = useState(null);
  const [unread, setUnread] = useState({ global: 0, private: {} });
  const [activeRoom, setActiveRoom] = useState('global');
  const audioRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [users, setUsers] = useState([]);

  // Play notification sound
  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    setIsPrivate(!!props.isPrivate);
    setOtherUser(props.otherUser || null);
  }, [props.otherUser, props.isPrivate]);

  useEffect(() => {
    // If ?user= is present in the URL, open private chat with that user
    const params = new URLSearchParams(location.search);
    const sellerId = params.get('user');
    if (sellerId && (!props.otherUser || props.otherUser._id !== sellerId)) {
      // Fetch seller info
      fetch(`${API_BASE_URL}/users/all`)
        .then(res => res.json())
        .then(users => {
          const seller = users.find(u => u._id === sellerId);
          if (seller) {
            setIsPrivate(true);
            setOtherUser(seller);
            setActiveRoom(`private_${[user._id || user.id, seller._id].sort().join('_')}`);
          }
        });
    }
  }, [location.search, props.otherUser, user]);

  let room = 'global';
  let userId1 = user._id || user.id || user.email || user.name;
  let userId2 = otherUser?._id || otherUser?.id || otherUser?.email || otherUser?.name;
  if (isPrivate && props.product && user && otherUser) {
    const sortedIds = [userId1, userId2].sort();
    room = `trade_${props.product._id || props.product.id || props.product.title}_${sortedIds[0]}_${sortedIds[1]}`;
  } else if (isPrivate && user && otherUser) {
    const sortedIds = [userId1, userId2].sort();
    room = `private_${sortedIds[0]}_${sortedIds[1]}`;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${API_BASE_URL}/users/all`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true
    });
    setSocket(newSocket);
    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
      newSocket.emit('join', { username, room, productId: props.product?._id, userId1, userId2 });
    });
    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setIsReconnecting(false);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });
    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionError(`Connection failed: ${err.message}`);
      setIsReconnecting(false);
    });
    newSocket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
      newSocket.emit('join', { username, room, productId: props.product?._id, userId1, userId2 });
    });
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      setIsReconnecting(true);
      setConnectionError(`Reconnecting... (attempt ${attemptNumber})`);
    });
    newSocket.on('reconnect_error', (err) => {
      setConnectionError(`Reconnection failed: ${err.message}`);
    });
    newSocket.on('reconnect_failed', () => {
      setConnectionError('Failed to reconnect. Please refresh the page.');
      setIsReconnecting(false);
    });
    newSocket.on('message', (data) => {
      let roomKey = 'global';
      if (data.room && data.room.startsWith('trade_')) {
        roomKey = data.room;
      }
      if (roomKey !== activeRoom) {
        setUnread(prev => {
          if (roomKey === 'global') {
            return { ...prev, global: prev.global + 1 };
          } else {
            return { ...prev, private: { ...prev.private, [roomKey]: (prev.private[roomKey] || 0) + 1 }, global: prev.global };
          }
        });
        playNotification();
        setToast({ sender: data.senderName || data.username, message: data.message });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
      }
      setMessages(prev => [...prev, data]);
    });
    newSocket.on('chatHistory', (history) => {
      setMessages(history.map(msg => ({
        ...msg,
        username: msg.senderName,
        time: new Date(msg.time).toLocaleTimeString(),
      })));
    });
    newSocket.on('error', (error) => {
      setConnectionError(error.message || 'An error occurred');
    });
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [username, room, props.product?._id, userId1, userId2, activeRoom]);

  useEffect(() => {
    if (activeRoom === 'global') {
      setUnread(prev => ({ ...prev, global: 0 }));
    } else {
      setUnread(prev => ({ ...prev, private: { ...prev.private, [activeRoom]: 0 } }));
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    setSendError(null);
    if (!user || !(user._id || user.id) || !user.name) {
      setSendError('User information is missing. Please log in again.');
      return;
    }
    if (messageInput.trim() && socket && isConnected) {
      const messageData = {
        senderId: user._id || user.id,
        senderName: user.name,
        message: messageInput,
        room,
        time: new Date().toLocaleTimeString(),
        userId1,
        userId2,
        productId: props.product?._id,
      };
      socket.emit('sendMessage', messageData);
      setMessageInput('');
    }
  };

  const handleReconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 py-8 px-2 font-sans">
      <audio ref={audioRef} src={notificationSound} style={{ display: 'none' }} />
      {toast && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }} className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center animate-fade-in font-semibold text-base">
          <span className="font-bold mr-2">{toast.sender}:</span>
          <span>{toast.message.length > 40 ? toast.message.slice(0, 40) + '...' : toast.message}</span>
        </div>
      )}
      <div className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden border-2 border-orange-100">
        {/* User List */}
        <div className="w-64 bg-white border-r border-purple-100 flex flex-col">
          <div className="font-bold text-xl p-6 pb-2 border-b border-purple-100 text-orange-600 tracking-wide">Users</div>
          <button
            className={`flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 mt-2 transition-colors duration-150 ${!isPrivate ? 'bg-gradient-to-r from-orange-100 to-pink-100 text-purple-700 font-semibold shadow' : 'hover:bg-orange-50'}`}
            onClick={() => { setIsPrivate(false); setOtherUser(null); setActiveRoom('global'); }}
          >
            <FaUserCircle className="inline mr-2 text-2xl text-orange-400" />Global Chat
            {unread.global > 0 && (
              <span className="ml-2 w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full inline-block"></span>
            )}
          </button>
          <div className="flex-1 overflow-y-auto mt-2">
            {users.map(u => {
              const privateRoom = `trade_${props.product?._id || 'none'}_${[user._id || user.id, u._id].sort().join('_')}`;
              const hasUnread = unread.private[privateRoom] > 0;
              return (
                <button
                  key={u._id}
                  className={`flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors duration-150 ${isPrivate && otherUser?._id === u._id ? 'bg-gradient-to-r from-orange-100 to-pink-100 text-purple-700 font-semibold shadow' : 'hover:bg-orange-50'}`}
                  onClick={() => { setIsPrivate(true); setOtherUser(u); setActiveRoom(privateRoom); }}
                  disabled={!!props.otherUser}
                >
                  <FaUserCircle className="inline mr-2 text-2xl text-orange-400" />{u.name}
                  {hasUnread && (
                    <span className="ml-2 w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full inline-block"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white p-6 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              <FaComments className="text-2xl mr-3 text-white drop-shadow" />
              <h2 className="text-2xl font-extrabold tracking-wide drop-shadow">
                {isPrivate && otherUser
                  ? `Private Chat with ${otherUser.name}`
                  : 'TradeTogether Chat'}
              </h2>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-base font-semibold">
                {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Connection Error Display */}
          {connectionError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 mr-2" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{connectionError}</p>
                  {!isReconnecting && (
                    <button
                      onClick={handleReconnect}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Try to reconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show send error if present */}
          {sendError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-2 mb-2">
              <span className="text-red-700 text-sm">{sendError}</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <h3 className="text-2xl font-bold mb-4 text-orange-500">
                  {isPrivate ? 'Start your private chat!' : 'Welcome to TradeTogether Chat! 🎉'}
                </h3>
                <p className="text-lg">
                  {isPrivate
                    ? `You and ${otherUser?.name || 'the other user'} can chat privately here.`
                    : 'Start connecting with other traders and artisans!'}
                </p>
                {!isConnected && (
                  <p className="text-sm text-red-500 mt-2">
                    Waiting for connection...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  if (msg.senderId === 'system' || msg.senderName === 'System' || msg.username === 'System') {
                    return (
                      <div key={index} className="flex justify-center">
                        <div className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-4 py-2 rounded-xl text-sm shadow mb-2 font-semibold">
                          {msg.message}
                          <div className="text-xs text-center text-orange-400">{msg.time}</div>
                        </div>
                      </div>
                    );
                  }
                  const isOwn = (msg.senderId === (user._id || user.id));
                  const displayName = isOwn ? `${user.name} (You)` : (msg.senderName || msg.username || (otherUser && otherUser.name));
                  return (
                    <div key={index} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-2 animate-fade-in`}>
                      <div className={`flex items-end max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`} style={{ width: 'fit-content' }}>
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow ${isOwn ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}>{getInitial(isOwn ? user.name : displayName)}</div>
                        </div>
                        <div className={`${isOwn ? 'text-right mr-2' : 'text-left ml-2'}`}> {/* Add margin for spacing */}
                          <div className={`inline-block px-5 py-3 rounded-2xl shadow-lg ${isOwn ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'bg-white text-purple-700 border border-purple-100'}`}> {/* Add shadow */}
                            <p className="text-base break-words whitespace-pre-line font-medium">{msg.message}</p>
                          </div>
                          <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}> <span className="font-semibold">{displayName}</span> <span className="ml-2">{msg.time}</span> </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="sticky bottom-0 z-10 bg-white p-4 border-t border-orange-100 flex gap-3 items-center">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              className="flex-1 px-4 py-3 border border-purple-200 rounded-full focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base shadow-sm bg-gradient-to-r from-orange-50 to-pink-50"
              disabled={!isConnected}
              autoFocus
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full font-bold hover:from-orange-500 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md text-lg"
            >
              <FaPaperPlane className="text-xl" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 