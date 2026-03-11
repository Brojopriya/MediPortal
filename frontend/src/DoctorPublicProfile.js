import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchDoctorById } from "./api";
import "./HomePage.css";

const DoctorPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDoctor = async () => {
      const res = await fetchDoctorById(id);
      if (res?.success && res?.data) {
        setDoctor(res.data);
      } else {
        setDoctor(null);
      }
      setIsLoading(false);
    };

    loadDoctor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="home-container">
        <section className="section doctor-public-section">
          <h2>Loading doctor profile...</h2>
        </section>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="home-container">
        <section className="section doctor-public-section">
          <h2>Doctor not found</h2>
          <p className="muted">The selected doctor profile is unavailable.</p>
          <button className="primary" onClick={() => navigate("/")}>Back to Home</button>
        </section>
      </div>
    );
  }

  return (
    <div className="home-container">
      <section className="section doctor-public-section">
        <div className="doctor-public-header">
          <h2>Doctor Profile</h2>
          <Link to="/" className="muted">Back to Home</Link>
        </div>

        <article className="doctor-card doctor-public-card">
          {doctor.profileUrl ? (
            <img src={doctor.profileUrl} alt={doctor.name || "Doctor"} className="doctor-photo" />
          ) : (
            <div className="doctor-avatar-fallback">
              {(doctor.name || "Doctor")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <div className="doctor-info">
            <h4>{doctor.name || "Doctor"}</h4>
            <p className="muted">Specialty: {doctor.specialty || doctor.speciality || "General"}</p>
            <p className="muted">Department: {doctor.department || "-"}</p>
            <p className="muted">Schedule: {doctor.timeSchedule || doctor.availableTime || "-"}</p>
            <p className="muted">Qualification: {doctor.qualification || "-"}</p>
            <p className="muted">Experience: {doctor.experience || "-"}</p>
            <p className="muted">Consultation Fee: {doctor.consultationFee ? `INR ${doctor.consultationFee}` : "-"}</p>
            <p className="muted">Bio: {doctor.bio || "-"}</p>
          </div>
        </article>
      </section>
    </div>
  );
};

export default DoctorPublicProfile;
