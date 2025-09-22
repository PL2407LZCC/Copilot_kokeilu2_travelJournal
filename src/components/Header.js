import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "./Header.css";

const Header = ({ onShowAuth, onViewChange, currentView }) => {
  const { user, logout } = useContext(AuthContext);

  const handleNavClick = (view, e) => {
    e.preventDefault();
    onViewChange(view);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="logo">🌍 Travel Journal</h1>

          <nav className="nav">
            <div className="nav-links">
              <a
                href="#map"
                className={`nav-link ${currentView === "map" ? "active" : ""}`}
                onClick={(e) => handleNavClick("map", e)}
              >
                Map
              </a>
              {user && (
                <a
                  href="#journal"
                  className={`nav-link ${
                    currentView === "journal" ? "active" : ""
                  }`}
                  onClick={(e) => handleNavClick("journal", e)}
                >
                  My Journal
                </a>
              )}
              {user && (
                <a
                  href="#profile"
                  className="nav-link"
                  onClick={(e) => handleNavClick("profile", e)}
                >
                  Profile
                </a>
              )}
            </div>

            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <span className="welcome">Welcome, {user.username}!</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={onShowAuth} className="btn btn-primary">
                  Login / Register
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
