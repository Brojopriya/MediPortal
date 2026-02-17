import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./patient/Sidebar";
import Profile from "./patient/Profile";
import "./PatientDashboard.css";

// Placeholder components - you can create these later
const DashboardHome = () => (
  <div className="dashboard-home">
    <h2>Welcome to Your Patient Portal</h2>
    <div className="overview-cards">
      <div className="card">
        <h3>Upcoming Appointments</h3>
        <p>2 appointments scheduled</p>
      </div>
      <div className="card">
        <h3>Recent Reports</h3>
        <p>3 new lab reports available</p>
      </div>
      <div className="card">
        <h3>Active Prescriptions</h3>
        <p>5 active prescriptions</p>
      </div>
    </div>
  </div>
);

const Appointments = () => (
  <div>
    <h2>My Appointments</h2>
    <p>View and manage your appointments here.</p>
  </div>
);

const MedicalRecords = () => (
  <div>
    <h2>Medical Records</h2>
    <p>Access your medical records and history.</p>
  </div>
);

const Prescriptions = () => (
  <div>
    <h2>My Prescriptions</h2>
    <p>View your current and past prescriptions.</p>
  </div>
);

const Reports = () => (
  <div>
    <h2>Lab Reports</h2>
    <p>Access your laboratory test reports.</p>
  </div>
);

const Teleconsultation = () => (
  <div>
    <h2>Teleconsultation</h2>
    <p>Connect with doctors online.</p>
  </div>
);

const Billing = () => (
  <div>
    <h2>Billing & Payments</h2>
    <p>View bills and payment history.</p>
  </div>
);

const PatientDashboard = () => {
  return (
    <div className="patient-dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="teleconsultation" element={<Teleconsultation />} />
          <Route path="billing" element={<Billing />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientDashboard;
