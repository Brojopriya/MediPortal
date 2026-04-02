import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "./api";
import "./Auth.css";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const data = await adminLogin({
      name: formData.name.trim(),
      password: formData.password,
    });

    setSubmitting(false);

    if (!data?.success) {
      setError(data?.message || "Admin login failed");
      return;
    }

    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/AdminDashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          {error ? <p className="auth-error">{error}</p> : null}
          <label>Admin Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={submitting} />

          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <div className="auth-inline-row">
            <label className="auth-inline-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((s) => !s)}
                className="auth-inline-checkbox"
                disabled={submitting}
              />
              Show password
            </label>
          </div>

          <button type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Login as Admin"}</button>
        </form>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
