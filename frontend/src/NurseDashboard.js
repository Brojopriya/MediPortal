import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./nurse/Sidebar";
import Profile from "./nurse/Profile";
import Schedule from "./nurse/Schedule";
import DepartmentContacts from "./nurse/DepartmentContacts";
import AssignedPatients from "./nurse/AssignedPatients";
import "./NurseDashboard.css";

const NurseDashboard = () => {
  return (
    <div className="nurse-dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="dashboard" element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="contacts" element={<DepartmentContacts />} />
          <Route path="patients" element={<AssignedPatients />} />
        </Routes>
      </main>
    </div>
  );
};

export default NurseDashboard;
