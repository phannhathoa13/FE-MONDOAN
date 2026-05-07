import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { CART_UPDATED_EVENT, getCartItemCount } from "../../services/cartService";
import vTechLogo from "../../assets/vTechLogo.png"

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user")) : null;
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const syncCartCount = async () => {
      if (!token) {
        if (isMounted) {
          setCartCount(0);
        }
        return;
      }

      try {
        const count = await getCartItemCount();
        if (isMounted) {
          setCartCount(count);
        }
      } catch {
        if (isMounted) {
          setCartCount(0);
        }
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCartCount(0);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={vTechLogo} alt="vTechLogo" className="logoImage"></img>
        </Link>

        <nav className="header-nav">
          <NavLink end to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Store
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Support
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-item nav-item--cart active' : 'nav-item nav-item--cart'}>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            placeholder="Search products..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        <div className="header-user">
          {token && user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="user-name">
                {user?.email ? user.email.split("@")[0] : "User"}
              </span>
              <div className="user-dropdown">
                <Link
                  to="/edit-user"
                  className="dropdown-item"
                >
                  Edit User
                </Link>
                <Link
                  to="/status-order"
                  className="dropdown-item"
                >
                  Order Status
                </Link>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button auth-button--secondary">
                Sign In
              </Link>
              <Link to="/create-account" className="auth-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;