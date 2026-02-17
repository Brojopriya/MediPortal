import React, { useState, useEffect } from "react";
import "../PatientDashboard.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyContact: "",
    allergies: "",
    medicalHistory: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch patient profile from backend
    const token = localStorage.getItem("token");
    fetch("http://localhost:5001/api/patients/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
        }
      })
      .catch((err) => console.log("Error fetching profile:", err));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5001/api/patients/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Profile updated successfully!");
          setIsEditing(false);
        } else {
          alert("Failed to update profile");
        }
      })
      .catch((err) => console.log("Error updating profile:", err));
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button
          className="edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>
        </div>

        <div className="profile-section">
          <h3>Emergency & Medical Information</h3>
          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              name="emergencyContact"
              type="tel"
              value={profile.emergencyContact}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Emergency contact number"
            />
          </div>

          <div className="form-group full-width">
            <label>Allergies</label>
            <textarea
              name="allergies"
              value={profile.allergies}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="List any allergies (e.g., medications, food, etc.)"
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label>Medical History</label>
            <textarea
              name="medicalHistory"
              value={profile.medicalHistory}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Brief medical history (previous conditions, surgeries, etc.)"
              rows="4"
            />
          </div>
        </div>

        {isEditing && (
          <div className="profile-actions">
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
