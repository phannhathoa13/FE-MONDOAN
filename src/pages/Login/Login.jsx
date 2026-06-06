import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import heroImg from "../../assets/hero.png";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userLogedIn = localStorage.getItem('user')
  console.log(userLogedIn);

  const from = location.state?.from;
  const redirectTo = from
    ? `${from.pathname || ""}${from.search || ""}${from.hash || ""}`
    : "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Luu dong bo key token de interceptor va UI su dung chung.
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập");
    }
  };

  return (
    <div className="login-page">

      <section
        className="login-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(8, 12, 22, 0.55), rgba(8, 12, 22, 0.55)), url(${heroImg})`,
        }}
      >
        <div className="login-content">
          <h1 className="welcome-text">Welcome back</h1>
          <p className="sub-text">Log in to your account</p>

          <div className="login-card">
            <h2>Log In</h2>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-box">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-row">
                  <label>Password</label>
                  <button type="button" className="forgot-btn">
                    Forgot Password?
                  </button>
                </div>

                <div className="input-box">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn">
                Log In
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            {/* <button type="button" className="google-btn">
              <span className="google-icon">G</span>
              Continue with Google
            </button> */}

            <p className="signup-text">
              Don't have an account? <Link to="/create-account">Sign up</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;