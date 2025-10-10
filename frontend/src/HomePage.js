// frontend/src/HomePage.js
import React, { useEffect, useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
  });

  useEffect(() => {
    // Example: fetch stats from backend API
    fetch("/api/stats")  // You need to create this endpoint
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to MediPortal</h1>
        <p>Your centralized healthcare management system</p>
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <h2>{stats.doctors}</h2>
          <p>Doctors</p>
        </div>
        <div className="stat-card">
          <h2>{stats.patients}</h2>
          <p>Patients</p>
        </div>
        <div className="stat-card">
          <h2>{stats.appointments}</h2>
          <p>Appointments</p>
        </div>
      </section>

      <section className="navigation-section">
        <button onClick={() => window.location.href="/doctors"}>View Doctors</button>
        <button onClick={() => window.location.href="/patients"}>View Patients</button>
        <button onClick={() => window.location.href="/appointments"}>View Appointments</button>
      </section>
    </div>
  );
};

export default HomePage;
