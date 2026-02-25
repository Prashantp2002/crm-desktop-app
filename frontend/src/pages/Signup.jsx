import { useState, useEffect } from "react";
import "./signup.css";
import logo from "../assets/logo.png"; // ensure logo exists in src/assets/

function Signup() {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    role: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [suggestion, setSuggestion] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Auto Username Suggestion
  useEffect(() => {
    if (!formData.role || !formData.fullname) {
      setSuggestion("");
      return;
    }

    const name = formData.fullname
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    let prefix = "";

    switch (formData.role) {
      case "admin":
        prefix = "admin_";
        break;
      case "sales":
        prefix = "sales_";
        break;
      case "agent":
        prefix = "agent_";
        break;
      default:
        prefix = "";
    }

    const suggested = prefix + name;

    setSuggestion("Suggested: " + suggested);

    setFormData((prev) => ({
      ...prev,
      username: suggested,
    }));
  }, [formData.role, formData.fullname]);

  // Validation
  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name required";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email required";
    }

    if (!formData.role) {
      newErrors.role = "Select account type";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Signup Data:", formData);
      // TODO: connect backend API here
    }
  };

  return (
    <div className="login-card">
      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="DigitalDose Logo" className="logo-img" />
        <div className="logo-text">
          <span className="digital">Digital</span>
          <span className="dose">Dose</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
          />
          {errors.fullname && <div className="error">{errors.fullname}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        {/* Account Type */}
        <div className="form-group">
          <label>Account Type</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="admin">Administration</option>
            <option value="sales">Staff</option>
            <option value="agent">Employee</option>
          </select>
          {errors.role && <div className="error">{errors.role}</div>}
        </div>

        {/* Username */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {suggestion && <small className="suggestion">{suggestion}</small>}
          {errors.username && <div className="error">{errors.username}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <button type="submit" className="login-btn">
          SUBMIT
        </button>
      </form>
    </div>
  );
}

export default Signup;