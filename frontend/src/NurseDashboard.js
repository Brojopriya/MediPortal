import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./nurse/Sidebar";
import Profile from "./nurse/Profile";
import "./NurseDashboard.css";

// Placeholder components - you can create these later
const DashboardHome = () => (
  <div className="dashboard-home">
    <h2>Welcome to Nurse Portal</h2>
    <div className="overview-cards">
      <div className="card">
        <h3>Assigned Patients</h3>
        <p>12 patients under your care</p>
      </div>
      <div className="card">
        <h3>Medications Due</h3>
        <p>8 medication rounds today</p>
      </div>
      <div className="card">
        <h3>Vital Signs</h3>
        <p>5 patients need vitals check</p>
      </div>
      <div className="card">
        <h3>Current Shift</h3>
        <p>Morning Shift (6 AM - 2 PM)</p>
      </div>
    </div>
  </div>
);

const Patients = () => (
  <div>
    <h2>My Patients</h2>
    <p>View and manage patients under your care.</p>
  </div>
);

const WardManagement = () => (
  <div>
    <h2>Ward Management</h2>
    <p>Manage ward activities and bed assignments.</p>
  </div>
);

const Medication = () => (
  <div>
    <h2>Medication Administration</h2>
    <p>Track and administer patient medications.</p>
  </div>
);

const VitalSigns = () => (
  <div>
    <h2>Vital Signs Monitoring</h2>
    <p>Record and monitor patient vital signs.</p>
  </div>
);

const Reports = () => (
  <div>
    <h2>Nursing Reports</h2>
    <p>Create and view nursing reports.</p>
  </div>
);

const Schedule = () => (
  <div>
    <h2>My Schedule</h2>
    <p>View your work schedule and shift details.</p>
  </div>
);

const NurseDashboard = () => {
  return (
    <div className="nurse-dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="patients" element={<Patients />} />
          <Route path="ward-management" element={<WardManagement />} />
          <Route path="medication" element={<Medication />} />
          <Route path="vital-signs" element={<VitalSigns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="schedule" element={<Schedule />} />
        </Routes>
      </main>
    </div>
  );
};

export default NurseDashboard;
