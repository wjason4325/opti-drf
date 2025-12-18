import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// 🔑 Attach token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🚨 Handle expired / invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Optional: force logout
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
