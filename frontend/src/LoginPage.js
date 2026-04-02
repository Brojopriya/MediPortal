// src/LoginPage.js
import React, { useState } from "react";
import "./Auth.css";
import { login } from "./api.js";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // normalize inputs before sending
    const payload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    console.log("LOGIN PAYLOAD:", payload);

    try {
      const data = await login(payload);

      console.log("LOGIN RESPONSE:", data);

      if (!data || !data.success) {
        alert(data?.message || "Invalid credentials or account not approved yet.");
      } else {
        alert("Login successful!");
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        window.dispatchEvent(new Event("auth-changed"));
        // redirect based on role
        const role = data.data.user?.role || 'PATIENT';
        if (role === 'DOCTOR') navigate('/DoctorDashboard');
        else if (role === 'STAFF') navigate('/MedicalStaffDashboard');
        else if (role === 'NURSE') navigate('/NurseDashboard');
        else if (role === 'PATIENT') navigate('/PatientDashboard');
        else navigate('/');
      }
    } catch (error) {
      console.error("Login exception:", error);
      alert("Login failed.");
    }
  };
  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="auth-inline-row">
            <label className="auth-inline-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((s) => !s)}
                className="auth-inline-checkbox"
              />
              Show password
            </label>
          </div>

          <button type="submit">Login</button>
        </form>

        <p>
          Forgot password? <a href="/forgot-password">Reset here</a>
        </p>
        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
        <p>
          Admin? <a href="/admin-login">Login here</a>
        </p>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
