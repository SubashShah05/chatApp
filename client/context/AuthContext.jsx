// context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({}); // ✅ Track detailed user status
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply token globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check auth
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
      }

    } catch (error) {
      console.log("AUTH ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        setAuthUser(data.user);
        connectSocket(data.user);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setUserStatuses({});

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Socket connection with all event listeners
  const connectSocket = (userData) => {
    if (!userData || (socket && socket.connected)) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id }
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      const normalizedIds = userIds.map(id => String(id));
      setOnlineUsers(normalizedIds);
      
      // ✅ Sync userStatuses with the initial online list
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        normalizedIds.forEach(id => {
          newStatuses[id] = { ...newStatuses[id], online: true, lastSeen: null };
        });
        return newStatuses;
      });
    });

    // ✅ Listen for individual user online status
    newSocket.on("userOnline", ({ userId, status, lastSeen }) => {
      const id = String(userId);
      setUserStatuses(prev => ({
        ...prev,
        [id]: { online: true, lastSeen }
      }));
      setOnlineUsers(prev => prev.includes(id) ? prev : [...prev, id]);
    });

    // ✅ Listen for user offline status
    newSocket.on("userOffline", ({ userId, status, lastSeen }) => {
      const id = String(userId);
      setUserStatuses(prev => ({
        ...prev,
        [id]: { online: false, lastSeen }
      }));
      setOnlineUsers(prev => prev.filter(oid => oid !== id));
    });

    // ✅ Listen for all user statuses
    newSocket.on("allUserStatus", (statuses) => {
      const normalized = {};
      Object.keys(statuses).forEach(key => {
        normalized[String(key)] = statuses[key];
      });
      setUserStatuses(normalized);
      const online = Object.keys(normalized).filter(id => normalized[id]?.online === true);
      setOnlineUsers(online);
    });

    // ✅ Listen for typing indicators
    newSocket.on("userTyping", ({ userId, isTyping }) => {
      // This will be used in ChatContainer
      window.dispatchEvent(new CustomEvent('userTyping', { detail: { userId, isTyping } }));
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
  };

  // Handle Auth Check
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [token]);

  // ✅ Separate Socket Cleanup Effect
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    userStatuses, // ✅ Add user statuses to context
    login,
    logout,
    updateProfile,
    socket,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};