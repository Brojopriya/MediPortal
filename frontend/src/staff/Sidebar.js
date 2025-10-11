import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <h2>Medical Staff</h2>
      <ul>
        <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</li>
        <li className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>Appointments</li>
        <li className={activeTab === "labTests" ? "active" : ""} onClick={() => setActiveTab("labTests")}>Lab Tests</li>
      </ul>
    </div>
  );
};

export default Sidebar;
