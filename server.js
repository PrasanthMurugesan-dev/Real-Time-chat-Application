const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create public directory structure if it doesn't exist
const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');
const stylesDir = path.join(publicDir, 'styles');
const soundsDir = path.join(publicDir, 'sounds');

// Create directories if they don't exist
[publicDir, jsDir, stylesDir, soundsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Waiting users queue management
let waitingUsers = [];

// Active chat rooms tracking
const activeRooms = new Map();

// Socket.io connection handling
io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle user joining the chat queue
  socket.on('joinQueue', (username) => {
    // Store username
    socket.username = username;
    console.log(`${username} joined the queue`);
    
    // Remove user from any existing rooms
    leaveCurrentRoom(socket);
    
    // Check if there are other users waiting
    if (waitingUsers.length > 0) {
      // Get the first waiting user
      const partnerSocket = waitingUsers.shift();
      
      // Make sure the partner is still connected
      if (partnerSocket && partnerSocket.connected) {
        // Create a unique room for these two users
        const roomId = `room_${socket.id}_${partnerSocket.id}`;
        
        // Join both users to the room
        socket.join(roomId);
        partnerSocket.join(roomId);
        
        // Store room info for both users
        socket.roomId = roomId;
        partnerSocket.roomId = roomId;
        
        // Store room details
        activeRooms.set(roomId, {
          users: [socket.id, partnerSocket.id],
          usernames: [socket.username, partnerSocket.username],
          createdAt: new Date()
        });
        
        // Notify both users that a partner has been found
        io.to(roomId).emit('partnerFound', socket.username);
        
        console.log(`Matched: ${socket.username} with ${partnerSocket.username}`);
      } else {
        // If partner disconnected, add current user to waiting queue
        waitingUsers.push(socket);
      }
    } else {
      // No waiting users, add to queue
      waitingUsers.push(socket);
    }
  });
  
  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    if (socket.roomId) {
      // Sanitize input to prevent HTML injection
      const sanitizedMsg = sanitizeMessage(msg);
      
      // Broadcast message to the room
      io.to(socket.roomId).emit('chatMessage', {
        user: socket.username,
        message: sanitizedMsg
      });
      
      console.log(`Message in ${socket.roomId}: ${socket.username}: ${msg.substring(0, 30)}${msg.length > 30 ? '...' : ''}`);
    }
  });
  
  // Handle typing indicator
  socket.on('typing', () => {
    if (socket.roomId) {
      // Broadcast typing indicator to the partner only
      socket.to(socket.roomId).emit('typing', socket.username);
    }
  });
  
  // Handle image sharing
  socket.on('image', (data) => {
    if (socket.roomId) {
      // Basic validation of image data
      if (typeof data === 'string' && data.startsWith('data:image/')) {
        io.to(socket.roomId).emit('image', {
          user: socket.username,
          data
        });
        console.log(`Image shared in ${socket.roomId} by ${socket.username}`);
      }
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (${socket.username || 'Unknown'})`);
    
    // Remove from waiting queue if they were waiting
    removeFromWaitingQueue(socket);
    
    // Notify partner if they were in a chat room
    notifyPartnerOfDisconnection(socket);
    
    // Clean up room data
    if (socket.roomId) {
      cleanupRoom(socket.roomId);
    }
  });
});

// Helper function to sanitize message content
function sanitizeMessage(message) {
  if (typeof message !== 'string') {
    return '';
  }
  // Basic sanitization to prevent HTML injection
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Helper function to remove a user from the waiting queue
function removeFromWaitingQueue(socket) {
  const index = waitingUsers.findIndex(user => user.id === socket.id);
  if (index !== -1) {
    waitingUsers.splice(index, 1);
    console.log(`Removed ${socket.username || socket.id} from waiting queue`);
  }
}

// Helper function to notify partner when user disconnects
function notifyPartnerOfDisconnection(socket) {
  if (socket.roomId) {
    // Get room data
    const roomData = activeRooms.get(socket.roomId);
    
    if (roomData) {
      // Notify the other user in the room
      socket.to(socket.roomId).emit('partnerLeft');
      console.log(`Notified partner in ${socket.roomId} that ${socket.username} left`);
    }
  }
}

// Helper function to clean up room data when a chat ends
function cleanupRoom(roomId) {
  if (activeRooms.has(roomId)) {
    // Get room data before deleting
    const roomData = activeRooms.get(roomId);
    console.log(`Cleaning up room ${roomId}`);
    
    // Delete room data
    activeRooms.delete(roomId);
  }
}

// Helper function to make a user leave their current room
function leaveCurrentRoom(socket) {
  if (socket.roomId) {
    // Leave the Socket.io room
    socket.leave(socket.roomId);
    
    // Notify partner
    socket.to(socket.roomId).emit('partnerLeft');
    
    // Clean up room data
    cleanupRoom(socket.roomId);
    
    // Remove room reference from socket
    socket.roomId = null;
  }
}

// Start the server
http.listen(PORT, () => {
  console.log(`🚀 MemeChat running on http://localhost:${PORT}`);
});