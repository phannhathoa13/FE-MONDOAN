import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { CART_UPDATED_EVENT, getCartItemCount } from "../../services/cartService";
import vTechLogo from "../../assets/vTechLogo.png";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user")) : null;
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  // Sync cart count
  useEffect(() => {
    let isMounted = true;

    const syncCartCount = async () => {
      if (!token) {
        if (isMounted) setCartCount(0);
        return;
      }
      try {
        const count = await getCartItemCount();
        if (isMounted) setCartCount(count);
      } catch {
        if (isMounted) setCartCount(0);
      }
    };

    const handleCartUpdated = (event) => {
      setCartCount(event.detail?.count || 0);
    };

    syncCartCount();
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [token]);

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCartCount(0);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={vTechLogo} alt="vTechLogo" className="logoImage" />
        </Link>

        <nav className="header-nav">
          <NavLink end to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Store
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Search
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Support
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-item nav-item--cart active' : 'nav-item nav-item--cart'}>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          <div className="header-user" ref={dropdownRef}>
            {token && user ? (
              <div className="user-menu">
                <div className="user-avatar" onClick={toggleDropdown}>
                  {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="user-name" onClick={toggleDropdown}>
                  {user?.email ? user.email.split("@")[0] : "User"}
                </span>

                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/edit-user" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Edit User
                    </Link>
                    <Link to="/status-order" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Order Status
                    </Link>
                    <button type="button" className="dropdown-item" onClick={handleLogout}>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                {!user ? (
                  <Link to="/login" className="auth-button auth-button--secondary">
                    Sign In
                  </Link>
                ) : (
                  <Link to="/create-account" className="auth-button">
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;