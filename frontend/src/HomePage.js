import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
// App.js (or whichever file)
import mediLogo from "./medi.png";
import { fetchDoctors, fetchHospitalCatalog, fetchPublicFeedback, fetchPublicStats, fetchSiteContent } from "./api";

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
  const [diagnosticTests, setDiagnosticTests] = useState([]);
  const [publicFeedback, setPublicFeedback] = useState([]);
  const [hospitalDepartments, setHospitalDepartments] = useState([]);
  const [showAllTests, setShowAllTests] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    doctors: false,
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [siteContent, setSiteContent] = useState({
    heroTitle: "Smart Healthcare, Seamless Access",
    heroSubtitle:
      "Book trusted doctors, manage records, and consult online from one secure platform.",
    contactAddress: "123 Health St., City",
    contactPhone: "+1 234 567 89",
    contactEmail: "info@mediportal.example",
    footerAbout:
      "Modern healthcare operations for patients, doctors, and care teams.",
    emergencyContact: "+1 234 567 890",
    aboutHospital: "",
  });

  const unwrapPayload = (response) => {
    if (!response || typeof response !== "object") {
      return null;
    }

    if (response.success === false) {
      return null;
    }

    if (response.data !== undefined && response.data !== null) {
      return response.data;
    }

    return response;
  };

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsRes, doctorsRes, siteRes, catalogRes, feedbackRes] = await Promise.allSettled([
          fetchPublicStats(),
          fetchDoctors(),
          fetchSiteContent(),
          fetchHospitalCatalog(),
          fetchPublicFeedback(),
        ]);

        if (statsRes.status === "fulfilled") {
          const payload = unwrapPayload(statsRes.value) || {};
          setStats({
            doctors: toNumber(payload.doctors, 0),
            patients: toNumber(payload.patients, 0),
            appointments: toNumber(payload.appointments, 0),
            departments: toNumber(payload.departments, 0),
            facilities: toNumber(payload.facilities, 0),
            emergencyContact: payload.emergencyContact || "+1 234 567 890",
            aboutHospital: payload.aboutHospital || "",
          });
        }

        if (doctorsRes.status === "fulfilled") {
          const payload = unwrapPayload(doctorsRes.value);
          const doctorList = Array.isArray(payload)
            ? payload.map((doctor) => ({
                ...doctor,
                id: doctor?.id ?? doctor?.D_ID ?? doctor?.U_ID ?? null,
                specialty: doctor?.specialty || doctor?.speciality || "General",
              }))
            : [];
          setDoctors(doctorList);
        }

        if (siteRes.status === "fulfilled") {
          const payload = unwrapPayload(siteRes.value);
          if (payload && typeof payload === "object") {
            setSiteContent((prev) => ({ ...prev, ...payload }));
          }
        }

        if (catalogRes?.status === "fulfilled") {
          const payload = unwrapPayload(catalogRes.value) || {};
          const catalogDepartments = Array.isArray(payload.hospitals?.[0]?.departments)
            ? payload.hospitals[0].departments
                .map((department) => ({
                  id: department.id,
                  name: String(department.name || "").trim(),
                  wardCount: Number(department.wardCount) || 0,
                }))
                .filter((department) => department.name)
            : [];
          setHospitalDepartments(catalogDepartments);

          const tests = Array.isArray(payload.tests)
            ? payload.tests
                .map((test) => ({
                  id: test.id,
                  name: String(test.name || "").trim(),
                  price: Number(test.price) || 0,
                }))
                .filter((test) => test.name)
            : [];
          setDiagnosticTests(tests);
        }

        if (feedbackRes.status === "fulfilled") {
          const payload = unwrapPayload(feedbackRes.value);
          setPublicFeedback(Array.isArray(payload) ? payload : []);
        }
      } finally {
        setIsLoadingHome(false);
      }
    };

    loadHomeData();
  }, []);

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const syncCurrentUser = useMemo(() => {
    return () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        setCurrentUser(u);
      } catch (err) {
        setCurrentUser(null);
      }
    };
  }, []);

  useEffect(() => {
    syncCurrentUser();

    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'user' || event.key === null) {
        syncCurrentUser();
      }
    };

    const handleAuthChange = () => {
      syncCurrentUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [syncCurrentUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-changed'));
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

  const getDepartmentSymbol = (departmentName = "") => {
    const normalized = departmentName.toLowerCase();
    if (normalized.includes("cardio")) return "❤️";
    if (normalized.includes("neuro")) return "🧠";
    if (normalized.includes("ortho")) return "🦴";
    if (normalized.includes("pedia") || normalized.includes("child")) return "🧸";
    if (normalized.includes("gyne") || normalized.includes("obst")) return "🌸";
    if (normalized.includes("derma") || normalized.includes("skin")) return "✨";
    if (normalized.includes("emergency") || normalized.includes("er")) return "🚑";
    if (normalized.includes("radio")) return "🩻";
    if (normalized.includes("lab") || normalized.includes("path")) return "🔬";
    if (normalized.includes("eye") || normalized.includes("ophthal")) return "👁️";
    if (normalized.includes("ent") || normalized.includes("ear") || normalized.includes("nose") || normalized.includes("throat")) return "👂";
    if (normalized.includes("oncolog")) return "🎗️";
    return "🏥";
  };

  const hasDoctorAvailability = (doctor) => {
    const schedule = String(
      doctor?.timeSchedule || doctor?.availableTime || doctor?.availability || ""
    ).trim();

    return Boolean(schedule);
  };

  const departmentGroups = useMemo(() => {
    const catalogDepartments = hospitalDepartments.length
      ? hospitalDepartments
      : Array.from(
          new Set(
            doctors
              .map((doctor) => String(doctor?.department || doctor?.deptName || "").trim())
              .filter(Boolean)
          )
        ).map((name, index) => ({ id: index + 1, name, wardCount: 0 }));

    return catalogDepartments.map((department) => {
      const departmentName = String(department?.name || "General Medicine").trim() || "General Medicine";
      const departmentDoctors = doctors.filter((doctor) => {
        const doctorDepartment = String(doctor?.department || doctor?.deptName || "").trim().toLowerCase();
        return doctorDepartment === departmentName.toLowerCase();
      });

      return [departmentName, departmentDoctors, department];
    });
  }, [doctors, hospitalDepartments]);

  const selectedDepartmentDoctors = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    const selectedGroup = departmentGroups.find(([departmentName]) => departmentName === selectedDepartment);
    return selectedGroup ? selectedGroup[1] : [];
  }, [departmentGroups, selectedDepartment]);

  const selectedDepartmentAvailableDoctors = useMemo(
    () => selectedDepartmentDoctors.filter(hasDoctorAvailability),
    [selectedDepartmentDoctors]
  );

  useEffect(() => {
    if (!departmentGroups.length) {
      return;
    }

    const hasSelection = departmentGroups.some(([departmentName]) => departmentName === selectedDepartment);
    if (!hasSelection) {
      setSelectedDepartment(departmentGroups[0][0]);
    }
  }, [departmentGroups, selectedDepartment]);

  const carePathway = [
    {
      title: "1. Discover The Right Doctor",
      description: "Search verified specialists and compare availability before booking.",
    },
    {
      title: "2. Book And Confirm",
      description: "Schedule in-person or virtual appointments with secure confirmation.",
    },
    {
      title: "3. Receive Connected Care",
      description: "Doctors, nurses, and staff collaborate in one shared operational flow.",
    },
    {
      title: "4. Continue Follow-up",
      description: "Track reports, prescriptions, and next steps from your dashboard.",
    },
  ];

  const defaultTestimonials = [
    {
      name: "Shadman Rahman",
      role: "Patient Family Member",
      quote:
        "From emergency admission to specialist follow-up, every update was clear and timely. It felt like one synchronized team.",
    },
    {
      name: "Nusrat Jahan",
      role: "Telemedicine Patient",
      quote:
        "I booked online, shared reports, and consulted a doctor in minutes. The process was smooth and genuinely reassuring.",
    },
    {
      name: "Mahfuz Karim",
      role: "Long-term Cardiac Care",
      quote:
        "The dashboard made medication and appointments easy to track. I finally feel in control of my treatment timeline.",
    },
  ];

  const testimonials = publicFeedback.length
    ? publicFeedback
        .filter((item) => Number(item?.rating) >= 4)
        .slice(0, 6)
        .map((item) => {
          const categoryLabel = String(item?.category || "GENERAL")
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
          const quote = String(item?.message || "")
            .replace(/\s+/g, " ")
            .trim();

          return {
            name: item?.User?.name || "Patient",
            role: `${categoryLabel} Feedback`,
            quote,
            rating: Number(item?.rating) || 5,
            dateLabel: item?.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "",
          };
        })
        .filter((item) => item.quote.length >= 18)
    : defaultTestimonials.map((item) => ({ ...item, rating: 5 }));

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    if (!revealNodes.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const formatBdt = (value) => `BDT ${Number(value || 0).toFixed(2)}`;
  const visibleTestLimit = 4;
  const visibleDiagnosticTests = showAllTests
    ? diagnosticTests
    : diagnosticTests.slice(0, visibleTestLimit);

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const trustFeatures = [
    {
      title: "Verified Care Teams ✅",
      description: "All doctor, nurse, and staff accounts are verified.",
    },
    {
      title: "Secure Access 🔒",
      description: "Role-based security keeps patient data protected.",
    },
    {
      title: "Operational Visibility 📊",
      description: "Appointments and records are tracked in one dashboard.",
    },
    {
      title: "Continuous Availability 🚑",
      description: "Emergency and telemedicine support runs continuously.",
    },
  ];

  const hospitalOverviewCards = [
    { title: "Clinical Governance", description: "Standardized care protocols and accountable workflows." },
    { title: "Interdisciplinary Teams", description: "Doctors, nurses, and staff collaborate across departments." },
    { title: "24/7 Critical Response", description: "Emergency and urgent care support when every minute matters." },
    { title: "Secure Health Records", description: "Role-based access with controlled visibility for patient privacy." },
  ];

  const serviceCards = [
    {
      title: "Appointment Scheduling",
      description: "Schedule in-person or virtual consultations quickly.",
    },
    {
      title: "Telemedicine Services",
      description: "Secure online consultations with proper follow-up.",
    },
    {
      title: "Electronic Health Records",
      description: "Centralized records with controlled access.",
    },
    {
      title: "Care Coordination",
      description: "Coordinate referrals, follow-ups, and medication plans.",
    },
  ];

  const patientTools = [
    {
      icon: "📅 Booking",
      iconLabel: "Appointment booking",
      title: "Book Appointments",
      description: "Find specialists and confirm appointments fast.",
      cta: "Schedule Now",
      action: handleBookAppointment,
    },
    {
      icon: "📁 Records",
      iconLabel: "Medical records",
      title: "Medical Records",
      description: "Access diagnosis, reports, and prescriptions in one place.",
      cta: "Access Records",
      action: () => navigate('/signup'),
    },
    {
      icon: "💻 Virtual",
      iconLabel: "Teleconsultation",
      title: "Teleconsultation",
      description: "Consult online with doctors when in-person visits are difficult.",
      cta: "Start Session",
      action: () => navigate('/signup'),
    },
    {
      icon: "💊 Pharmacy",
      iconLabel: "Prescriptions",
      title: "Prescriptions",
      description: "Track medications and manage digital prescriptions easily.",
      cta: "Manage Plan",
      action: () => navigate('/signup'),
    },
  ];

  const visibleTrustFeatures = trustFeatures;
  const visibleOverviewCards = hospitalOverviewCards;
  const visibleServiceCards = serviceCards;
  const visibleDoctors = expandedSections.doctors ? doctors : doctors.slice(0, 4);
  const visibleTestimonials = testimonials;
  const visiblePatientTools = patientTools;

  const heroQuickStats = [
    {
      label: "Verified Doctors",
      value: doctorCountForDisplay,
      note: "Active on platform",
    },
    {
      label: "Departments",
      value: stats.departments || departmentGroups.length,
      note: "Clinical units connected",
    },
    {
      label: "Appointments",
      value: stats.appointments || 0,
      note: "Coordinated through MediPortal",
    },
    {
      label: "Emergency Support",
      value: "24/7",
      note: siteContent.emergencyContact || stats.emergencyContact || "Emergency line available",
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
                  Hi, {String(currentUser.name || "User").split(' ')[0]}
                </span>
                <button className="secondary dashboard-btn" onClick={handleDashboard}>Dashboard</button>
                <button className="secondary logout-btn" onClick={handleLogout}>Logout</button>
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
          <div className="hero-badge-row">
            <span className="hero-badge">Integrated Healthcare Platform</span>
            <span className="hero-badge hero-badge-accent">Secure Care Coordination</span>
          </div>
          <h1>{siteContent.heroTitle || "Smart Healthcare, Seamless Access"}</h1>
          <p>
            {siteContent.heroSubtitle ||
              "Book trusted doctors, manage records, and consult online from one secure platform."}
          </p>

          <div className="hero-quick-grid" aria-label="Live platform overview">
            {heroQuickStats.map((item) => (
              <article className="hero-quick-card" key={item.label}>
                <p className="hero-quick-label">{item.label}</p>
                <h4>{item.value}</h4>
                <p className="hero-quick-note">{item.note}</p>
              </article>
            ))}
          </div>

          <div className="hero-departments">
            <div className="hero-departments-head">
              <div>
                <p className="hero-departments-kicker">Departments in MediPortal</p>
                <h3>Available Departments</h3>
              </div>
              <span className="hero-department-total">{departmentGroups.length} departments</span>
            </div>

            {departmentGroups.length === 0 ? (
              <p className="muted">Doctor departments will appear here once available.</p>
            ) : (
              <>
                <div className="hero-department-tabs">
                  {departmentGroups.map(([departmentName, departmentDoctors, departmentMeta]) => (
                    <button
                      key={departmentName}
                      type="button"
                      className={`hero-department-tab ${selectedDepartment === departmentName ? "active" : ""}`}
                      onClick={() => setSelectedDepartment(departmentName)}
                    >
                      <span className="hero-department-icon" aria-hidden="true">
                        {getDepartmentSymbol(departmentName)}
                      </span>
                      <span className="hero-department-tab-label">{departmentName}</span>
                      <strong>{departmentDoctors.filter(hasDoctorAvailability).length}</strong>
                    </button>
                  ))}
                </div>

                {selectedDepartment ? (
                  <div className="hero-department-panel">
                    <div className="hero-department-panel-head">
                      <div>
                        <h4>{selectedDepartment}</h4>
                        <p>{selectedDepartmentAvailableDoctors.length} available doctors</p>
                      </div>
                    </div>

                    <div className="hero-doctor-grid">
                      {selectedDepartmentAvailableDoctors.length === 0 ? (
                        <div className="hero-empty-doctors">
                          <p>No doctor is assigned to this department yet.</p>
                        </div>
                      ) : (
                        selectedDepartmentAvailableDoctors.map((doctor, index) => {
                          const doctorId = doctor?.id ?? doctor?.D_ID ?? doctor?.U_ID ?? null;
                          const doctorLabel = doctor?.name || (doctorId ? `Doctor #${doctorId}` : "Doctor");
                          return (
                            <article className="hero-doctor-card" key={`${selectedDepartment}-${doctorLabel}-${index}`}>
                              <div className="hero-doctor-avatar">
                                {doctor.profileUrl ? (
                                  <img src={doctor.profileUrl} alt={doctorLabel} />
                                ) : (
                                  <span>{doctorLabel.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                                )}
                              </div>
                              <div className="hero-doctor-body">
                                <h5>{doctorLabel}</h5>
                                <p>{doctor.specialty || doctor.speciality || selectedDepartment}</p>
                                <div className="hero-doctor-actions">
                                  <button type="button" className="ghost" onClick={() => doctorId && navigate(`/doctors/${doctorId}`)} disabled={!doctorId}>
                                    View Profile
                                  </button>
                                  <button type="button" className="primary" onClick={handleBookAppointment}>
                                    Book
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick Emergency strip */}
      <section id="emergency" className="emergency-strip reveal-on-scroll">
        <div>
          <strong>Emergency Line:</strong> Call <a href={`tel:${siteContent.emergencyContact || stats.emergencyContact || "+1234567890"}`}>{siteContent.emergencyContact || stats.emergencyContact}</a> for immediate support.
        </div>
        <div>
          <button className="emergency-btn" onClick={() => alert(`Emergency support is available 24/7. Call ${siteContent.emergencyContact || stats.emergencyContact || "+1 234 567 890"}.`)}>
            🚨 Call Emergency Support
          </button>
        </div>
      </section>

      <section className="section pathway-section reveal-on-scroll">
        <h2>Care Journey With MediPortal</h2>
        <p className="section-intro">A clear, connected process from discovery to follow-up care.</p>
        <div className="pathway-grid">
          {carePathway.map((step) => (
            <article key={step.title} className="pathway-card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section services reveal-on-scroll">
        <h2>Why Patients Trust MediPortal</h2>
        <p className="section-intro">Trusted care, secure access, and connected workflows.</p>
        <div className="services-grid">
          {visibleTrustFeatures.map((feature) => (
            <div className="feature" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section test-catalog-section reveal-on-scroll">
        <div className="test-catalog-head">
          <h2>Diagnostic Tests & Pricing</h2>
          <p className="section-intro">Updated from the hospital catalog.</p>
        </div>

        {isLoadingHome ? (
          <p className="muted">Loading test catalog...</p>
        ) : diagnosticTests.length === 0 ? (
          <p className="muted">No diagnostic tests are available yet.</p>
        ) : (
          <>
            <div className="test-catalog-grid">
            {visibleDiagnosticTests.map((test) => (
              <article key={test.id} className="test-catalog-card">
                <h3>{test.name}</h3>
                <p className="test-price">{formatBdt(test.price)}</p>
              </article>
            ))}
            </div>
            {diagnosticTests.length > visibleTestLimit ? (
              <div className="test-catalog-actions">
                <button
                  type="button"
                  className="test-catalog-toggle"
                  onClick={() => setShowAllTests((prev) => !prev)}
                >
                  {showAllTests ? "See Less" : `See More (${diagnosticTests.length - visibleTestLimit} more)`}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="section services reveal-on-scroll">
        <h2>Hospital Overview</h2>
        <p className="muted">{siteContent.aboutHospital || stats.aboutHospital || "Comprehensive services across outpatient, emergency, and digital care."}</p>
        <div className="services-grid">
          {visibleOverviewCards.map((item) => (
            <div className="feature" key={`${item.title}-${item.description}`}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section services reveal-on-scroll">
        <h2>Our Services</h2>
        <p className="section-intro">Core healthcare services in one connected platform.</p>
        <div className="services-grid">
          {visibleServiceCards.map((item) => (
            <div className="feature" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctors & Locations */}
      <section id="doctors" className="section doctors-section reveal-on-scroll">
        <h2>Our Doctors</h2>
        <p className="section-intro">Browse verified doctors and book in minutes.</p>
        <div className="doctors-grid">
          {visibleDoctors.map((d, index) => {
            const doctorId = d.id ?? d.D_ID ?? d.U_ID ?? null;
            const availability =
              index % 3 === 0
                ? { label: "Available Today", className: "available" }
                : index % 3 === 1
                ? { label: "Next Slot in 2h", className: "limited" }
                : { label: "On Evening Shift", className: "shift" };
            const responseMinutes = 5 + (index % 4) * 3;
            const satisfactionRate = 98 - (index % 5);

            return (
            <article className="doctor-card" key={doctorId || `${d.name || "doctor"}-${index}`}>
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
                <h4>{d.name || (doctorId ? `Doctor #${doctorId}` : "Doctor")}</h4>
                <p className="muted">{d.specialty || d.speciality || "General"}</p>
                <p className={`doctor-availability ${availability.className}`}>{availability.label}</p>
                <div className="doctor-metrics" aria-label="Doctor service metrics">
                  <span>Avg response: {responseMinutes} min</span>
                  <span>Patient satisfaction: {satisfactionRate}%</span>
                </div>
                <p className="muted small">Location: {d.location || "Main Hospital"}</p>
                <div className="doctor-actions">
                  <button onClick={() => doctorId && navigate(`/doctors/${doctorId}`)} disabled={!doctorId}>Profile</button>
                  <button className="primary" onClick={handleBookAppointment}>Book</button>
                </div>
              </div>
            </article>
          )})}
        </div>
        {doctors.length > 4 ? (
          <div className="section-actions">
            <button type="button" className="section-toggle" onClick={() => toggleSection("doctors")}>
              {expandedSections.doctors ? "See Less" : `See More (${doctors.length - 4} more)`}
            </button>
          </div>
        ) : null}
      </section>

      <section className="section testimonials-section reveal-on-scroll">
        <h2>Patient Voices, Real Outcomes</h2>
        <p className="section-intro">Real feedback from patients and families.</p>
        <div className="testimonials-grid">
          {visibleTestimonials.map((item) => (
            <article key={`${item.name}-${item.quote.slice(0, 20)}`} className="testimonial-card">
              <div className="testimonial-head">
                <p className="testimonial-rating" aria-label={`${item.rating || 5} star rating`}>
                  {"★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}
                </p>
                {item.dateLabel ? <span className="testimonial-date">{item.dateLabel}</span> : null}
              </div>
              <p className="testimonial-quote-mark" aria-hidden="true">“</p>
              <p className="testimonial-quote">"{item.quote}"</p>
              <div className="testimonial-meta">
                <p className="testimonial-name">{item.name}</p>
                <p className="testimonial-role">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* For Patients Section */}
      <section id="for-patients" className="section user-section reveal-on-scroll">
        <h2>For Patients</h2>
        <p className="section-intro">Simple, secure tools from booking to follow-up.</p>
        <div className="user-features-grid">
          {visiblePatientTools.map((item) => (
            <div className="user-feature" key={item.title}>
              <div className="feature-icon" role="img" aria-label={item.iconLabel}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button className="feature-btn" onClick={item.action}>{item.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact + Map */}
      <section id="contact" className="section contact-section reveal-on-scroll">
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
            <p className="muted small">For billing, admissions, and referrals, contact the front office.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>MediPortal</h4>
            <p>{siteContent.footerAbout || "Modern healthcare operations for patients, doctors, and care teams."}</p>
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
