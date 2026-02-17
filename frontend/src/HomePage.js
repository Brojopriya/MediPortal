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

  const handleDashboard = () => {
    if (currentUser) {
      if (currentUser.role === 'DOCTOR') navigate('/DoctorDashboard');
      else if (currentUser.role === 'STAFF') navigate('/MedicalStaffDashboard');
      else if (currentUser.role === 'NURSE') navigate('/NurseDashboard');
      else if (currentUser.role === 'PATIENT') navigate('/PatientDashboard');
      else navigate('/');
    }
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
            <a href="#services">Services</a>
            <a href="#doctors">Doctors</a>
            <a href="#for-patients">For Patients</a>
            <a href="#for-professionals">For Professionals</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <>
                <span style={{ marginRight: 12, fontSize: 14, fontWeight: 500 }}>
                  Hi, {currentUser.name.split(' ')[0]}
                </span>
                <button
                  className="secondary"
                  onClick={handleDashboard}
                >
                  Dashboard
                </button>
                <button className="secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="secondary" onClick={() => navigate('/login')}>Login</button>
                <button className="primary" onClick={() => navigate('/signup')}>Sign Up</button>
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
            <button className="primary" onClick={() => navigate('/signup')}>
              Book Appointment
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
          <strong>🚨 EMERGENCY:</strong> Call <a href="tel:+1234567890">+1 234 567 890</a> — Ambulance / ER open 24×7
        </div>
        <div>
          <button className="emergency-btn" onClick={() => alert('Emergency services: Call +1 234 567 890 immediately!')}>
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
                  <button className="primary" onClick={() => navigate('/signup')}>Book</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* For Patients Section */}
      <section id="for-patients" className="section user-section">
        <h2>For Patients</h2>
        <p className="section-intro">Access quality healthcare from the comfort of your home</p>
        <div className="user-features-grid">
          <div className="user-feature">
            <div className="feature-icon">📅</div>
            <h3>Book Appointments</h3>
            <p>Schedule appointments with specialist doctors at your convenience</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">📋</div>
            <h3>Medical Records</h3>
            <p>Access your complete medical history, prescriptions, and reports in one place</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>View Records</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">💻</div>
            <h3>Teleconsultation</h3>
            <p>Connect with doctors online through secure video consultations</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Start Consultation</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">💊</div>
            <h3>Prescriptions</h3>
            <p>Get digital prescriptions and track your medications</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Manage Meds</button>
          </div>
        </div>
      </section>

      {/* For Healthcare Professionals Section */}
      <section id="for-professionals" className="section user-section alt">
        <h2>For Healthcare Professionals</h2>
        <p className="section-intro">Streamline your practice with our comprehensive platform</p>
        <div className="professionals-grid">
          <div className="professional-card">
            <div className="professional-icon">👨‍⚕️</div>
            <h3>For Doctors</h3>
            <ul>
              <li>Manage patient appointments efficiently</li>
              <li>Access comprehensive patient records</li>
              <li>Prescribe medications digitally</li>
              <li>Conduct teleconsultations</li>
              <li>Track emergency cases</li>
            </ul>
            <button className="prof-btn" onClick={() => navigate('/login')}>Doctor Login</button>
          </div>
          <div className="professional-card">
            <div className="professional-icon">👩‍⚕️</div>
            <h3>For Nurses</h3>
            <ul>
              <li>Monitor patient vital signs</li>
              <li>Manage ward operations</li>
              <li>Administer medications</li>
              <li>Track patient care schedules</li>
              <li>Generate nursing reports</li>
            </ul>
            <button className="prof-btn" onClick={() => navigate('/login')}>Nurse Login</button>
          </div>
          <div className="professional-card">
            <div className="professional-icon">🏥</div>
            <h3>For Medical Staff</h3>
            <ul>
              <li>Process lab test orders</li>
              <li>Manage appointment schedules</li>
              <li>Handle administrative tasks</li>
              <li>Coordinate with healthcare teams</li>
              <li>Generate reports and analytics</li>
            </ul>
            <button className="prof-btn" onClick={() => navigate('/login')}>Staff Login</button>
          </div>
        </div>
      </section>

      {/* Contact + Map */}
      <section id="contact" className="section contact-section">
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
        <div className="footer-content">
          <div className="footer-section">
            <h4>MediPortal</h4>
            <p>Your trusted healthcare companion - connecting patients with quality medical care.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#services">Services</a>
              <a href="#doctors">Doctors</a>
              <a href="#for-patients">For Patients</a>
              <a href="#for-professionals">For Professionals</a>
              <a href="#emergency">Emergency</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Get Started</h4>
            <div className="footer-links">
              <a href="/signup">Sign Up</a>
              <a href="/login">Login</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Emergency Contact</h4>
            <p><a href="tel:+1234567890" style={{color: '#e74c3c', fontWeight: 'bold'}}>📞 +1 234 567 890</a></p>
            <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>Available 24/7</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MediPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
