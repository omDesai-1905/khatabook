import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onToggleSidebar && (
              <button 
                className="sidebar-toggle"
                onClick={onToggleSidebar}
              >
                ☰
              </button>
            )}
            <div className="navbar-brand">
              Khatabook
            </div>
          </div>
          
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;