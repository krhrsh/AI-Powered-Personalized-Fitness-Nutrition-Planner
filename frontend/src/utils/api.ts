import axios, { type AxiosRequestHeaders } from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!cfg.headers) cfg.headers = {} as AxiosRequestHeaders;
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default API;
