// dashboard/DashboardHome.js
import React from "react";

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <h2>Good Day, Dr.! Here’s your overview</h2>
      <p>A quick overview of your appointments and patients:</p>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <p>5 appointments today</p>
        </div>
        <div className="card">
          <h3>Total Patients</h3>
          <p>120 registered patients</p>
        </div>
        <div className="card">
          <h3>Prescriptions Today</h3>
          <p>8 prescriptions</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
