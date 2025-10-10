// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { fetchDoctors, fetchServices } from "./api.js";
import mediLogo from "./medi.png"; // path relative to App.js


function App() {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [docs, svcs] = await Promise.all([fetchDoctors(), fetchServices()]);
        setDoctors(docs);
        setServices(svcs);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>MediPortal</h1>
        </header>
        <header className="App-header">
  <div className="header-container">
    {/* Left side: Logo */}
    <div className="logo">
    <img src={mediLogo} alt="MediPortal Logo" className="logo-img" />
      <span>MediPortal</span>
    </div>

    {/* Center: Navigation */}
    <nav className="nav-links">
      <a href="/">Home</a>
      <a href="/doctors">Doctors</a>
      <a href="/patients">Patients</a>
      <a href="/appointments">Appointments</a>
      <a href="/telemedicine">Telemedicine</a>
    </nav>

    {/* Right side: User actions */}
    <div className="user-actions">
      <a href="/login" className="btn-login">Login</a>
      <a href="/signup" className="btn-signup">Sign Up</a>
    </div>
  </div>
</header>


        <main>
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <div className="loading">Loading home page...</div>
                ) : (
                  <HomePage doctors={doctors} services={services} />
                )
              }
            />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;