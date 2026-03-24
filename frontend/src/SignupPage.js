// src/SignupPage.js
import React, { useEffect, useMemo, useState } from "react";
import "./Auth.css";
import { fetchHospitalCatalog, signup } from "./api.js";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "PATIENT",
    password: "",
    confirmPassword: "",
    hospitalId: "",
    department: "",
    timeSchedule: "",
    speciality: "",
    post: "",
    sector: "",
    deptId: "",
    wardId: "",
    emergencySectorId: "",
    profileUrl: "",
  });
  const [hospitalCatalog, setHospitalCatalog] = useState([]);

  const departmentOptions = useMemo(() => {
    const selected = hospitalCatalog[0];
    return Array.isArray(selected?.departments) ? selected.departments : [];
  }, [hospitalCatalog]);

  useEffect(() => {
    fetchHospitalCatalog()
      .then((response) => {
        if (response?.success) {
          const hospitals = Array.isArray(response?.data?.hospitals) ? response.data.hospitals : [];
          setHospitalCatalog(hospitals);
          if (hospitals[0]) {
            setFormData((prev) => ({ ...prev, hospitalId: String(hospitals[0].id) }));
          }
        }
      })
      .catch((error) => {
        console.log("Error fetching hospital catalog:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deptId") {
      const selectedDepartment = departmentOptions.find((department) => String(department.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        deptId: value,
        department: selectedDepartment?.name || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1024;
        let { width, height } = image;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          alert("Could not process image. Please try another file.");
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        // Convert to compressed JPEG data URL to avoid oversized request bodies.
        const compressed = canvas.toDataURL("image/jpeg", 0.72);
        if (compressed.length > 3_000_000) {
          alert("Image is still too large after compression. Please upload a smaller image.");
          return;
        }

        setFormData((prev) => ({ ...prev, profileUrl: compressed }));
      };

      image.onerror = () => {
        alert("Could not read the selected image.");
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number (10-15 digits).");
      return;
    }

    const isProfessional = ["DOCTOR", "NURSE", "STAFF"].includes(formData.role);
    if (isProfessional && !formData.profileUrl.trim()) {
      alert("Profile photo is required for doctor, nurse, and staff signup.");
      return;
    }

    if (isProfessional) {
      if (!formData.hospitalId || !formData.department.trim() || !formData.timeSchedule.trim()) {
        alert("Hospital, department, and time schedule are required for professional signup.");
        return;
      }

      if (formData.role === "DOCTOR" && !formData.speciality.trim()) {
        alert("Speciality is required for doctor signup.");
        return;
      }

      if (formData.role === "NURSE" && !formData.post.trim()) {
        alert("Post is required for nurse signup.");
        return;
      }

      if (formData.role === "STAFF" && !formData.sector.trim()) {
        alert("Sector is required for staff signup.");
        return;
      }
    }

    const professionalDetails = isProfessional
      ? {
          department: formData.department,
          timeSchedule: formData.timeSchedule,
          speciality: formData.speciality || undefined,
          post: formData.post || undefined,
          sector: formData.sector || undefined,
          deptId: formData.deptId || undefined,
          wardId: formData.wardId || undefined,
          emergencySectorId: formData.emergencySectorId || undefined,
        }
      : null;

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
        profileUrl: formData.profileUrl || undefined,
        professionalDetails,
      });

      if (!response.success) {
        alert(response.message || "Signup failed");
        return;
      }

      if (formData.role === "DOCTOR" || formData.role === "STAFF" || formData.role === "NURSE") {
        alert("Signup successful. Your professional account is pending admin approval.");
        navigate("/login");
      } else {
        alert("Signup successful! You can now login.");
        navigate("/login"); // redirect to login page
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="STAFF">Staff</option>
          </select>

          <label>
            Profile Photo {["DOCTOR", "NURSE", "STAFF"].includes(formData.role)
              ? "(required for doctor, nurse, staff)"
              : "(optional for patient)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            required={["DOCTOR", "NURSE", "STAFF"].includes(formData.role) && !formData.profileUrl}
          />
          {formData.profileUrl && (
            <img
              src={formData.profileUrl}
              alt="Profile preview"
              className="auth-photo-preview"
            />
          )}

          {(formData.role === "DOCTOR" || formData.role === "NURSE" || formData.role === "STAFF") && (
            <>
              <label>Hospital</label>
              <input type="text" value={hospitalCatalog[0]?.name || "MediPortal"} disabled />

              <label>Department</label>
              <select
                name="deptId"
                value={formData.deptId}
                onChange={handleChange}
                required
                disabled={!departmentOptions.length}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>

              <label>Time Schedule</label>
              <input
                type="text"
                name="timeSchedule"
                value={formData.timeSchedule}
                onChange={handleChange}
                placeholder="e.g. Mon-Fri 08:00-16:00"
                required
              />

              {formData.role === "DOCTOR" && (
                <>
                  <label>Speciality</label>
                  <input
                    type="text"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    required
                  />
                </>
              )}

              {formData.role === "NURSE" && (
                <>
                  <label>Post</label>
                  <input
                    type="text"
                    name="post"
                    value={formData.post}
                    onChange={handleChange}
                    placeholder="e.g. Senior Nurse"
                    required
                  />

                  <label>Ward ID (optional)</label>
                  <input
                    type="number"
                    name="wardId"
                    value={formData.wardId}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                  />
                </>
              )}

              {formData.role === "STAFF" && (
                <>
                  <label>Sector</label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="e.g. Laboratory, Admissions"
                    required
                  />

                  <label>Emergency Sector ID (optional)</label>
                  <input
                    type="number"
                    name="emergencySectorId"
                    value={formData.emergencySectorId}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                  />
                </>
              )}
            </>
          )}

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
