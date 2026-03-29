const CANDIDATE_API_BASES = [
  process.env.REACT_APP_API_BASE,
  "http://localhost:5001/api",
  "http://localhost:5000/api",
  "/api",
].filter(Boolean);

const API_BASES = [...new Set(CANDIDATE_API_BASES.map((base) => String(base).replace(/\/$/, "")))];

const handleUnauthorized = () => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const target = user?.role === "ADMIN" ? "/admin-login" : "/login";

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Redirect only in browser runtime to avoid test environment issues.
  if (typeof window !== "undefined" && window.location.pathname !== target) {
    window.location.assign(target);
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponseBody = async (response) => {
  const text = await response.text().catch(() => "");
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  let lastNetworkError = null;

  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await parseResponseBody(res);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
        }

        return {
          success: false,
          message: json?.message || `Request failed with status ${res.status}`,
          data: null,
        };
      }

      return json;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  return {
    success: false,
    message:
      lastNetworkError?.message ||
      "Unable to connect to backend API. Check backend server and API base URL.",
    data: null,
  };
};

export const fetchDoctors = async () => request("/doctors");
export const fetchDoctorById = async (id) => request(`/doctors/${id}`);
export const fetchDoctorProfile = async () => request("/doctors/me");
export const updateDoctorProfile = async (data) =>
  request("/doctors/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const fetchDoctorDashboardSummary = async () => request("/doctors/dashboard-summary");
export const fetchDoctorPatients = async () => request("/doctors/my-patients");
export const fetchPublicStats = async () => request("/stats");
export const fetchPatientSummary = async () => request("/stats/patient-summary");
export const fetchPatientProfile = async () => request("/patients/me");
export const updatePatientProfile = async (data) =>
  request("/patients/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const fetchNurseProfile = async () => request("/nurses/me");
export const updateNurseProfile = async (data) =>
  request("/nurses/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const fetchNurseDashboardSummary = async () => request("/nurses/dashboard-summary");
export const fetchNursePatients = async () => request("/nurses/my-patients");
export const fetchNurseSchedule = async () => request("/nurses/schedule");
export const fetchNurseOperationsContext = async () => request("/nurses/operations-context");
export const fetchStaffProfile = async () => request("/medicalstaff/me");
export const updateStaffProfile = async (data) =>
  request("/medicalstaff/update", {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const fetchStaffStats = async () => request("/medicalstaff/stats");
export const fetchMyAppointments = async () => request("/appointments/my");
export const fetchDoctorAppointments = async () => request("/appointments/doctor");
export const updateAppointmentById = async (id, data) =>
  request(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
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

export const submitTelemedicineRequest = async (data) =>
  request("/telemedicine/request", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const fetchTelemedicineReviewQueue = async () => request("/telemedicine/review-queue");

export const reviewTelemedicineRequest = async (id, data) =>
  request(`/telemedicine/review/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const fetchDoctorAssignableStaff = async () => request("/telemedicine/assignable-staff");

export const fetchTelemedicineSessions = async () => request("/telemedicine/session");

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

export const fetchAdminAnalytics = async () => request("/stats/admin-analytics");

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

export const fetchHospitals = async () => request("/hospitals");

export const fetchHospitalCatalog = async () => request("/hospitals/catalog");

export const createHospital = async (data) =>
  request("/hospitals", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createDepartment = async (data) =>
  request("/hospitals/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createWard = async (data) =>
  request("/hospitals/wards", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createDiagnosticTest = async (data) =>
  request("/hospitals/tests", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateHospital = async (id, data) =>
  request(`/hospitals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteHospital = async (id) =>
  request(`/hospitals/${id}`, {
    method: "DELETE",
  });

// Forgot Password
export const forgotPassword = async (data) => {
  return await request("/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
