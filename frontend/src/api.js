const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await res.text().catch(() => "");
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      throw new Error(json?.message || `Request failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    return { success: false, message: error.message, data: null };
  }
};

export const fetchDoctors = async () => request("/doctors");
export const fetchPublicStats = async () => request("/stats");
export const fetchPatientSummary = async () => request("/stats/patient-summary");
export const fetchMyAppointments = async () => request("/appointments/my");
export const fetchDoctorAppointments = async () => request("/appointments/doctor");
export const fetchAllAppointments = async () => request("/appointments");
export const bookAppointment = async (data) =>
  request("/appointments/book", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const fetchReports = async () => request("/reports");
export const updateReport = async (id, data) =>
  request(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const createReport = async (data) =>
  request("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const startTelemedicineSession = async (data) =>
  request("/telemedicine/session", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Signup
export const signup = async (data) => {
  return await request("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Login
export const login = async (data) => {
  return await request("/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const adminLogin = async (data) => {
  return await request("/users/admin-login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const fetchPendingApprovals = async () => request("/users/approvals/pending");

export const setApprovalStatus = async (id, status) =>
  request(`/users/approvals/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const fetchAdminUsers = async () => request("/users/admin/users");

export const fetchAdminSummary = async () => request("/users/admin/summary");

export const createAdminUser = async (data) =>
  request("/users/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAdminUser = async (id, data) =>
  request(`/users/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAdminUser = async (id) =>
  request(`/users/admin/users/${id}`, {
    method: "DELETE",
  });

export const fetchSiteContent = async () => request("/users/site-content");

export const updateSiteContent = async (data) =>
  request("/users/site-content", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Forgot Password
export const forgotPassword = async (data) => {
  return await request("/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
