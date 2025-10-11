// dashboard/Profile.js
import React, { useState, useEffect } from "react";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    bio: "",
  });

  useEffect(() => {
    // Fetch doctor profile from backend
    fetch("/api/doctor/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => console.log("Error fetching profile"));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    fetch("/api/doctor/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then((data) => alert("Profile updated!"))
      .catch((err) => console.log(err));
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <label>Name</label>
      <input name="name" value={profile.name} onChange={handleChange} />
      <label>Email</label>
      <input name="email" value={profile.email} onChange={handleChange} />
      <label>Phone</label>
      <input name="phone" value={profile.phone} onChange={handleChange} />
      <label>Specialty</label>
      <input name="specialty" value={profile.specialty} onChange={handleChange} />
      <label>Bio</label>
      <textarea name="bio" value={profile.bio} onChange={handleChange}></textarea>
      <button className="primary" onClick={handleSave}>Save</button>
    </div>
  );
};

export default Profile;
