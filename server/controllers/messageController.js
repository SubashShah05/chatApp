// // controllers/messageController.js
// import User from "../models/User.js";
// import Message from "../models/Message.js";
// import cloudinary from "../lib/cloudinary.js";
// import { userSocketMap, userStatusMap, io } from "../server.js"; // Added userStatusMap import

// // ===============================
// // 1. Get all users for sidebar
// // ===============================
// export const getUserForSidebar = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const filteredUsers = await User
//       .find({ _id: { $ne: userId } })
//       .select("-password");

//     const unseenMessages = {};
//     const userStatuses = {};

//     // Get unread message counts and user statuses
//     const promises = filteredUsers.map(async (user) => {
//       const messages = await Message.find({
//         senderId: user._id,
//         receiverId: userId,
//         seen: false
//       });

//       if (messages.length > 0) {
//         unseenMessages[user._id.toString()] = messages.length;
//       }

//       // Get user status from socket
//       const isOnline = userSocketMap[user._id.toString()] ? true : false;
//       userStatuses[user._id.toString()] = {
//         online: isOnline,
//         lastSeen: userStatusMap?.[user._id.toString()]?.lastSeen || null
//       };
//     });

//     await Promise.all(promises);

//     res.json({
//       success: true,
//       users: filteredUsers,
//       unseenMessages,
//       userStatuses
//     });

//   } catch (error) {
//     console.error("Error fetching users for sidebar:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch users for sidebar",
//       error: error.message
//     });
//   }
// };

// // ===============================
// // 2. Get all messages between two users
// // ===============================
// export const getMessages = async (req, res) => {
//   try {
//     const { id: selectedUserId } = req.params;
//     const myId = req.user._id;

//     const messages = await Message.find({
//       $or: [
//         { senderId: myId, receiverId: selectedUserId },
//         { senderId: selectedUserId, receiverId: myId }
//       ]
//     }).sort({ createdAt: 1 });

//     // Mark messages as seen (when user opens chat)
//     const unreadMessages = await Message.find({
//       senderId: selectedUserId,
//       receiverId: myId,
//       seen: false
//     });

//     if (unreadMessages.length > 0) {
//       await Message.updateMany(
//         { senderId: selectedUserId, receiverId: myId, seen: false },
//         { $set: { seen: true, seenAt: new Date() } }
//       );

//       // Emit read receipts for each message
//       unreadMessages.forEach(message => {
//         const senderSocketId = userSocketMap[message.senderId];
//         if (senderSocketId) {
//           io.to(senderSocketId).emit("messageReadReceipt", {
//             messageId: message._id,
//             receiverId: myId,
//             readAt: new Date()
//           });
//         }
//       });
//     }

//     res.json({ success: true, messages });

//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch messages",
//       error: error.message
//     });
//   }
// };

// // ===============================
// // 3. Mark single message as seen
// // ===============================
// export const markMessageAsSeen = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const message = await Message.findByIdAndUpdate(
//       id,
//       { $set: { seen: true, seenAt: new Date() } },
//       { new: true }
//     );

//     if (message) {
//       // Notify sender that message was read
//       const senderSocketId = userSocketMap[message.senderId];
//       if (senderSocketId) {
//         io.to(senderSocketId).emit("messageReadReceipt", {
//           messageId: message._id,
//           receiverId: userId,
//           readAt: new Date()
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: "Message marked as seen"
//     });

//   } catch (error) {
//     console.error("Error marking message as seen:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to mark message as seen",
//       error: error.message
//     });
//   }
// };

// // ===============================
// // 4. Send message with read tracking
// // ===============================
// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const receiverId = req.params.id;
//     const senderId = req.user._id;

//     // Validate that either text or image is provided
//     if (!text && !image) {
//       return res.status(400).json({
//         success: false,
//         message: "Message must contain either text or an image"
//       });
//     }

//     let imageUrl = "";

//     // Handle image upload if present
//     if (image) {
//       try {
//         // Validate image format
//         if (typeof image !== "string" || !image.startsWith("data:image")) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid image format",
//           });
//         }

//         // Extract base64 data
//         const base64Data = image.split(",")[1];
//         if (!base64Data) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid base64 image",
//           });
//         }

//         // Check file size (max 5MB)
//         const sizeInBytes = Buffer.byteLength(base64Data, "base64");
//         if (sizeInBytes > 5 * 1024 * 1024) {
//           return res.status(400).json({
//             success: false,
//             message: "Image too large (max 5MB)",
//           });
//         }

//         // Upload to Cloudinary
//         const uploadResponse = await cloudinary.uploader.upload(
//           `data:image/jpeg;base64,${base64Data}`,
//           {
//             folder: "chat-app",
//             resource_type: "auto",
//           }
//         );

//         imageUrl = uploadResponse.secure_url;

//       } catch (err) {
//         console.error("CLOUDINARY ERROR:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Image upload failed",
//           error: err.message,
//         });
//       }
//     }

//     // Create new message
//     const newMessage = await Message.create({
//       senderId,
//       receiverId,
//       text: text || "",
//       image: imageUrl || "",
//       seen: false,
//       delivered: false
//     });

