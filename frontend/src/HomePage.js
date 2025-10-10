
// src/HomePage.js
import React from "react";
import "./HomePage.css"; 
import { Link } from "react-router-dom";

const HomePage = ({ doctors = [], services = [] }) => {
  // fallback data if API didn't provide anything
  const fallbackDoctors = [
    { id: 1, name: "Dr. Aya", specialty: "Cardiology", email: "draya@example.com" },
    { id: 2, name: "Dr. John", specialty: "Neurology", email: "drjohn@example.com" },
    { id: 3, name: "Dr. Sara", specialty: "Pediatrics", email: "drsara@example.com" },
  ];

  const fallbackServices = [
    "General Surgery",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Radiology",
    "Emergency Care",
  ];

  const doctorsToShow = doctors.length ? doctors : fallbackDoctors;
  const servicesToShow = services.length ? services : fallbackServices;

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MediPortal Hospital</h1>
        <nav className="space-x-6">
          <a href="#home" className="hover:underline">Home</a>
          <a href="#services" className="hover:underline">Services</a>
          <a href="#doctors" className="hover:underline">Doctors</a>
          <a href="#about" className="hover:underline">About</a>
          <a href="#contact" className="hover:underline">Contact</a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="bg-blue-100 text-center p-16">
        <h2 className="text-4xl font-bold mb-4">Welcome to MediPortal</h2>
        <p className="text-lg max-w-2xl mx-auto">
          Your health is our priority. Providing excellent medical care with experienced doctors and advanced facilities.
        </p>
      </section>

      {/* About */}
      <section id="about" className="p-12 bg-white">
        <h3 className="text-3xl font-semibold mb-4">About Our Hospital</h3>
        <p className="max-w-3xl">
          MediPortal Hospital is a leading healthcare center committed to providing quality medical care.
          We offer modern facilities, advanced diagnostics, and specialized treatments. Our mission is to
          ensure the health and well-being of every patient who walks through our doors.
        </p>
      </section>

      {/* Services */}
      <section id="services" className="p-12 bg-gray-50">
        <h3 className="text-3xl font-semibold mb-6">Our Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {servicesToShow.map((service, idx) => (
            <div key={service.id ?? idx} className="bg-white p-6 shadow rounded text-center">
              <h4 className="font-bold">{service.name ?? service}</h4>
              {service.description && <p className="text-sm mt-2">{service.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="p-12 bg-white">
        <h3 className="text-3xl font-semibold mb-6">Our Doctors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {doctorsToShow.map((doc) => (
            <div key={doc.id} className="bg-gray-100 p-6 rounded shadow">
              <h4 className="font-bold text-xl">{doc.name}</h4>
              <p className="text-gray-700">{doc.specialty}</p>
              {doc.email && <p className="text-gray-500 text-sm">{doc.email}</p>}
              {doc.phone && <p className="text-gray-500 text-sm">Phone: {doc.phone}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Essentials: Opening hours & Emergency */}
      <section className="p-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">Essential Information</h3>
          <ul className="list-disc pl-6">
            <li>24/7 Emergency Department</li>
            <li>Ambulance Service: +123 456 7890</li>
            <li>Visiting Hours: 9:00 AM – 8:00 PM</li>
            <li>Insurance accepted: (list your accepted insurers)</li>
            <li>Online appointment booking available</li>
          </ul>
        </div>
      </section>

     {/* Footer */}
<footer id="contact" className="bg-blue-600 text-white p-10 mt-10">
  <div className="grid md:grid-cols-3 gap-6">
    <div>
      <h4 className="font-bold text-lg mb-2">Contact</h4>
      <p>123 Health Street, MediCity, Country</p>
      <p>Phone: +123 456 7890</p>
      <p>Email: info@mediportal.com</p>
    </div>
    <div>
      <h4 className="font-bold text-lg mb-2">Quick Links</h4>
      <ul>
        <li><a href="#home" className="hover:underline">Home</a></li>
        <li><a href="#services" className="hover:underline">Services</a></li>
        <li><a href="#doctors" className="hover:underline">Doctors</a></li>
        <li><a href="#about" className="hover:underline">About</a></li>
        <li>
          <a href="/SignUpPage" className="hover:underline">Sign In / Login</a>
        </li>
      </ul>
    </div>
    <div>
      <h4 className="font-bold text-lg mb-2">Follow Us</h4>
      <p>Facebook | Twitter | Instagram</p>
    </div>
  </div>
  <p className="text-center mt-6">&copy; 2025 MediPortal Hospital. All rights reserved.</p>
</footer>

    </div>
  );
};

export default HomePage;