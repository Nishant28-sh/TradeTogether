const ChatMessage = require('../models/ChatMessage');

module.exports = (io) => {
  console.log('🔌 Socket.IO chat module initialized');

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join a room (global, trade, or private 1:1)
    socket.on('join', async ({ username, room, productId, userId1, userId2 }) => {
      try {
        console.log(`🚪 User ${username} joining room: ${room}`);
        
        let roomName = room;
        // If private trade chat, construct a unique room name
        if (room === 'trade' && productId && userId1 && userId2) {
          // Sort user IDs to ensure both users join the same room
          const sortedIds = [userId1, userId2].sort();
          roomName = `trade_${productId}_${sortedIds[0]}_${sortedIds[1]}`;
        }
        
        socket.join(roomName);
        console.log(`✅ User ${username} joined room: ${roomName}`);
        
        // Notify other users in the room
        socket.to(roomName).emit('message', {
          username: 'System',
          senderId: 'system',
          senderName: 'System',
          message: `${username} joined the chat.`,
          time: new Date().toLocaleTimeString(),
        });

        // Send chat history to the user who joined
        try {
          const history = await ChatMessage.find({ room: roomName }).sort({ time: 1 }).limit(50);
          socket.emit('chatHistory', history);
          console.log(`📜 Sent ${history.length} messages to ${username}`);
        } catch (dbError) {
          console.error('❌ Error fetching chat history:', dbError);
          socket.emit('error', { message: 'Failed to load chat history' });
        }
      } catch (error) {
        console.error('❌ Error in join event:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      try {
        console.log(`💬 Message from ${data.senderName}: ${data.message.substring(0, 50)}...`);
        
        let roomName = data.room;
        if (data.room === 'trade' && data.productId && data.userId1 && data.userId2) {
          const sortedIds = [data.userId1, data.userId2].sort();
          roomName = `trade_${data.productId}_${sortedIds[0]}_${sortedIds[1]}`;
        }

        // Validate message data
        if (!data.message || !data.senderId || !data.senderName) {
          console.error('❌ Invalid message data:', data);
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Save message to DB
        try {
          const chatMsg = new ChatMessage({
            room: roomName,
            senderId: data.senderId,
            senderName: data.senderName,
            message: data.message,
            time: new Date(),
          });
          await chatMsg.save();
          console.log(`💾 Message saved to database`);
        } catch (dbError) {
          console.error('❌ Error saving message to database:', dbError);
          // Still emit the message even if DB save fails
        }

        // Emit message to all users in the room
        const messageData = {
          ...data,
          senderId: data.senderId,
          senderName: data.senderName,
          time: new Date().toLocaleTimeString(),
        };
        
        io.to(roomName).emit('message', messageData);
        console.log(`📤 Message sent to room: ${roomName}`);
        
      } catch (error) {
        console.error('❌ Error in sendMessage event:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      try {
        let roomName = data.room;
        if (data.room === 'trade' && data.productId && data.userId1 && data.userId2) {
          const sortedIds = [data.userId1, data.userId2].sort();
          roomName = `trade_${data.productId}_${sortedIds[0]}_${sortedIds[1]}`;
        }
        socket.to(roomName).emit('userTyping', {
          username: data.senderName,
          isTyping: data.isTyping
        });
      } catch (error) {
        console.error('❌ Error in typing event:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`👋 User disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  // Handle server-wide errors
  io.engine.on('connection_error', (err) => {
    console.error('❌ Socket.IO connection error:', err);
  });

  console.log('✅ Socket.IO chat module setup complete');
}; 