// src/SignupPage.js
import React, { useState } from "react";
import "./Auth.css";
import { signup } from "./api.js";
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
      });

      if (!response.success) {
        alert(response.message || "Signup failed");
        return;
      }

      if (formData.role === "DOCTOR" || formData.role === "STAFF") {
        alert("Your account is pending admin approval.");
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
            <option value="STAFF">Staff</option>
          </select>

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
      </div>
    </div>
  );
};

export default SignupPage;
