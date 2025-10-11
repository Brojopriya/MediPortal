import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./doctor/Sidebar";
import Profile from "./doctor/Profile";
import Appointments from "./doctor/Appointments";
import Patients from "./doctor/Patients";
import Prescriptions from "./doctor/Prescriptions";
import Emergency from "./doctor/Emergency";
import DashboardHome from "./doctor/DashboardHome"; // <-- import
import "./Doctordashboard.css";

const DoctorDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          {/* Default dashboard home */}
          <Route path="/" element={<DashboardHome />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="emergency" element={<Emergency />} />
        </Routes>
      </main>
    </div>
  );
};

export default DoctorDashboard;
