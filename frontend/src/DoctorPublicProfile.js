import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookAppointment, fetchDoctorById } from "./api";
import "./HomePage.css";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ALIASES = {
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
  sun: 0,
  sunday: 0,
};

const parseAvailableDays = (daysText) => {
  if (!daysText) {
    return null;
  }

  const normalized = String(daysText)
    .toLowerCase()
    .replace(/\band\b/g, ",")
    .replace(/\bto\b/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || normalized === "daily" || normalized === "everyday" || normalized === "all days") {
    return new Set([0, 1, 2, 3, 4, 5, 6]);
  }

  const segments = normalized.split(",").map((item) => item.trim()).filter(Boolean);
  const result = new Set();

  for (const segment of segments) {
    if (segment.includes("-")) {
      const [leftRaw, rightRaw] = segment.split("-").map((part) => part.trim());
      const left = DAY_ALIASES[leftRaw];
      const right = DAY_ALIASES[rightRaw];
      if (left === undefined || right === undefined) {
        continue;
      }

      if (left <= right) {
        for (let i = left; i <= right; i += 1) {
          result.add(i);
        }
      } else {
        for (let i = left; i <= 6; i += 1) {
          result.add(i);
        }
        for (let i = 0; i <= right; i += 1) {
          result.add(i);
        }
      }
      continue;
    }

    const mapped = DAY_ALIASES[segment];
    if (mapped !== undefined) {
      result.add(mapped);
    }
  }

  return result.size ? result : null;
};

const parseTimeToMinutes = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = (match[3] || "").toLowerCase();

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    return null;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    if (meridiem === "pm" && hour !== 12) {
      hour += 12;
    }
    if (meridiem === "am" && hour === 12) {
      hour = 0;
    }
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return (hour * 60) + minute;
};

const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const parseScheduleRanges = (scheduleText) => {
  if (!scheduleText) {
    return [];
  }

  const normalized = String(scheduleText)
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks = normalized.split(/[;,]/).map((part) => part.trim()).filter(Boolean);
  const ranges = [];

  for (const chunk of chunks) {
    const tokens = chunk.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi) || [];
    if (tokens.length < 2) {
      continue;
    }
    const start = parseTimeToMinutes(tokens[0]);
    const end = parseTimeToMinutes(tokens[1]);
    if (start === null || end === null || start > end) {
      continue;
    }
    ranges.push({ start, end });
  }

  return ranges;
};

const buildNextAvailableDates = (allowedDays, maxCount = 14) => {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 45 && dates.length < maxCount; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    if (allowedDays && !allowedDays.has(day)) {
      continue;
    }
    const value = d.toISOString().slice(0, 10);
    const label = `${DAY_LABELS[day]} - ${d.toLocaleDateString()}`;
    dates.push({ value, label });
  }
  return dates;
};

const buildTimeSlots = (ranges, stepMinutes = 30) => {
  const slots = [];
  for (const range of ranges) {
    for (let t = range.start; t <= range.end; t += stepMinutes) {
      slots.push(formatMinutes(t));
    }
  }
  return [...new Set(slots)];
};

const DoctorPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ date: "", time: "", bookingType: "PHYSICAL" });
  const [isBooking, setIsBooking] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const canBook = Boolean(token) && String(user?.role || "").toUpperCase() === "PATIENT";

  const availableDaysText = String(doctor?.availableDays || "").trim();
  const availableTimeText = String(doctor?.availableTime || doctor?.timeSchedule || "").trim();
  const doctorName = doctor?.name || "Doctor";
  const doctorSpecialty = doctor?.specialty || doctor?.speciality || "General Medicine";
  const doctorDepartment = doctor?.department || "General";
  const doctorQualification = doctor?.qualification || "Available on request";
  const doctorExperience = doctor?.experience || "Available on request";
  const doctorConsultationFee = doctor?.consultationFee ? `BDT ${doctor.consultationFee}` : "On request";
  const doctorAvailableTime = availableTimeText || "Available on schedule";
  const doctorBio = doctor?.bio || "A dedicated specialist focused on patient-first care and thoughtful consultations.";

  const allowedDays = useMemo(() => {
    const parsed = parseAvailableDays(availableDaysText);
    return parsed || new Set([0, 1, 2, 3, 4, 5, 6]);
  }, [availableDaysText]);

  const dateOptions = useMemo(() => buildNextAvailableDates(allowedDays), [allowedDays]);

  const timeOptions = useMemo(() => {
    const ranges = parseScheduleRanges(availableTimeText);
    return buildTimeSlots(ranges);
  }, [availableTimeText]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: prev.date || (dateOptions[0]?.value || ""),
      time: prev.time || (timeOptions[0] || ""),
    }));
  }, [dateOptions, timeOptions]);

  useEffect(() => {
    const loadDoctor = async () => {
      const res = await fetchDoctorById(id);
      if (res?.success && res?.data) {
        setDoctor(res.data);
      } else {
        setDoctor(null);
      }
      setIsLoading(false);
    };

    loadDoctor();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setNotice({ type: "", text: "" });

    if (!token) {
      setNotice({ type: "error", text: "Please login as patient to book an appointment." });
      navigate("/login");
      return;
    }

    if (!canBook) {
      setNotice({ type: "error", text: "Only patient accounts can book appointments." });
      return;
    }

    if (form.bookingType === "ONLINE") {
      navigate("/PatientDashboard/teleconsultation");
      return;
    }

    if (!form.date || !form.time) {
      setNotice({ type: "error", text: "Please select date and time from doctor availability." });
      return;
    }

    setIsBooking(true);
    const result = await bookAppointment({
      D_ID: Number(id),
      date: form.date,
      time: form.time,
    });
    setIsBooking(false);

    if (!result?.success) {
      setNotice({ type: "error", text: result?.message || "Failed to book appointment" });
      return;
    }

    setForm((prev) => ({
      ...prev,
      date: dateOptions[0]?.value || "",
      time: timeOptions[0] || "",
      bookingType: "PHYSICAL",
    }));
    setNotice({ type: "success", text: "Appointment booked successfully." });
  };

  if (isLoading) {
    return (
      <div className="home-container">
        <section className="section doctor-public-section doctor-public-page-shell">
          <h2>Loading doctor profile...</h2>
          <p className="muted">Preparing a premium consultation view for you.</p>
        </section>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="home-container">
        <section className="section doctor-public-section doctor-public-page-shell">
          <h2>Doctor not found</h2>
          <p className="muted">The selected doctor profile is unavailable.</p>
          <button className="primary" onClick={() => navigate("/")}>Back to Home</button>
        </section>
      </div>
    );
  }

  return (
    <div className="home-container">
      <section className="section doctor-public-section doctor-public-page-shell">
        <div className="doctor-public-header">
          <div>
            <h2>Doctor Profile</h2>
          </div>
          <Link to="/" className="muted">Back to Home</Link>
        </div>

        <div className="doctor-public-hero">
          <article className="doctor-public-intro">
            <div className="doctor-public-badge-row">
              <span className="doctor-public-badge">Verified specialist</span>
              <span className="doctor-public-badge ghost">Private consultation</span>
            </div>

            <h3>{doctorName}</h3>
            <p className="doctor-public-specialty">{doctorSpecialty}</p>
            <p className="doctor-public-summary">
              {doctorBio}
            </p>

            <div className="doctor-public-chips">
              <span>Qualification: {doctorQualification}</span>
              <span>Experience: {doctorExperience}</span>
            </div>

            <div className="doctor-public-highlights">
              <div>
                <strong>{doctorDepartment}</strong>
                <span>Department</span>
              </div>
              <div>
                <strong>{doctorConsultationFee}</strong>
                <span>Visit fee</span>
              </div>
              <div>
                <strong className="doctor-public-working-days">{availableDaysText || "Daily"}</strong>
                <span>Working days</span>
              </div>
              <div>
                <strong>{doctorAvailableTime}</strong>
                <span>Available time</span>
              </div>
            </div>
          </article>

          <article className="doctor-public-portrait">
            {doctor.profileUrl ? (
              <img src={doctor.profileUrl} alt={doctorName} className="doctor-public-photo" />
            ) : (
              <div className="doctor-public-avatar-fallback">
                {doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            )}
            <div className="doctor-public-portrait-meta">
              <span>Specialty</span>
              <strong>{doctorSpecialty}</strong>
              <span>Qualification</span>
              <strong>{doctorQualification}</strong>
            </div>
          </article>
        </div>

        <div className="doctor-public-booking doctor-public-booking-panel">
          <div className="doctor-public-booking-header">
            <div>
              <h3>Book This Doctor</h3>
              <p className="muted">Choose a date and time to schedule your consultation from this page.</p>
            </div>
            <span className="doctor-public-booking-pill">Fast booking</span>
          </div>

          {notice.text ? (
            <div className={`doctor-public-notice ${notice.type === "error" ? "error" : "success"}`}>
              {notice.text}
            </div>
          ) : null}

          <form className="doctor-public-booking-form" onSubmit={handleBook}>
            <label>
              Booking Type
              <select
                value={form.bookingType}
                onChange={(e) => setForm((prev) => ({ ...prev, bookingType: e.target.value }))}
              >
                <option value="PHYSICAL">Physical</option>
                <option value="ONLINE">Online (Telemedicine)</option>
              </select>
            </label>

            <label>
              Date
              <select
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                disabled={!dateOptions.length || form.bookingType === "ONLINE"}
                required={form.bookingType !== "ONLINE"}
              >
                {!dateOptions.length ? <option value="">No available days configured</option> : null}
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              Time
              <select
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                disabled={!timeOptions.length || form.bookingType === "ONLINE"}
                required={form.bookingType !== "ONLINE"}
              >
                {!timeOptions.length ? <option value="">No available time configured</option> : null}
                {timeOptions.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>

            <button
              className="primary"
              type="submit"
              disabled={isBooking || (form.bookingType !== "ONLINE" && (!dateOptions.length || !timeOptions.length))}
            >
              {isBooking ? "Booking..." : form.bookingType === "ONLINE" ? "Go to Telemedicine" : "Book Appointment"}
            </button>
          </form>

          {form.bookingType !== "ONLINE" && (!dateOptions.length || !timeOptions.length) ? (
            <p className="muted small">Doctor availability is not configured correctly. Please contact admin.</p>
          ) : null}

          {!token ? (
            <p className="muted small">Login as a patient account to book from this page.</p>
          ) : null}
          {token && !canBook ? (
            <p className="muted small">You are logged in as {user?.role || "user"}. Only PATIENT can book.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default DoctorPublicProfile;
