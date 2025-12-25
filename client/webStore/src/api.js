import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (config.headers) delete config.headers.Authorization;
    }
  } catch (e) {

  }
  return config;
}, (err) => Promise.reject(err));

export default api;
