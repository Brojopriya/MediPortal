import React, { useState, useEffect } from "react";

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetch("/api/medicalstaff/me") // your backend endpoint
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = () => {
    fetch("/api/medicalstaff/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).then(() => alert("Profile updated!"));
  };

  return (
    <div>
      <h2>My Profile</h2>
      <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={profile.email} onChange={handleChange} placeholder="Email" />
      <input name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Profile;
