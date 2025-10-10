// src/api.js

const API_BASE = "http://localhost:5000/api"; // replace with your backend URL

// Fetch doctors
export const fetchDoctors = async () => {
  try {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error("Failed to fetch doctors");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Fetch services
export const fetchServices = async () => {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error("Failed to fetch services");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Signup
export const signup = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return { success: false, message: "Signup failed" };
  }
};

// Login
export const login = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return { success: false, message: "Login failed" };
  }
};

// Forgot Password
export const forgotPassword = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return { success: false, message: "Request failed" };
  }
};
