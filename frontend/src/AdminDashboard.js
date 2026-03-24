import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDepartment,
  createDiagnosticTest,
  createAdminUser,
  createWard,
  fetchAdminAnalytics,
  deleteAdminUser,
  fetchHospitalCatalog,
  fetchAdminSummary,
  fetchAdminUsers,
  fetchHospitals,
  fetchPendingApprovals,
  fetchSiteContent,
  setApprovalStatus,
  updateHospital,
  updateAdminUser,
  updateSiteContent,
} from "./api";
import "./AdminDashboard.css";

const EMPTY_NEW_USER = {
  name: "",
  email: "",
  password: "",
  role: "PATIENT",
  phone: "",
  approvalStatus: "APPROVED",
};

const EMPTY_DEPARTMENT_DRAFT = {
  name: "",
};

const EMPTY_WARD_DRAFT = {
  departmentId: "",
  capacity: "",
};

const EMPTY_TEST_DRAFT = {
  name: "",
  price: "",
};

const EMPTY_ANALYTICS = {
  appointments: { total: 0, scheduled: 0, accepted: 0, completed: 0, rejected: 0 },
  reporting: { reportsTotal: 0, telemedicineSessions: 0 },
  facilities: { hospitalsTotal: 0, departmentsTotal: 0, wardsTotal: 0, emergencyUnitsTotal: 0 },
  users: { total: 0, approvedProfessionals: 0, pendingProfessionals: 0 },
  charts: {
    appointmentStatusPie: [],
    facilityBar: [],
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("approvals");
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    byRole: { doctors: 0, nurses: 0, staff: 0, patients: 0, admins: 0 },
  });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [siteContent, setSiteContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    emergencyContact: "",
    aboutHospital: "",
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
    footerAbout: "",
  });
  const [savingContent, setSavingContent] = useState(false);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalTests, setHospitalTests] = useState([]);
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [departmentDraft, setDepartmentDraft] = useState(EMPTY_DEPARTMENT_DRAFT);
  const [wardDraft, setWardDraft] = useState(EMPTY_WARD_DRAFT);
  const [testDraft, setTestDraft] = useState(EMPTY_TEST_DRAFT);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const setErrorNotice = (text) => setNotice({ type: "error", text });
  const setSuccessNotice = (text) => setNotice({ type: "success", text });
  const clearNotice = () => setNotice({ type: "", text: "" });

  const loadPending = async () => {
    const result = await fetchPendingApprovals();
    setPendingUsers(Array.isArray(result?.data) ? result.data : []);
  };

  const loadUsers = async () => {
    const result = await fetchAdminUsers();
    setUsers(Array.isArray(result?.data) ? result.data : []);
  };

  const loadSummary = async () => {
    const result = await fetchAdminSummary();
    setSummary(result?.data || {
      totalUsers: 0,
      pendingApprovals: 0,
      approvedUsers: 0,
      rejectedUsers: 0,
      byRole: { doctors: 0, nurses: 0, staff: 0, patients: 0, admins: 0 },
    });
  };

  const loadSiteContent = async () => {
    const result = await fetchSiteContent();
    const content = result?.data || {};
    setSiteContent((prev) => ({ ...prev, ...content }));
  };

  const loadAnalytics = async () => {
    const result = await fetchAdminAnalytics();
    setAnalytics(result?.data || EMPTY_ANALYTICS);
  };

  const loadHospitals = async () => {
    const result = await fetchHospitals();
    setHospitals(Array.isArray(result?.data) ? result.data : []);
  };

  const loadHospitalCatalog = async () => {
    const result = await fetchHospitalCatalog();
    setHospitalTests(Array.isArray(result?.data?.tests) ? result.data.tests : []);
  };

  const loadAll = async () => {
    clearNotice();
    setLoading(true);
    const results = await Promise.allSettled([
      loadPending(),
      loadUsers(),
      loadSummary(),
      loadSiteContent(),
      loadAnalytics(),
      loadHospitals(),
      loadHospitalCatalog(),
    ]);

    const hasRejected = results.some((result) => result.status === "rejected");
    if (hasRejected) {
      setErrorNotice("Some admin data could not be loaded. Please refresh and try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchQuery = !query || `${user.name || ""} ${user.email || ""}`.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || user.approvalStatus === statusFilter;
      return matchQuery && matchRole && matchStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const appointmentStatusData = useMemo(() => {
    const backendChart = analytics.charts?.appointmentStatusPie;
    if (Array.isArray(backendChart) && backendChart.length > 0) {
      return backendChart;
    }

    return [
      { label: "Scheduled", value: analytics.appointments?.scheduled || 0, color: "#0ea5e9" },
      { label: "Accepted", value: analytics.appointments?.accepted || 0, color: "#22c55e" },
      { label: "Completed", value: analytics.appointments?.completed || 0, color: "#0f766e" },
      { label: "Rejected", value: analytics.appointments?.rejected || 0, color: "#ef4444" },
    ];
  }, [
    analytics.charts?.appointmentStatusPie,
    analytics.appointments?.scheduled,
    analytics.appointments?.accepted,
    analytics.appointments?.completed,
    analytics.appointments?.rejected,
  ]);

  const appointmentTotal = useMemo(
    () => appointmentStatusData.reduce((sum, item) => sum + item.value, 0),
    [appointmentStatusData]
  );

  const appointmentPieBackground = useMemo(() => {
    if (!appointmentTotal) {
      return "#e2e8f0";
    }

    let cursor = 0;
    const segments = appointmentStatusData.map((item) => {
      const next = cursor + (item.value / appointmentTotal) * 100;
      const segment = `${item.color} ${cursor}% ${next}%`;
      cursor = next;
      return segment;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [appointmentStatusData, appointmentTotal]);

  const facilityBarData = useMemo(() => {
    const backendBars = analytics.charts?.facilityBar;
    if (Array.isArray(backendBars) && backendBars.length > 0) {
      return backendBars;
    }

    return [
      { label: "Hospitals", value: analytics.facilities?.hospitalsTotal || 0 },
      { label: "Departments", value: analytics.facilities?.departmentsTotal || 0 },
      { label: "Wards", value: analytics.facilities?.wardsTotal || 0 },
      { label: "Emergency Units", value: analytics.facilities?.emergencyUnitsTotal || 0 },
    ];
  }, [
    analytics.charts?.facilityBar,
    analytics.facilities?.hospitalsTotal,
    analytics.facilities?.departmentsTotal,
    analytics.facilities?.wardsTotal,
    analytics.facilities?.emergencyUnitsTotal,
  ]);

  const facilityBarMax = useMemo(
    () => Math.max(1, ...facilityBarData.map((item) => item.value)),
    [facilityBarData]
  );

  const filteredHospitals = useMemo(() => {
    const q = hospitalQuery.trim().toLowerCase();
    if (!q) {
      return hospitals;
    }

    return hospitals.filter((hospital) => {
      const name = hospital.name || "";
      const location = hospital.location || "";
      return `${name} ${location}`.toLowerCase().includes(q);
    });
  }, [hospitals, hospitalQuery]);

  const hospitalOverview = useMemo(() => {
    return hospitals.reduce(
      (acc, hospital) => {
        acc.total += 1;
        acc.departments += Number(hospital.departmentCount) || 0;
        acc.wards += Number(hospital.wardCount) || 0;
        return acc;
      },
      { total: 0, departments: 0, wards: 0 }
    );
  }, [hospitals]);

  const primaryHospital = useMemo(() => hospitals[0] || null, [hospitals]);

  const departmentChoicesForWard = useMemo(() => {
    const hospital = primaryHospital;
    return Array.isArray(hospital?.departments) ? hospital.departments : [];
  }, [primaryHospital]);

  const resetUserFilters = () => {
    setQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const refreshData = async () => {
    const results = await Promise.allSettled([loadPending(), loadUsers(), loadSummary()]);
    if (results.some((result) => result.status === "rejected")) {
      setErrorNotice("Failed to refresh user data from server.");
      return;
    }
    setSuccessNotice("User data refreshed.");
  };

  const refreshAnalyticsAndHospitals = async () => {
    const results = await Promise.allSettled([
      loadAnalytics(),
      loadHospitals(),
      loadHospitalCatalog(),
      loadSummary(),
    ]);
    if (results.some((result) => result.status === "rejected")) {
      setErrorNotice("Failed to refresh analytics/facility data.");
      return;
    }
    setSuccessNotice("Analytics and facility data refreshed.");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleApproval = async (id, status) => {
    clearNotice();
    const result = await setApprovalStatus(id, status);
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to update approval status");
      return;
    }
    await refreshData();
    setSuccessNotice(`User ${status === "APPROVED" ? "approved" : "rejected"} successfully.`);
  };

  const handleUserFieldChange = (id, field, value) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSaveUser = async (user) => {
    clearNotice();
    const result = await updateAdminUser(user.id, {
      name: user.name,
      phone: user.phone,
      role: user.role,
      approvalStatus: user.approvalStatus,
    });
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to save user");
      return;
    }
    await refreshData();
    setSuccessNotice("User details updated successfully.");
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user account permanently?")) {
      return;
    }

    const result = await deleteAdminUser(id);
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to delete user");
      return;
    }
    await refreshData();
    setSuccessNotice("User deleted successfully.");
  };

  const handleNewUserChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    clearNotice();
    const result = await createAdminUser(newUser);
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to create user");
      return;
    }
    setNewUser(EMPTY_NEW_USER);
    await refreshData();
    setSuccessNotice("User created successfully.");
  };

  const handleSiteFieldChange = (field, value) => {
    setSiteContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSiteContent = async () => {
    clearNotice();
    setSavingContent(true);
    const result = await updateSiteContent(siteContent);
    setSavingContent(false);
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to save website content");
      return;
    }
    await loadSiteContent();
    setSuccessNotice("Website content updated successfully.");
  };

  const handleDepartmentDraftChange = (field, value) => {
    setDepartmentDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleWardDraftChange = (field, value) => {
    setWardDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestDraftChange = (field, value) => {
    setTestDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleHospitalFieldChange = (id, field, value) => {
    setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const handleSaveHospital = async (hospital) => {
    clearNotice();
    const result = await updateHospital(hospital.id, {
      name: hospital.name,
      location: hospital.location,
    });

    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to update hospital");
      return;
    }

    await refreshAnalyticsAndHospitals();
    setSuccessNotice("Hospital updated successfully.");
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    clearNotice();

    if (!primaryHospital?.id) {
      setErrorNotice("MediPortal hospital is not configured yet.");
      return;
    }

    const result = await createDepartment({
      hospitalId: primaryHospital.id,
      name: departmentDraft.name,
    });
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to create department");
      return;
    }

    setDepartmentDraft(EMPTY_DEPARTMENT_DRAFT);
    await refreshAnalyticsAndHospitals();
    setSuccessNotice("Department created successfully.");
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    clearNotice();

    const result = await createWard({
      departmentId: wardDraft.departmentId,
      capacity: wardDraft.capacity,
    });
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to create ward");
      return;
    }

    setWardDraft(EMPTY_WARD_DRAFT);
    await refreshAnalyticsAndHospitals();
    setSuccessNotice("Ward created successfully.");
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    clearNotice();

    const result = await createDiagnosticTest({
      name: testDraft.name,
      price: testDraft.price,
    });
    if (!result?.success) {
      setErrorNotice(result?.message || "Failed to create diagnostic test");
      return;
    }

    setTestDraft(EMPTY_TEST_DRAFT);
    await refreshAnalyticsAndHospitals();
    setSuccessNotice("Diagnostic test created successfully.");
  };

  return (
    <div className="admin-page">
      <div className="admin-wrap">
        <div className="admin-topbar">
          <div className="admin-title">
            <h1>Admin Control Center</h1>
            <p>Manage approvals, users, and website settings from one dashboard.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-btn" onClick={() => navigate("/")}>Home</button>
            <button className="admin-btn" onClick={loadAll}>Refresh</button>
            <button className="admin-btn danger" onClick={logout}>Logout</button>
          </div>
        </div>

        {notice.text ? (
          <div className={`admin-notice ${notice.type === "error" ? "error" : "success"}`}>
            {notice.text}
          </div>
        ) : null}

        <div className="admin-cards">
          <div className="admin-card">
            <h3>Total Users</h3>
            <p>{summary.totalUsers || 0}</p>
          </div>
          <div className="admin-card">
            <h3>Pending Approvals</h3>
            <p>{summary.pendingApprovals || 0}</p>
          </div>
          <div className="admin-card">
            <h3>Approved</h3>
            <p>{summary.approvedUsers || 0}</p>
          </div>
          <div className="admin-card">
            <h3>Rejected</h3>
            <p>{summary.rejectedUsers || 0}</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === "approvals" ? "active" : ""}`} onClick={() => setTab("approvals")}>Signup Approvals</button>
          <button className={`admin-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>User Management</button>
          <button className={`admin-tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics & Reports</button>
          <button className={`admin-tab ${tab === "hospitals" ? "active" : ""}`} onClick={() => setTab("hospitals")}>Hospital Management</button>
          <button className={`admin-tab ${tab === "site" ? "active" : ""}`} onClick={() => setTab("site")}>Website Content</button>
        </div>

        {loading ? (
          <div className="admin-panel">Loading admin data...</div>
        ) : tab === "approvals" ? (
          <div className="admin-panel">
            <h3 className="admin-section-title">Pending Professional Signups</h3>
            {pendingUsers.length === 0 ? (
              <p>No pending signup requests.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.phone || "-"}</td>
                        <td>
                          <button className="admin-btn primary" onClick={() => handleApproval(user.id, "APPROVED")}>Approve</button>{" "}
                          <button className="admin-btn danger" onClick={() => handleApproval(user.id, "REJECTED")}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === "users" ? (
          <div className="admin-user-layout">
            <div className="admin-panel">
              <h3 className="admin-section-title">All Users</h3>
              <div className="admin-toolbar">
                <input className="admin-input" placeholder="Search by name/email" value={query} onChange={(e) => setQuery(e.target.value)} />
                <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="NURSE">NURSE</option>
                  <option value="STAFF">STAFF</option>
                  <option value="PATIENT">PATIENT</option>
                </select>
                <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <span className="admin-filter-count">{filteredUsers.length} of {users.length} users</span>
                <button className="admin-btn" type="button" onClick={resetUserFilters}>Clear Filters</button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td><input className="admin-input" value={user.name || ""} onChange={(e) => handleUserFieldChange(user.id, "name", e.target.value)} /></td>
                        <td>{user.email}</td>
                        <td>
                          <select className="admin-select" value={user.role} onChange={(e) => handleUserFieldChange(user.id, "role", e.target.value)}>
                            <option value="ADMIN">ADMIN</option>
                            <option value="DOCTOR">DOCTOR</option>
                            <option value="NURSE">NURSE</option>
                            <option value="STAFF">STAFF</option>
                            <option value="PATIENT">PATIENT</option>
                          </select>
                        </td>
                        <td>
                          <select className="admin-select" value={user.approvalStatus || "APPROVED"} onChange={(e) => handleUserFieldChange(user.id, "approvalStatus", e.target.value)}>
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td><input className="admin-input" value={user.phone || ""} onChange={(e) => handleUserFieldChange(user.id, "phone", e.target.value)} /></td>
                        <td>
                          <button className="admin-btn primary" onClick={() => handleSaveUser(user)}>Save</button>{" "}
                          <button className="admin-btn danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="admin-user-sidebar">
            <div className="admin-panel admin-create-user-panel">
              <h3 className="admin-section-title">Create User</h3>
              <p className="admin-panel-subtitle">Add a new account with role and approval in one step.</p>
              <form className="admin-create-form" onSubmit={handleCreateUser}>
                <label className="admin-field-label">Full Name</label>
                <input className="admin-input" placeholder="Enter full name" value={newUser.name} onChange={(e) => handleNewUserChange("name", e.target.value)} required />

                <label className="admin-field-label">Email</label>
                <input className="admin-input" type="email" placeholder="name@hospital.com" value={newUser.email} onChange={(e) => handleNewUserChange("email", e.target.value)} required />

                <label className="admin-field-label">Password</label>
                <input className="admin-input" type="password" placeholder="Create secure password" value={newUser.password} onChange={(e) => handleNewUserChange("password", e.target.value)} required />

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-field-label">Role</label>
                    <select className="admin-select" value={newUser.role} onChange={(e) => handleNewUserChange("role", e.target.value)}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="NURSE">NURSE</option>
                      <option value="STAFF">STAFF</option>
                      <option value="PATIENT">PATIENT</option>
                    </select>
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-field-label">Approval</label>
                    <select className="admin-select" value={newUser.approvalStatus} onChange={(e) => handleNewUserChange("approvalStatus", e.target.value)}>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <label className="admin-field-label">Phone</label>
                <input className="admin-input" placeholder="Optional phone number" value={newUser.phone} onChange={(e) => handleNewUserChange("phone", e.target.value)} />

                <button className="admin-btn primary admin-btn-block" type="submit">Create User</button>
              </form>
            </div>

            <div className="admin-panel admin-role-overview">
              <h3 className="admin-section-title">Role Overview</h3>
              <div className="admin-role-list">
                <div className="admin-role-item"><span className="admin-chip">Admins</span><strong>{summary.byRole?.admins || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip">Doctors</span><strong>{summary.byRole?.doctors || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip">Nurses</span><strong>{summary.byRole?.nurses || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip">Staff</span><strong>{summary.byRole?.staff || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip">Patients</span><strong>{summary.byRole?.patients || 0}</strong></div>
              </div>
            </div>
            </aside>
          </div>
        ) : tab === "analytics" ? (
          <div className="admin-panel admin-stack-grid">
            <h3 className="admin-section-title">System Analytics & Reporting</h3>
            <div className="admin-cards admin-cards-3">
              <div className="admin-card"><h3>Appointments</h3><p>{analytics.appointments?.total || 0}</p></div>
              <div className="admin-card"><h3>Reports</h3><p>{analytics.reporting?.reportsTotal || 0}</p></div>
              <div className="admin-card"><h3>Telemedicine Sessions</h3><p>{analytics.reporting?.telemedicineSessions || 0}</p></div>
            </div>

            <div className="admin-analytics-chart-grid">
              <div className="admin-panel">
                <h3 className="admin-section-title">Appointments Distribution</h3>
                <div className="admin-pie-layout">
                  <div className="admin-pie-chart" style={{ background: appointmentPieBackground }}>
                    <div className="admin-pie-center">
                      <span>Total</span>
                      <strong>{appointmentTotal}</strong>
                    </div>
                  </div>
                  <div className="admin-pie-legend">
                    {appointmentStatusData.map((item) => (
                      <div key={item.label} className="admin-pie-legend-item">
                        <span className="admin-dot" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                        <strong>
                          {item.value} ({item.percentage ?? (appointmentTotal ? Math.round((item.value / appointmentTotal) * 100) : 0)}%)
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <h3 className="admin-section-title">Facility Capacity</h3>
                <div className="admin-bar-list">
                  {facilityBarData.map((item) => (
                    <div key={item.label} className="admin-bar-row">
                      <div className="admin-bar-meta">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="admin-bar-track">
                        <div
                          className="admin-bar-fill"
                          style={{ width: `${Math.round((item.value / facilityBarMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-panel">
                <h3 className="admin-section-title">Appointment Status</h3>
                <div className="admin-role-list">
                  <div className="admin-role-item"><span className="admin-chip">Scheduled</span><strong>{analytics.appointments?.scheduled || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip">Accepted</span><strong>{analytics.appointments?.accepted || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip approved">Completed</span><strong>{analytics.appointments?.completed || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip rejected">Rejected</span><strong>{analytics.appointments?.rejected || 0}</strong></div>
                </div>
              </div>

              <div className="admin-panel">
                <h3 className="admin-section-title">Facility Footprint</h3>
                <div className="admin-role-list">
                  <div className="admin-role-item"><span className="admin-chip">Hospitals</span><strong>{analytics.facilities?.hospitalsTotal || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip">Departments</span><strong>{analytics.facilities?.departmentsTotal || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip">Wards</span><strong>{analytics.facilities?.wardsTotal || 0}</strong></div>
                  <div className="admin-role-item"><span className="admin-chip">Emergency Units</span><strong>{analytics.facilities?.emergencyUnitsTotal || 0}</strong></div>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <h3 className="admin-section-title">User & Approval Snapshot</h3>
              <div className="admin-role-list">
                <div className="admin-role-item"><span className="admin-chip">Total Tracked Users</span><strong>{analytics.users?.total || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip approved">Approved Professionals</span><strong>{analytics.users?.approvedProfessionals || 0}</strong></div>
                <div className="admin-role-item"><span className="admin-chip pending">Pending Professionals</span><strong>{analytics.users?.pendingProfessionals || 0}</strong></div>
              </div>
            </div>
          </div>
        ) : tab === "hospitals" ? (
          <div className="admin-user-layout">
            <div className="admin-panel">
              <h3 className="admin-section-title">Hospital Management</h3>
              <p className="admin-panel-subtitle">Single hospital mode: MediPortal</p>

              <div className="admin-cards admin-cards-3 admin-cards-tight">
                <div className="admin-card"><h3>Total Hospitals</h3><p>{hospitalOverview.total}</p></div>
                <div className="admin-card"><h3>Total Departments</h3><p>{hospitalOverview.departments}</p></div>
                <div className="admin-card"><h3>Total Wards</h3><p>{hospitalOverview.wards}</p></div>
              </div>

              <div className="admin-toolbar">
                <input
                  className="admin-input"
                  placeholder="Search hospital by name or location"
                  value={hospitalQuery}
                  onChange={(e) => setHospitalQuery(e.target.value)}
                />
                <span className="admin-filter-count">{filteredHospitals.length} of {hospitals.length} hospitals</span>
                <button className="admin-btn" type="button" onClick={() => setHospitalQuery("")}>Clear Search</button>
                <button className="admin-btn" type="button" onClick={refreshAnalyticsAndHospitals}>Refresh Data</button>
              </div>

              {hospitals.length === 0 ? (
                <p>No hospitals configured yet.</p>
              ) : filteredHospitals.length === 0 ? (
                <p>No hospitals match your search.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Departments</th>
                        <th>Wards</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHospitals.map((hospital) => (
                        <tr key={hospital.id}>
                          <td><input className="admin-input" value={hospital.name || "MediPortal"} disabled /></td>
                          <td><input className="admin-input" value={hospital.location || ""} onChange={(e) => handleHospitalFieldChange(hospital.id, "location", e.target.value)} /></td>
                          <td>{hospital.departmentCount || 0}</td>
                          <td>{hospital.wardCount || 0}</td>
                          <td>
                            <button className="admin-btn primary" onClick={() => handleSaveHospital(hospital)}>Save</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="admin-panel admin-section-title-spaced">
                <h3 className="admin-section-title">Departments and Wards Registry</h3>
                {filteredHospitals.length === 0 ? (
                  <p>No hospital data available for department and ward registry.</p>
                ) : (
                  <div className="admin-hierarchy-list">
                    {filteredHospitals.map((hospital) => (
                      <div className="admin-hierarchy-card" key={`hierarchy-${hospital.id}`}>
                        <h4>{hospital.name}</h4>
                        <p>{hospital.location}</p>
                        {Array.isArray(hospital.departments) && hospital.departments.length > 0 ? (
                          <ul className="admin-inline-list">
                            {hospital.departments.map((department) => (
                              <li key={department.id}>
                                {department.name} ({department.wardCount || 0} wards)
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No departments added yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="admin-user-sidebar">
              <div className="admin-panel admin-create-user-panel">
                <h3 className="admin-section-title">Add Department</h3>
                <form className="admin-create-form" onSubmit={handleCreateDepartment}>
                  <label className="admin-field-label">Hospital</label>
                  <input className="admin-input" value="MediPortal" disabled />

                  <label className="admin-field-label">Department Name</label>
                  <input
                    className="admin-input"
                    placeholder="e.g., Cardiology"
                    value={departmentDraft.name}
                    onChange={(e) => handleDepartmentDraftChange("name", e.target.value)}
                    required
                  />

                  <button className="admin-btn primary admin-btn-block" type="submit">Create Department</button>
                </form>
              </div>

              <div className="admin-panel admin-create-user-panel">
                <h3 className="admin-section-title">Add Ward</h3>
                <form className="admin-create-form" onSubmit={handleCreateWard}>
                  <label className="admin-field-label">Hospital</label>
                  <input className="admin-input" value="MediPortal" disabled />

                  <label className="admin-field-label">Department</label>
                  <select
                    className="admin-select"
                    value={wardDraft.departmentId}
                    onChange={(e) => handleWardDraftChange("departmentId", e.target.value)}
                    required
                  >
                    <option value="">Select department</option>
                    {departmentChoicesForWard.map((department) => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>

                  <label className="admin-field-label">Capacity</label>
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    placeholder="e.g., 20"
                    value={wardDraft.capacity}
                    onChange={(e) => handleWardDraftChange("capacity", e.target.value)}
                    required
                  />

                  <button className="admin-btn primary admin-btn-block" type="submit">Create Ward</button>
                </form>
              </div>

              <div className="admin-panel admin-create-user-panel">
                <h3 className="admin-section-title">Create Diagnostic Test</h3>
                <form className="admin-create-form" onSubmit={handleCreateTest}>
                  <label className="admin-field-label">Test Name</label>
                  <input
                    className="admin-input"
                    placeholder="e.g., CBC"
                    value={testDraft.name}
                    onChange={(e) => handleTestDraftChange("name", e.target.value)}
                    required
                  />

                  <label className="admin-field-label">Price</label>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 499"
                    value={testDraft.price}
                    onChange={(e) => handleTestDraftChange("price", e.target.value)}
                    required
                  />

                  <button className="admin-btn primary admin-btn-block" type="submit">Create Test</button>
                </form>

                <h4 className="admin-subheading">Available Tests</h4>
                {hospitalTests.length === 0 ? (
                  <p className="admin-mini-note">No diagnostic tests configured yet.</p>
                ) : (
                  <ul className="admin-inline-list">
                    {hospitalTests.map((test) => (
                      <li key={test.id}>{test.name} - ${Number(test.price || 0).toFixed(2)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="admin-panel">
            <h3 className="admin-section-title">Website Content Management</h3>
            <div className="admin-grid-2">
              <div className="admin-stack-grid">
                <input className="admin-input" value={siteContent.heroTitle || ""} onChange={(e) => handleSiteFieldChange("heroTitle", e.target.value)} placeholder="Hero Title" />
                <textarea className="admin-textarea" value={siteContent.heroSubtitle || ""} onChange={(e) => handleSiteFieldChange("heroSubtitle", e.target.value)} placeholder="Hero Subtitle" />
                <textarea className="admin-textarea" value={siteContent.aboutHospital || ""} onChange={(e) => handleSiteFieldChange("aboutHospital", e.target.value)} placeholder="About Hospital" />
                <textarea className="admin-textarea" value={siteContent.footerAbout || ""} onChange={(e) => handleSiteFieldChange("footerAbout", e.target.value)} placeholder="Footer About" />
              </div>
              <div className="admin-stack-grid">
                <input className="admin-input" value={siteContent.emergencyContact || ""} onChange={(e) => handleSiteFieldChange("emergencyContact", e.target.value)} placeholder="Emergency Contact" />
                <input className="admin-input" value={siteContent.contactAddress || ""} onChange={(e) => handleSiteFieldChange("contactAddress", e.target.value)} placeholder="Contact Address" />
                <input className="admin-input" value={siteContent.contactPhone || ""} onChange={(e) => handleSiteFieldChange("contactPhone", e.target.value)} placeholder="Contact Phone" />
                <input className="admin-input" value={siteContent.contactEmail || ""} onChange={(e) => handleSiteFieldChange("contactEmail", e.target.value)} placeholder="Contact Email" />
                <button className="admin-btn primary" onClick={handleSaveSiteContent} disabled={savingContent}>
                  {savingContent ? "Saving..." : "Save Website Content"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
