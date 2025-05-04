// frontend/src/components/layout/Header.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        Stock Market App
      </Link>
      <div className="user-menu">
        {isAuthenticated ? (
          <>
            <div className="user-info">
              {user && (
                <>
                  <span>Welcome, {user.first_name || user.email.split('@')[0]}</span>
                  {isAdmin && (
                    <span className="badge bg-danger ml-2" style={{ marginLeft: '10px' }}>Admin</span>
                  )}
                </>
              )}
            </div>
            {isAdmin && (
              <Link to="/admin" className="btn btn-primary" style={{ marginRight: '10px' }}>
                Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <div>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{ marginLeft: '10px' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;