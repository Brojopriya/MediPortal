import React, { useState, useEffect } from "react";
import "../Doctordashboard.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    specialty: "",
    department: "",
    qualification: "",
    experience: "",
    licenseNumber: "",
    consultationFee: "",
    availableDays: "",
    availableTime: "",
    bio: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch doctor profile from backend
    const token = localStorage.getItem("token");
    fetch("http://localhost:5001/api/doctors/me", {
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
    fetch("http://localhost:5001/api/doctors/profile", {
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
          <h3>Professional Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Specialty</label>
              <select
                name="specialty"
                value={profile.specialty}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Surgery">Surgery</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Department"
              />
            </div>

            <div className="form-group">
              <label>License Number</label>
              <input
                name="licenseNumber"
                value={profile.licenseNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Medical license number"
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                name="experience"
                type="number"
                value={profile.experience}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Years of experience"
              />
            </div>

            <div className="form-group">
              <label>Consultation Fee (₹)</label>
              <input
                name="consultationFee"
                type="number"
                value={profile.consultationFee}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Consultation fee"
              />
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <input
                name="availableDays"
                value={profile.availableDays}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., Mon, Wed, Fri"
              />
            </div>

            <div className="form-group">
              <label>Available Time</label>
              <input
                name="availableTime"
                value={profile.availableTime}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g., 9:00 AM - 5:00 PM"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Qualification</label>
            <textarea
              name="qualification"
              value={profile.qualification}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="List your qualifications and certifications"
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Brief professional bio"
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
