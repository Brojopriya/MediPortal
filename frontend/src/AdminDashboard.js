import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminSummary,
  fetchAdminUsers,
  fetchPendingApprovals,
  fetchSiteContent,
  setApprovalStatus,
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

  const loadAll = async () => {
    setLoading(true);
    await Promise.allSettled([loadPending(), loadUsers(), loadSummary(), loadSiteContent()]);
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

  const refreshData = async () => {
    await Promise.allSettled([loadPending(), loadUsers(), loadSummary()]);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleApproval = async (id, status) => {
    const result = await setApprovalStatus(id, status);
    if (!result?.success) {
      alert(result?.message || "Failed to update approval status");
      return;
    }
    await refreshData();
  };

  const handleUserFieldChange = (id, field, value) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSaveUser = async (user) => {
    const result = await updateAdminUser(user.id, {
      name: user.name,
      phone: user.phone,
      role: user.role,
      approvalStatus: user.approvalStatus,
    });
    if (!result?.success) {
      alert(result?.message || "Failed to save user");
      return;
    }
    await refreshData();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user account permanently?")) {
      return;
    }

    const result = await deleteAdminUser(id);
    if (!result?.success) {
      alert(result?.message || "Failed to delete user");
      return;
    }
    await refreshData();
  };

  const handleNewUserChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const result = await createAdminUser(newUser);
    if (!result?.success) {
      alert(result?.message || "Failed to create user");
      return;
    }
    alert("User created successfully");
    setNewUser(EMPTY_NEW_USER);
    await refreshData();
  };

  const handleSiteFieldChange = (field, value) => {
    setSiteContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSiteContent = async () => {
    setSavingContent(true);
    const result = await updateSiteContent(siteContent);
    setSavingContent(false);
    if (!result?.success) {
      alert(result?.message || "Failed to save website content");
      return;
    }
    alert("Website content updated");
    await loadSiteContent();
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
          <div className="admin-grid-2">
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

            <div className="admin-panel">
              <h3 className="admin-section-title">Create User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="admin-toolbar admin-toolbar-grid">
                  <input className="admin-input" placeholder="Name" value={newUser.name} onChange={(e) => handleNewUserChange("name", e.target.value)} required />
                  <input className="admin-input" type="email" placeholder="Email" value={newUser.email} onChange={(e) => handleNewUserChange("email", e.target.value)} required />
                  <input className="admin-input" type="password" placeholder="Password" value={newUser.password} onChange={(e) => handleNewUserChange("password", e.target.value)} required />
                  <select className="admin-select" value={newUser.role} onChange={(e) => handleNewUserChange("role", e.target.value)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="NURSE">NURSE</option>
                    <option value="STAFF">STAFF</option>
                    <option value="PATIENT">PATIENT</option>
                  </select>
                  <select className="admin-select" value={newUser.approvalStatus} onChange={(e) => handleNewUserChange("approvalStatus", e.target.value)}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <input className="admin-input" placeholder="Phone" value={newUser.phone} onChange={(e) => handleNewUserChange("phone", e.target.value)} />
                  <button className="admin-btn primary" type="submit">Create User</button>
                </div>
              </form>

              <h3 className="admin-section-title admin-section-title-spaced">Role Overview</h3>
              <p><span className="admin-chip">Admins</span> {summary.byRole?.admins || 0}</p>
              <p><span className="admin-chip">Doctors</span> {summary.byRole?.doctors || 0}</p>
              <p><span className="admin-chip">Nurses</span> {summary.byRole?.nurses || 0}</p>
              <p><span className="admin-chip">Staff</span> {summary.byRole?.staff || 0}</p>
              <p><span className="admin-chip">Patients</span> {summary.byRole?.patients || 0}</p>
            </div>
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
