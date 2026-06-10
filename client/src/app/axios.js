// src/app/axios.js
import axios from "axios";

// Automatically switch API URL based on environment
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://dreamfit-couture.onrender.com/api";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// Request interceptor to add token to every request
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Token added to request:",
        token.substring(0, 15) + "..."
      );
    } else {
      console.log("⚠️ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("❌ Unauthorized! Token might be expired");

      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/")) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API;