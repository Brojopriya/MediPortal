// src/api.js

const API_BASE = "http://localhost:5001/api"; // backend runs on :5001 locally

// ✅ Helper function for fetch requests
const request = async (endpoint, options = {}) => {
  try {
    console.log("[API] Request ->", endpoint, options);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let errorData = {};
      try { errorData = JSON.parse(text || '{}'); } catch { errorData = { raw: text }; }
      console.log(`[API] Response error -> ${res.status}`, errorData || text);
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    const json = await res.json().catch(() => null);
    console.log("[API] Response OK ->", endpoint, json);
    return json;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

// Fetch doctors
export const fetchDoctors = async () => {
  return await request("/doctors");
};

// Fetch services
export const fetchServices = async () => {
  return await request("/services");
};

// Signup
export const signup = async (data) => {
  return await request("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// Login
export const login = async (data) => {
  return await request("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// Forgot Password
export const forgotPassword = async (data) => {
  return await request("/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
