import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
// App.js (or whichever file)
import mediLogo from "./medi.png";
import { fetchDoctors, fetchPublicStats, fetchSiteContent } from "./api";

const HomePage = () => {
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    departments: 0,
    facilities: 0,
    emergencyContact: "+1 234 567 890",
    aboutHospital: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [siteContent, setSiteContent] = useState({
    heroTitle: "Care when you need it - from anywhere",
    heroSubtitle:
      "MediPortal connects you to verified doctors, manages appointments and medical records, and provides telemedicine - fast, secure, and reliable.",
    contactAddress: "123 Health St., City",
    contactPhone: "+1 234 567 89",
    contactEmail: "info@mediportal.example",
    footerAbout:
      "Your trusted healthcare companion - connecting patients with quality medical care.",
    emergencyContact: "+1 234 567 890",
    aboutHospital: "",
  });

  useEffect(() => {
    const loadHomeData = async () => {
      const [statsRes, doctorsRes, siteRes] = await Promise.allSettled([
        fetchPublicStats(),
        fetchDoctors(),
        fetchSiteContent(),
      ]);

      if (statsRes.status === "fulfilled") {
        const payload = statsRes.value?.data || {};
        setStats({
          doctors: payload.doctors || 0,
          patients: payload.patients || 0,
          appointments: payload.appointments || 0,
          departments: payload.departments || 0,
          facilities: payload.facilities || 0,
          emergencyContact: payload.emergencyContact || "+1 234 567 890",
          aboutHospital: payload.aboutHospital || "",
        });
      }

      if (doctorsRes.status === "fulfilled") {
        const doctorList = Array.isArray(doctorsRes.value?.data) ? doctorsRes.value.data : [];
        setDoctors(doctorList);
      }

      if (siteRes.status === "fulfilled" && siteRes.value?.success && siteRes.value?.data) {
        setSiteContent((prev) => ({ ...prev, ...siteRes.value.data }));
      }

      setIsLoadingHome(false);
    };

    loadHomeData();
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
      else if (currentUser.role === 'ADMIN') navigate('/AdminDashboard');
      else navigate('/');
    }
  };

  const handleBookAppointment = () => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    if (currentUser.role === 'PATIENT') {
      navigate('/PatientDashboard/appointments');
      return;
    }

    navigate('/login');
  };

  const doctorCountForDisplay = Math.max(stats.doctors || 0, doctors.length || 0);
  const activeSpecialties = new Set(
    doctors
      .map((d) => d.speciality || d.specialty)
      .filter((value) => typeof value === "string" && value.trim())
  ).size;

  const liveHighlights = [
    {
      label: "Verified Doctors",
      value: doctorCountForDisplay,
      note: "Profiles visible to patients",
    },
    {
      label: "Active Departments",
      value: stats.departments || 0,
      note: "Clinical units operating",
    },
    {
      label: "Specialties Available",
      value: activeSpecialties,
      note: "From current doctor data",
    },
    {
      label: "Total Patients",
      value: stats.patients || 0,
      note: "Registered in system",
    },
  ];

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
            <a href="#services">Services</a>
            <a href="#doctors">Doctors</a>
            <a href="#for-patients">For Patients</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <>
                <span className="header-user-greeting">
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
          <h1>{siteContent.heroTitle || "Care when you need it - from anywhere"}</h1>
          <p>
            {siteContent.heroSubtitle ||
              "MediPortal connects you to verified doctors, manages appointments and medical records, and provides telemedicine - fast, secure, and reliable."}
          </p>
          <div className="hero-cta">
            <button className="primary" onClick={handleBookAppointment}>
              Book Appointment
            </button>
            <button className="ghost" onClick={() => (window.location.href = "#services")}>
              View Services
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">{doctorCountForDisplay}</div>
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

          <p className="hero-live-note">
            {isLoadingHome ? "Syncing live hospital metrics..." : "Live metrics are synced from backend services."}
          </p>
        </div>

        
      </section>

      {/* Quick Emergency strip */}
      <section id="emergency" className="emergency-strip">
        <div>
          <strong>Emergency Line:</strong> Call <a href={`tel:${siteContent.emergencyContact || stats.emergencyContact || "+1234567890"}`}>{siteContent.emergencyContact || stats.emergencyContact}</a> for urgent care and ambulance coordination.
        </div>
        <div>
          <button className="emergency-btn" onClick={() => alert(`Emergency support is available 24/7. Call ${siteContent.emergencyContact || stats.emergencyContact || "+1 234 567 890"}.`)}>
            Call Emergency Support
          </button>
        </div>
      </section>

      <section className="section services">
        <h2>Live Operations Snapshot</h2>
        <p className="section-intro">Current platform activity based on real-time backend data.</p>
        <div className="snapshot-grid">
          {liveHighlights.map((item) => (
            <article key={item.label} className="snapshot-card">
              <h3>{item.label}</h3>
              <p className="snapshot-value">{item.value}</p>
              <p className="snapshot-note">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section services">
        <h2>Why Patients Trust MediPortal</h2>
        <div className="services-grid">
          <div className="feature">
            <h3>Verified Care Teams</h3>
            <p>Doctor, nurse, and staff accounts are reviewed through admin approval workflows.</p>
          </div>
          <div className="feature">
            <h3>Secure Access</h3>
            <p>Role-based access protects patient information and limits visibility by responsibility.</p>
          </div>
          <div className="feature">
            <h3>Operational Visibility</h3>
            <p>Appointments, records, and clinical coordination are tracked in one connected system.</p>
          </div>
          <div className="feature">
            <h3>Continuous Availability</h3>
            <p>Emergency routing and telemedicine support extend care beyond physical visits.</p>
          </div>
        </div>
      </section>

      <section className="section services">
        <h2>Hospital Overview</h2>
        <p className="muted">{siteContent.aboutHospital || stats.aboutHospital || "Comprehensive clinical services across outpatient care, emergency response, and digital consultation."}</p>
        <div className="services-grid">
          <div className="feature">
            <h3>{stats.departments}</h3>
            <p>Clinical Departments</p>
          </div>
          <div className="feature">
            <h3>{stats.facilities}</h3>
            <p>Care Units & Facilities</p>
          </div>
          <div className="feature">
            <h3>24/7 Operations</h3>
            <p>Emergency & Critical Care</p>
          </div>
          <div className="feature">
            <h3>Compliance Ready</h3>
            <p>Controlled Access to Health Records</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="feature">
            <h3>Scheduling Management</h3>
            <p>Coordinate in-person and virtual appointments with specialty-based doctor matching.</p>
          </div>
          <div className="feature">
            <h3>Telemedicine Services</h3>
            <p>Enable secure remote consultations with documented clinical follow-up.</p>
          </div>
          <div className="feature">
            <h3>Electronic Health Records</h3>
            <p>Maintain centralized patient histories for authorized, role-specific access.</p>
          </div>
          <div className="feature">
            <h3>Care Coordination</h3>
            <p>Support referrals, follow-up plans, and medication continuity across care teams.</p>
          </div>
        </div>
      </section>

      {/* Doctors & Locations */}
      <section id="doctors" className="section doctors-section">
        <h2>Our Doctors</h2>
        <div className="doctors-grid">
          {doctors.map((d) => (
            <article className="doctor-card" key={d.id}>
              {d.profileUrl ? (
                <img
                  src={d.profileUrl}
                  alt={d.name || "Doctor"}
                  className="doctor-photo"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const sibling = e.currentTarget.nextElementSibling;
                    if (sibling && sibling.classList.contains("doctor-avatar-fallback")) {
                      sibling.classList.remove("is-hidden");
                    }
                  }}
                />
              ) : null}
              <div className={`doctor-avatar-fallback ${d.profileUrl ? "is-hidden" : ""}`}>
                {(d.name || "Doctor").split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
              <div className="doctor-info">
                <h4>{d.name || `Doctor #${d.id}`}</h4>
                <p className="muted">{d.specialty || d.speciality || "General"}</p>
                <p className="muted small">Location: {d.location || "Main Hospital"}</p>
                <div className="doctor-actions">
                  <button onClick={() => navigate(`/doctors/${d.id}`)}>Profile</button>
                  <button className="primary" onClick={handleBookAppointment}>Book</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* For Patients Section */}
      <section id="for-patients" className="section user-section">
        <h2>For Patients</h2>
        <p className="section-intro">A clear and secure patient experience from appointment to follow-up.</p>
        <div className="user-features-grid">
          <div className="user-feature">
            <div className="feature-icon">APPT</div>
            <h3>Book Appointments</h3>
            <p>Find available specialists and schedule consultations without phone-based delays.</p>
            <button className="feature-btn" onClick={handleBookAppointment}>Schedule Now</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">EHR</div>
            <h3>Medical Records</h3>
            <p>Review diagnosis history, prescriptions, and reports from a single patient profile.</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Access Records</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">V-CARE</div>
            <h3>Teleconsultation</h3>
            <p>Connect with clinicians online and continue care even when in-person visits are not possible.</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Start Session</button>
          </div>
          <div className="user-feature">
            <div className="feature-icon">RX</div>
            <h3>Prescriptions</h3>
            <p>Track medication plans and receive digital prescriptions after consultation.</p>
            <button className="feature-btn" onClick={() => navigate('/signup')}>Manage Plan</button>
          </div>
        </div>
      </section>

      {/* Contact + Map */}
      <section id="contact" className="section contact-section">
        <div className="contact-left">
          <h2>Contact & Location</h2>
          <p>
            <strong>Address:</strong> {siteContent.contactAddress || "123 Health St., City"}<br />
            <strong>Phone:</strong> <a href={`tel:${siteContent.contactPhone || "+123456789"}`}>{siteContent.contactPhone || "+1 234 567 89"}</a><br />
            <strong>Email:</strong> <a href={`mailto:${siteContent.contactEmail || "info@mediportal.example"}`}>{siteContent.contactEmail || "info@mediportal.example"}</a>
          </p>
          <p className="small muted">Open: Mon–Sat, 8:00 — 20:00 (ER 24×7)</p>
        </div>

        <div className="contact-right">
          <div className="feature">
            <h3>Service Hours</h3>
            <p className="muted small">Outpatient Services: Mon-Sat, 08:00-20:00</p>
            <p className="muted small">Emergency Unit: 24/7</p>
            <p className="muted small">Telemedicine: Daily, 09:00-22:00</p>
          </div>
          <div className="feature feature-gap-top">
            <h3>Administrative Desk</h3>
            <p className="muted small">For billing, admissions, and referral support, contact the front office during business hours.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>MediPortal</h4>
            <p>{siteContent.footerAbout || "Your trusted healthcare companion - connecting patients with quality medical care."}</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#services">Services</a>
              <a href="#doctors">Doctors</a>
              <a href="#for-patients">For Patients</a>
              <a href="#emergency">Emergency</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Get Started</h4>
            <div className="footer-links">
              <a href="/signup">Sign Up</a>
              <a href="/login">Login</a>
              <a href="/signup">Professional Signup</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Emergency Contact</h4>
            <p><a href={`tel:${siteContent.emergencyContact || "+1234567890"}`} className="footer-emergency-link">{siteContent.emergencyContact || "+1 234 567 890"}</a></p>
            <p className="footer-emergency-note">Available 24/7</p>
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
