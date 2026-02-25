import { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import logo from "../assets/logo.png"; // place logo.png inside src/assets/

function Login() {
  const [formData, setFormData] = useState({
    role: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!formData.role) {
      newErrors.role = "Please select account type";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username or Email required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form Submitted:", formData);
      // TODO: connect backend login API here
    }
  };

  return (
    <div className="login-wrapper">
      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="DigitalDose Logo" />
        <div className="logo-text">
          <span className="digital">Digital</span>
          <span className="dose">Dose</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Account Type */}
        <div className="form-group">
          <label>Account Type</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Account Type</option>
            <option value="admin">Administration</option>
            <option value="staff">Staff</option>
            <option value="employee">Employee</option>
          </select>
          {errors.role && <div className="error">{errors.role}</div>}
        </div>

        {/* Username */}
        <div className="form-group">
          <label>Username or Email</label>
          <input
            type="text"
            name="username"
            className="input-gray"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input-gray"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        {/* Actions */}
        <div className="actions">
          <button type="submit" className="btn-login">
            LOGIN
          </button>
          <a className="forgot" href="#">
            Forgot Password?
          </a>
        </div>

        <div className="signup-link">
          <span>Don't have an account?</span>
          <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;