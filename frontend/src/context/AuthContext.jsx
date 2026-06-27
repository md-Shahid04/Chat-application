import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

const AuthContext = createContext(null);
const SOCKET_BASE_URL = "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication token state from storage upon initial application load
  useEffect(() => {
    const storedUser = localStorage.getItem("chatAppUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Failed to parse cached user authorization context:",
          error,
        );
        localStorage.removeItem("chatAppUser");
      }
    }
    setLoading(false);
  }, []);

  // Isolate Socket lifecycle tracking and bind it directly to active user state changes
  useEffect(() => {
    let currentSocket = null;

    if (user) {
      // Connect to the operational websocket node engine
      currentSocket = io(SOCKET_BASE_URL, {
        transports: ["websocket"],
      });
      setSocket(currentSocket);

      // Register current identification trace within systemic online network tree map
      currentSocket.emit("join_chat", user._id);

      // Continuously handle global visibility mapping sync push events
      currentSocket.on("get_online_users", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        currentSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
    }
  }, [user]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("chatAppUser", JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    localStorage.setItem("chatAppUser", JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("chatAppUser");
    setUser(null);
  };

  const updateProfileContext = (updatedUserData) => {
    const mergedUserData = { ...user, ...updatedUserData };
    localStorage.setItem("chatAppUser", JSON.stringify(mergedUserData));
    setUser(mergedUserData);
  };

  const value = {
    user,
    socket,
    onlineUsers,
    loading,
    login,
    register,
    logout,
    updateProfileContext,
    backendUrl: SOCKET_BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be invoked within an active structural AuthProvider tree framework wrapper",
    );
  }
  return context;
};
