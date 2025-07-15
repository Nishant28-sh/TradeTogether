require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO configuration with proper CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:4000"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware setup
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:4000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log the MongoDB URI and port for debugging
console.log('Using MongoDB URI:', process.env.MONGO_URI);
console.log('Using PORT:', process.env.PORT);

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Socket.io setup with error handling
try {
  const chatSocket = require('./socket/chat');
  chatSocket(io);
  console.log('✅ Socket.IO chat module loaded successfully');
} catch (error) {
  console.error('❌ Error loading Socket.IO chat module:', error);
}

// Basic route
app.get('/', (req, res) => {
  res.send('Skill-Based Product Exchange Backend Running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Load routes after middleware setup
try {
  const userRoutes = require('./routes/userRoutes');
  const productRoutes = require('./routes/productRoutes');
  const tradeRoutes = require('./routes/tradeRoutes');
  const feedRoutes = require('./routes/feedRoutes');
  const paymentRoutes = require('./routes/paymentRoutes');
  const communityRoutes = require('./routes/communityRoutes');
  const challengeRoutes = require('./routes/challengeRoutes');
  const announcementRoutes = require('./routes/announcementRoutes');
  const reportRoutes = require('./routes/reportRoutes');
  const eventRoutes = require('./routes/eventRoutes');

  // API routes
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/trades', tradeRoutes);
  app.use('/api/feed', feedRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/communities', communityRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/events', eventRoutes);
  
  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// Serve static files from the React app build folder (only in production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../Frontend/my-app/build');
  app.use(express.static(buildPath));
  // Serve all other routes with the React app (THIS SHOULD BE LAST)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});