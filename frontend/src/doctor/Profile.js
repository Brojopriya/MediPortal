import React, { useState, useEffect } from "react";
import "../Doctordashboard.css";
import { fetchDoctorProfile, fetchHospitalCatalog, updateDoctorProfile } from "../api";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    specialty: "",
    hospitalId: "",
    hospitalName: "",
    deptId: "",
    department: "",
    qualification: "",
    experience: "",
    licenseNumber: "",
    consultationFee: "",
    availableDays: "",
    availableTime: "",
    bio: "",
    profileUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hospitalCatalog, setHospitalCatalog] = useState([]);

  const departmentOptions = hospitalCatalog[0]?.departments || [];

  useEffect(() => {
    Promise.all([fetchDoctorProfile(), fetchHospitalCatalog()])
      .then(([profileResponse, catalogResponse]) => {
        if (profileResponse?.success && profileResponse?.data) {
          setProfile((prev) => ({
            ...prev,
            ...profileResponse.data,
            specialty: profileResponse.data.specialty || profileResponse.data.speciality || prev.specialty,
            hospitalName: profileResponse.data.hospitalName || "MediPortal",
            deptId: profileResponse.data.deptId || prev.deptId,
          }));
        }

        if (catalogResponse?.success) {
          const hospitals = Array.isArray(catalogResponse?.data?.hospitals) ? catalogResponse.data.hospitals : [];
          setHospitalCatalog(hospitals);
          if (hospitals[0]) {
            setProfile((prev) => ({
              ...prev,
              hospitalId: prev.hospitalId || hospitals[0].id,
              hospitalName: hospitals[0].name || "MediPortal",
            }));
          }
        }
      })
      .catch((err) => console.log("Error fetching profile:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deptId") {
      const selectedDepartment = departmentOptions.find((item) => String(item.id) === String(value));
      setProfile((prev) => ({
        ...prev,
        deptId: value,
        department: selectedDepartment?.name || "",
      }));
      return;
    }

    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, profileUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!String(profile.profileUrl || "").trim()) {
      alert("Doctor profile photo URL is required.");
      return;
    }

    const data = await updateDoctorProfile(profile);
    if (data?.success) {
      alert("Profile updated successfully!");
      setIsEditing(false);
    } else {
      alert(data?.message || "Failed to update profile. Please check required fields and try again.");
    }
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

          <div className="form-group full-width">
            <label>Profile Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group full-width">
            <label>Photo Source (auto-filled)</label>
            <input
              name="profileUrl"
              type="text"
              value={profile.profileUrl}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Upload an image to fill this field"
            />
          </div>

          {profile.profileUrl && (
            <div className="form-group full-width">
              <label>Profile Photo Preview</label>
              <img
                src={profile.profileUrl}
                alt="Doctor profile"
                className="doctor-profile-preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
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
              <label>Hospital</label>
              <input value={profile.hospitalName || "MediPortal"} disabled />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="deptId"
                value={profile.deptId}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
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
              <label>Consultation Fee (৳)</label>
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
