import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./staff/Sidebar";
import Profile from "./staff/Profile";
import Appointments from "./staff/Appointments";
import LabTests from "./staff/LabTests";
import "./MedicalStaffDashboard.css";
import { fetchStaffStats } from "./api";

// Dashboard Home Component
const DashboardHome = () => {
  const [stats, setStats] = React.useState({
    appointments: 0,
    labTests: 0,
    ongoingAppointments: 0,
    upcomingAppointments: 0,
    doctorCalls: 0,
  });

  React.useEffect(() => {
    fetchStaffStats()
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h2>Welcome to MediPortal!</h2>
      </div>
      <p>Here's a quick overview of your tasks:</p>

      <div className="overview-cards">
        <div className="card">
          <h3>Pending Appointments</h3>
          <p>{stats.appointments}</p>
        </div>
        <div className="card">
          <h3>Ongoing Appointments</h3>
          <p>{stats.ongoingAppointments}</p>
        </div>
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <p>{stats.upcomingAppointments}</p>
        </div>
        <div className="card">
          <h3>Assigned Lab Tests</h3>
          <p>{stats.labTests}</p>
        </div>
        <div className="card">
          <h3>Doctor Calls</h3>
          <p>{stats.doctorCalls}</p>
        </div>
      </div>

      <p>Use the sidebar to manage your tasks efficiently.</p>
    </div>
  );
};

const MedicalStaffDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="labTests" element={<LabTests />} />
        </Routes>
      </div>
    </div>
  );
};

export default MedicalStaffDashboard;
