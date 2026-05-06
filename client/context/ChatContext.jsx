// context/ChatContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // Get users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Send message with delivery tracking
  const sendMessage = async (messageData) => {
    try {
      if (!selectedUser) return;

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Mark message as read (when user sees it)
  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/mark/${messageId}`);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // ✅ Listen for new messages
    const newMessageHandler = (newMessage) => {
      if (selectedUser && newMessage.senderId._id === selectedUser._id) {
        // Auto-mark as seen when received in active chat
        setMessages((prev) => [...prev, newMessage]);
        markMessageAsRead(newMessage._id);
        
        // Emit read receipt
        socket.emit("messageRead", {
          messageId: newMessage._id,
          senderId: newMessage.senderId._id,
          receiverId: authUser._id
        });
      } else {
        // Increment unseen count for other users
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId._id]: (prev[newMessage.senderId._id] || 0) + 1
        }));
      }
    };

    // ✅ Listen for message delivery receipts
    const messageDeliveredHandler = ({ messageId, deliveredAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true, deliveredAt } : msg
        )
      );
    };

    // ✅ Listen for message read receipts
    const messageReadReceiptHandler = ({ messageId, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true, seenAt: readAt } : msg
        )
      );
    };

    socket.on("newMessage", newMessageHandler);
    socket.on("messageDelivered", messageDeliveredHandler);
    socket.on("messageReadReceipt", messageReadReceiptHandler);

    return () => {
      socket.off("newMessage", newMessageHandler);
      socket.off("messageDelivered", messageDeliveredHandler);
      socket.off("messageReadReceipt", messageReadReceiptHandler);
    };
  }, [socket, selectedUser, authUser]);

  // ✅ Update user statuses from AuthContext
  useEffect(() => {
    // This will be merged with backend user statuses
    const interval = setInterval(() => {
      // Refresh user list periodically to get updated statuses
      if (users.length > 0) {
        getUsers();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [users.length]);

  const value = {
    messages,
    users,
    getUsers,
    selectedUser,
    unseenMessages,
    getMessages,
    setMessages,
    setSelectedUser,
    setUnseenMessages,
    sendMessage,
    markMessageAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};