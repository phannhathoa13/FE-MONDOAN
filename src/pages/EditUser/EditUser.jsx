import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getMyProfile, updateMyProfile } from "../../services/authService";
import "./EditUser.css";

const sidebarItems = [
  { name: "Account Details", negative: "/edit-user" },
  { name: "My Orders", negative: "/status-order" },
  { name: "Favorite Item", negative: "" },
  { name: "Payment Methods", negative: "" },
];

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    agree: true,
  });

  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const fallbackName =
        storedUser.user_name ||
        storedUser.fullName ||
        storedUser.username ||
        storedUser.name ||
        "";

      setFormData((prev) => ({
        ...prev,
        fullName: fallbackName,
        email: storedUser.email || "",
        phone: storedUser.phone || "",
      }));

      setAvatar(
        storedUser.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fallbackName || "User"
        )}&background=ececec&color=555&size=128`
      );

      try {
        const profile = await getMyProfile();

        setFormData((prev) => ({
          ...prev,
          fullName:
            profile.user_name ||
            profile.fullName ||
            profile.username ||
            profile.name ||
            "",
          email: profile.email || "",
          phone: profile.phone || "",
        }));

        setAvatar(
          profile.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.user_name || profile.fullName || profile.username || "User"
          )}&background=ececec&color=555&size=128`
        );

        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setMessage("");
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Vui lòng nhập họ tên.";
    }

    if (!formData.email.trim()) {
      return "Vui lòng nhập email.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Email không đúng định dạng.";
    }

    if (!formData.phone.trim()) {
      return "Vui lòng nhập số điện thoại.";
    }

    const hasPasswordChange =
      formData.newPassword.trim() || formData.confirmPassword.trim();

    if (hasPasswordChange) {
      if (!formData.currentPassword) {
        return "Vui lòng nhập mật khẩu hiện tại.";
      }

      if (!formData.newPassword) {
        return "Vui lòng nhập mật khẩu mới.";
      }

      if (formData.newPassword.length < 6) {
        return "Mật khẩu mới phải có ít nhất 6 ký tự.";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        return "Xác nhận mật khẩu không khớp.";
      }
    }

    if (!formData.agree) {
      return "Bạn cần đồng ý với điều khoản để tiếp tục.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const payload = {
        user_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        avatar_url: avatar,
      };

      if (formData.newPassword.trim()) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const result = await updateMyProfile(payload);

      if (result?.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        setFormData((prev) => ({
          ...prev,
          fullName:
            result.user.user_name ||
            result.user.fullName ||
            result.user.username ||
            prev.fullName,
          email: result.user.email || prev.email,
          phone: result.user.phone || "",
        }));

        setAvatar(
          result.user.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            result.user.user_name || result.user.fullName || "User"
          )}&background=ececec&color=555&size=128`
        );
      }

      setMessage(result?.message || "Cập nhật tài khoản thành công.");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { label: "Account Details", path: "/edit-user", active: true },
    { label: "My Orders", path: "/orders-status", active: false },
    { label: "Favorite Item", path: "/wishlist", active: false },
    { label: "Payment Methods", path: "/payment-methods", active: false },
  ];

  return (
    <>
      <div className="edit-user-page">
        <div className="edit-user-container">
          <h1 className="edit-user-title">Account Details</h1>

          <div className="edit-user-layout">
            <aside className="account-sidebar">
              <div className="account-profile-card">
                <div className="account-profile-top">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="account-avatar-image"
                    />
                  ) : (
                    <FaUserCircle className="account-avatar-icon" />
                  )}

                  <div className="account-user-info">
                    <h3>{formData.fullName || "User Name"}</h3>
                    <p>{formData.email || "email@example.com"}</p>
                  </div>
                </div>

                <div className="order-sidebar-menu">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      className={`sidebar-menu-item ${item.active ? "active" : ""
                        }`}
                      onClick={() => navigate(`/status-order`)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </aside>

            <section className="account-form-section">
              <form className="account-form-card" onSubmit={handleSubmit}>
                <div className="account-form-header">
                  <h2>Edit Account</h2>
                </div>

                {error && <div className="form-alert error">{error}</div>}
                {message && <div className="form-alert success">{message}</div>}

                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="left-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <FaPhoneAlt className="left-icon" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-with-icon password-field">
                    <FaLock className="left-icon" />
                    <input
                      type={
                        showPassword.currentPassword ? "text" : "password"
                      }
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => togglePassword("currentPassword")}
                    >
                      {showPassword.currentPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-with-icon password-field">
                    <FaLock className="left-icon" />
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => togglePassword("newPassword")}
                    >
                      {showPassword.newPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-with-icon password-field">
                    <FaLock className="left-icon" />
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => togglePassword("confirmPassword")}
                    >
                      {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUser;