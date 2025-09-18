import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ onShowAuth }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="logo">🌍 Travel Journal</h1>
          
          <nav className="nav">
            <div className="nav-links">
              <a href="#map" className="nav-link">Map</a>
              <a href="#journal" className="nav-link">My Journal</a>
              <a href="#profile" className="nav-link">Profile</a>
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;