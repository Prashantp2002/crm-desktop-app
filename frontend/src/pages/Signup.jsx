import { useState, useEffect } from "react";
import "./signup.css";
import logo from "../assets/logo.png";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

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
  const [isUsernameAuto, setIsUsernameAuto] = useState(true);
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      setIsUsernameAuto(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto Username Suggestion
  useEffect(() => {
    if (!formData.role || !formData.fullname || !isUsernameAuto) {
      setSuggestion("");
      return;
    }

    const cleanName = formData.fullname
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    let prefix = "";

    // ✅ FIXED (lowercase match)
    switch (formData.role) {
      case "admin":
        prefix = "admin_";
        break;
      case "employee":
        prefix = "employee_";
        break;
      case "client":
        prefix = "client_";
        break;
      default:
        prefix = "";
    }

    const suggested = prefix + cleanName;

    setSuggestion("Suggested: " + suggested);

    setFormData((prev) => ({
      ...prev,
      username: suggested,
    }));
  }, [formData.role, formData.fullname, isUsernameAuto]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name required";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!formData.role) {
      newErrors.role = "Select account type";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username required";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        const response = await registerUser(formData);

        alert(response.data.message);

        // Reset form
        setFormData({
          fullname: "",
          phone: "",
          email: "",
          role: "",
          username: "",
          password: "",
        });

        navigate("/");

      } catch (error) {
        alert(error.response?.data?.error || "Signup failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-card">
      {/* Logo */}
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

        {/* Role */}
        <div className="form-group">
          <label>Account Type</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="admin">Administration</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
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

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Creating Account..." : "SUBMIT"}
        </button>
      </form>
    </div>
  );
}

export default Signup;