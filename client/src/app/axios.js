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
  },
});

// Request interceptor to add token to every request
API.interceptors.request.use(
  (config) => {
    // ✅ Let the browser automatically set the multipart/form-data boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

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
    
    if (error.response?.status === 409) {
      console.log("❌ Version Conflict detected! Triggering global modal.");
      const event = new CustomEvent("versionConflict");
      window.dispatchEvent(event);
    }

    return Promise.reject(error);
  }
);

export default API;