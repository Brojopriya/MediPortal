import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
// App.js (or whichever file)
import mediLogo from "./medi.png";

const HomePage = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch stats/doctors if endpoints exist; otherwise fallback to sample
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats({ doctors: 12, patients: 1240, appointments: 230 }));

    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d))
      .catch(() =>
        setDoctors([
          { id: 1, name: "Dr. Aya Rahman", specialty: "Cardiology", location: "Block A" },
          { id: 2, name: "Dr. Sami Ahmed", specialty: "General Surgery", location: "Block B" },
          { id: 3, name: "Dr. Lina Karim", specialty: "Pediatrics", location: "Block C" },
        ])
      );
  }, []);

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setCurrentUser(u);
    } catch (err) {
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="home-container">
      {/* Header / Nav */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-area" onClick={() => navigate('/') }>
          <img src={mediLogo} alt="MediPortal logo" className="logo-img" />
            <span className="brand">MediPortal</span>
          </div>

          <nav className="main-nav">
            <a href="/">Home</a>
            <a href="#doctors">Doctors</a>
            <a href="#emergency">Emergency</a>
            <a href="/telemedicine">Telemedicine</a>
            <a href="#services">Our Services</a>
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <>
                <span style={{ marginRight: 12, fontSize: 14 }}>Hi, {currentUser.name.split(' ')[0]}</span>
                <button
                  className="secondary"
                  onClick={() => {
                    if (currentUser.role === 'DOCTOR') navigate('/DoctorDashboard');
                    else if (currentUser.role === 'STAFF') navigate('/MedicalStaffDashboard');
                    else navigate('/');
                  }}
                >
                  Dashboard
                </button>
                <button className="secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="secondary" onClick={() => navigate('/login')}>Login</button>
                <button className="secondary" onClick={() => navigate('/signup')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Care when you need it — from anywhere</h1>
          <p>
            MediPortal connects you to verified doctors, manages appointments and medical records,
            and provides telemedicine — fast, secure, and reliable.
          </p>
          <div className="hero-cta">
            <button className="primary" onClick={() => (window.location.href = "/appointments")}>
              Book Now
            </button>
            <button className="ghost" onClick={() => (window.location.href = "#services")}>
              View Services
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">{stats.doctors}</div>
              <div className="stat-label">Doctors</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.patients}</div>
              <div className="stat-label">Patients</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.appointments}</div>
              <div className="stat-label">Appointments</div>
            </div>
          </div>
        </div>

        
      </section>

      {/* Quick Emergency strip */}
      <section id="emergency" className="emergency-strip">
        <div>
          <strong>EMERGENCY:</strong> Call <a href="tel:+123456789">+1 234 567 89</a> — Ambulance / ER open 24×7
        </div>
        <div>
          <button className="emergency-btn" onClick={() => (window.location.href = "/emergency")}>
            Get Help Now
          </button>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="feature">
            <h3>Appointment Booking</h3>
            <p>Quickly book in-person or teleconsultation visits with specialists.</p>
          </div>
          <div className="feature">
            <h3>Telemedicine</h3>
            <p>Secure video/voice consultations from home.</p>
          </div>
          <div className="feature">
            <h3>Medical Records</h3>
            <p>Centralized electronic health records for authorized access.</p>
          </div>
          <div className="feature">
            <h3>24/7 Support</h3>
            <p>Help with scheduling, referrals and prescription queries.</p>
          </div>
        </div>
      </section>

      {/* Doctors & Locations */}
      <section id="doctors" className="section doctors-section">
        <h2>Featured Doctors</h2>
        <div className="doctors-grid">
          {doctors.map((d) => (
            <article className="doctor-card" key={d.id}>
              <div className="doctor-avatar">{d.name.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
              <div className="doctor-info">
                <h4>{d.name}</h4>
                <p className="muted">{d.specialty}</p>
                <p className="muted small">Location: {d.location}</p>
                <div className="doctor-actions">
                  <button onClick={() => (window.location.href = `/doctors/${d.id}`)}>Profile</button>
                  <button className="primary" onClick={() => (window.location.href = "/appointments")}>Book</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact + Map */}
      <section className="section contact-section">
        <div className="contact-left">
          <h2>Contact & Location</h2>
          <p>
            <strong>Address:</strong> 123 Health St., City<br />
            <strong>Phone:</strong> <a href="tel:+123456789">+1 234 567 89</a><br />
            <strong>Email:</strong> <a href="mailto:info@mediportal.example">info@mediportal.example</a>
          </p>
          <p className="small muted">Open: Mon–Sat, 8:00 — 20:00 (ER 24×7)</p>
        </div>

        <div className="contact-right">
          <div className="map-placeholder">
            {/* Replace with an iframe or map component */}
            <img src="/map-placeholder.png" alt="Map placeholder" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div>© {new Date().getFullYear()} MediPortal</div>
        <div className="footer-links">
          <a href="#services">Services</a> • <a href="#doctors">Doctors</a> • <a href="#emergency">Emergency</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
