import axios from "axios";

// Vite MUST use 'import.meta.env', NOT 'process.env'
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject the authorization token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("chatAppUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ONLY ONE EXPORT ALLOWED (At the very bottom)
export default api;
