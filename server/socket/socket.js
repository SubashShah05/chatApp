






// socket/socket.js
// socket/socket.js
import { Server } from "socket.io";

let io;
export const userSocketMap = {};
export const userStatusMap = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your frontend URL
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected with ID:", userId);

    if (userId && userId !== "undefined") {
      // Store socket mapping
      userSocketMap[userId] = socket.id;
      
      // Store user status
      userStatusMap[userId] = {
        status: 'online',
        lastSeen: new Date()
      };
      
      console.log(`✅ User ${userId} is online`);
      console.log("Current online users:", Object.keys(userSocketMap));
      
      // Broadcast online status to all connected clients
      io.emit("userOnline", {
        userId,
        status: 'online',
        lastSeen: new Date()
      });
      
      // Send current online users list to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      
      // Send all user statuses to all clients
      io.emit("allUserStatus", userStatusMap);
    }

    // Handle typing indicator
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId,
          isTyping
        });
      }
    });

    // Handle message read receipt
    socket.on("messageRead", ({ messageId, senderId, receiverId }) => {
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageReadReceipt", {
          messageId,
          receiverId,
          readAt: new Date()
        });
      }
    });

    // Handle message delivered receipt
    socket.on("messageDelivered", ({ messageId, senderId, receiverId }) => {
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeliveredReceipt", {
          messageId,
          receiverId,
          deliveredAt: new Date()
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected with ID:", userId);

      if (userId && userId !== "undefined") {
        // Update user status to offline
        userStatusMap[userId] = {
          status: 'offline',
          lastSeen: new Date()
        };
        
        // Remove from socket mapping
        delete userSocketMap[userId];
        
        console.log(`❌ User ${userId} is offline`);
        console.log("Remaining online users:", Object.keys(userSocketMap));
        
        // Broadcast offline status to all connected clients
        io.emit("userOffline", {
          userId,
          status: 'offline',
          lastSeen: new Date()
        });
        
        // Update online users list
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        
        // Update all user statuses
        io.emit("allUserStatus", userStatusMap);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};