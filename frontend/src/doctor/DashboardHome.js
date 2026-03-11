import React, { useEffect, useState } from "react";
import { fetchDoctorDashboardSummary } from "../api";

const DashboardHome = () => {
  const [summary, setSummary] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    telemedicineCount: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    fetchDoctorDashboardSummary()
      .then((res) => {
        if (res?.success && res?.data) {
          setSummary(res.data);
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div className="dashboard-home">
      <h2>Doctor Overview</h2>
      <p>Real-time operational snapshot for your clinical workday.</p>

      <div className="overview-cards">
        <div className="card">
          <h3>Today's Appointments</h3>
          <p>{summary.todayAppointments}</p>
        </div>
        <div className="card">
          <h3>Total Patients</h3>
          <p>{summary.totalPatients}</p>
        </div>
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <p>{summary.upcomingAppointments}</p>
        </div>
        <div className="card">
          <h3>Completed Cases</h3>
          <p>{summary.completedAppointments}</p>
        </div>
        <div className="card">
          <h3>Telemedicine Sessions</h3>
          <p>{summary.telemedicineCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