//     // Populate sender and receiver details
//     const populatedMessage = await Message.findById(newMessage._id)
//       .populate("senderId", "fullName profilePic")
//       .populate("receiverId", "fullName profilePic");

//     // Check if receiver is online
//     const receiverSocketId = userSocketMap[receiverId];
//     if (receiverSocketId) {
//       // Mark as delivered immediately if receiver is online
//       await Message.findByIdAndUpdate(newMessage._id, { 
//         $set: { delivered: true, deliveredAt: new Date() } 
//       });
//       populatedMessage.delivered = true;
      
//       // Send message to receiver
//       io.to(receiverSocketId).emit("newMessage", populatedMessage);
      
//       // Notify sender that message was delivered
//       const senderSocketId = userSocketMap[senderId];
//       if (senderSocketId) {
//         io.to(senderSocketId).emit("messageDelivered", {
//           messageId: newMessage._id,
//           deliveredAt: new Date()
//         });
//       }
//     } else {
//       // Message sent but not delivered (receiver offline)
//       const senderSocketId = userSocketMap[senderId];
//       if (senderSocketId) {
//         io.to(senderSocketId).emit("messageSent", populatedMessage);
//       }
//     }

//     // Return the message
//     res.json({
//       success: true,
//       message: populatedMessage,
//     });

//   } catch (error) {
//     console.error("SEND ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send message",
//       error: error.message,
//     });
//   }
// };





// controllers/messageController.js
import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { userSocketMap, userStatusMap, getIO } from "../server.js";

// ===============================
// 1. Get all users for sidebar
// ===============================
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User
      .find({ _id: { $ne: userId } })
      .select("-password");

    const unseenMessages = {};
    const userStatuses = {};

    // Get unread message counts and user statuses
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false
      });

      if (messages.length > 0) {
        unseenMessages[user._id.toString()] = messages.length;
      }

      // Get user status from socket
      const isOnline = userSocketMap[user._id.toString()] ? true : false;
      userStatuses[user._id.toString()] = {
        online: isOnline,
        lastSeen: userStatusMap?.[user._id.toString()]?.lastSeen || null
      };
    });

    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
      userStatuses
    });

  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users for sidebar",
      error: error.message
    });
  }
};

// ===============================
// 2. Get all messages between two users
// ===============================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const io = getIO(); // Get socket instance

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as seen (when user opens chat)
    const unreadMessages = await Message.find({
      senderId: selectedUserId,
      receiverId: myId,
      seen: false
    });

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { senderId: selectedUserId, receiverId: myId, seen: false },
        { $set: { seen: true, seenAt: new Date() } }
      );

      // Emit read receipts for each message
      unreadMessages.forEach(message => {
        const senderSocketId = userSocketMap[message.senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageReadReceipt", {
            messageId: message._id,
            receiverId: myId,
            readAt: new Date()
          });
        }
      });
    }

    res.json({ success: true, messages });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};

// ===============================
// 3. Mark single message as seen
// ===============================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const io = getIO();

    const message = await Message.findByIdAndUpdate(
      id,
      { $set: { seen: true, seenAt: new Date() } },
      { new: true }
    );

    if (message) {
      // Notify sender that message was read
      const senderSocketId = userSocketMap[message.senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageReadReceipt", {
          messageId: message._id,
          receiverId: userId,
          readAt: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: "Message marked as seen"
    });

  } catch (error) {
    console.error("Error marking message as seen:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as seen",
      error: error.message
    });
  }
};

// ===============================
// 4. Send message with read tracking
// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const io = getIO();

    // Validate that either text or image is provided
    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message must contain either text or an image"
      });
    }

    let imageUrl = "";

    // Handle image upload if present
    if (image) {
      try {
        // Validate image format
        if (typeof image !== "string" || !image.startsWith("data:image")) {
          return res.status(400).json({
            success: false,
            message: "Invalid image format",
          });
        }

        // Extract base64 data
        const base64Data = image.split(",")[1];
        if (!base64Data) {
          return res.status(400).json({
            success: false,
            message: "Invalid base64 image",
          });
        }

        // Check file size (max 5MB)
        const sizeInBytes = Buffer.byteLength(base64Data, "base64");
        if (sizeInBytes > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: "Image too large (max 5MB)",
          });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Data}`,
          {
            folder: "chat-app",
            resource_type: "auto",
          }
        );

        imageUrl = uploadResponse.secure_url;

      } catch (err) {
        console.error("CLOUDINARY ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: err.message,
        });
      }
    }

    // Create new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || "",
      seen: false,
      delivered: false
    });

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    // Check if receiver is online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      // Mark as delivered immediately if receiver is online
      await Message.findByIdAndUpdate(newMessage._id, { 
        $set: { delivered: true, deliveredAt: new Date() } 
      });
      populatedMessage.delivered = true;
      
      // Send message to receiver
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
      
      // Notify sender that message was delivered
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id,
          deliveredAt: new Date()
        });
      }
    } else {
      // Message sent but not delivered (receiver offline)
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSent", populatedMessage);
      }
    }

    // Return the message
    res.json({
      success: true,
      message: populatedMessage,
    });

  } catch (error) {
    console.error("SEND ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};