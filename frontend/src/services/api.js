// src/services/api.js

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Handle FormData correctly
api.interceptors.request.use((config) => {

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);


// ───── Bill Upload ─────
export async function uploadBill(formData) {
  const res = await api.post("/bill/upload", formData);
  return res.data;
}


// ───── Activities ─────
export async function logActivity(data) {
  const res = await api.post("/activity/log", data);
  return res.data;
}

export async function getActivities() {
  const res = await api.get("/activity/list");
  return res.data;
}


// ───── Dashboard ─────
export async function getDashboardData() {
  const res = await api.get("/dashboard/summary");
  return res.data;
}


// ───── Habits ─────
export async function logHabit(data) {
  const res = await api.post("/habit/log", data);
  return res.data;
}


// ───── Product Scanner ─────
export async function scanBarcode(barcode) {
  const res = await api.get(`/product/scan/${barcode}`);
  return res.data;
}

export default api;