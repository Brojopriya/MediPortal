// dashboard/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Doctor Panel</h2>
      <nav>
        <ul>
          <li><Link to="/dashboard/profile">Profile</Link></li>
          <li><Link to="/dashboard/appointments">Appointments</Link></li>
          <li><Link to="/dashboard/patients">Patients</Link></li>
          <li><Link to="/dashboard/prescriptions">Prescriptions</Link></li>
          <li><Link to="/dashboard/emergency">Emergency</Link></li>
          <li><Link to="/dashboard/settings">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
