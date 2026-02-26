import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../assets/logo.png";
import { loginUser } from "../api/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
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
      try {
        setLoading(true);

        const response = await loginUser({
          username: formData.username, // can be email also
          password: formData.password,
        });

        const { token, role, username } = response.data;

        // Validate role
        if (role !== formData.role) {
          alert("Selected role does not match your account role.");
          setLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);

        alert("Login successful!");

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "employee") {
          navigate("/employee-dashboard");
        } else if (role === "client") {
          navigate("/client-dashboard");
        }

      } catch (error) {
        alert(error.response?.data?.error || "Login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="DigitalDose Logo" />
        <div className="logo-text">
          <span className="digital">Digital</span>
          <span className="dose">Dose</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Role */}
        <div className="form-group">
          <label>Account Type</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Account Type</option>
            <option value="admin">Administration</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
          </select>
          {errors.role && <div className="error">{errors.role}</div>}
        </div>

        {/* Username or Email */}
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

        <div className="actions">
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          <Link to="/forgot-password" className="forgot">
            Forgot Password?
          </Link>
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