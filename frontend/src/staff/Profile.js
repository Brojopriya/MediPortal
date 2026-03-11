import React, { useState, useEffect } from "react";
import "../MedicalStaffDashboard.css";
import { fetchStaffProfile, updateStaffProfile } from "../api";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    department: "",
    role: "",
    employeeId: "",
    joiningDate: "",
    shift: "",
    qualification: "",
    experience: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStaffProfile()
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
        }
      })
      .catch((err) => console.log("Error fetching profile:", err));
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateStaffProfile(profile)
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
              <label>Employee ID</label>
              <input
                name="employeeId"
                value={profile.employeeId}
                onChange={handleChange}
                disabled={true}
                placeholder="Employee ID"
              />
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
              <label>Role</label>
              <select
                name="role"
                value={profile.role}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Role</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Administrator">Administrator</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={profile.department}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Department</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Radiology">Radiology</option>
                <option value="Administration">Administration</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shift</label>
              <select
                name="shift"
                value={profile.shift}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
                <option value="General">General (9 AM - 5 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Joining Date</label>
              <input
                name="joiningDate"
                type="date"
                value={profile.joiningDate}
                onChange={handleChange}
                disabled={!isEditing}
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
          </div>

          <div className="form-group full-width">
            <label>Qualifications</label>
            <textarea
              name="qualification"
              value={profile.qualification}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="List your qualifications and certifications"
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
