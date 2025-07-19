import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      const response = await axios.put('/api/auth/profile', updateData);
      
      // Update user context
      updateUser(response.data.user);
      
      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || ''
    });
    setErrors({});
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <div className="container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="sidebar-content">
            {/* Navigation Items */}
            <div className="sidebar-nav">
              <button 
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/dashboard');
                  setSidebarOpen(false);
                }}
              >
                🏠 Dashboard
              </button>
              
              <button 
                className="sidebar-nav-item active"
                onClick={() => setSidebarOpen(false)}
              >
                ⚙️ Profile
              </button>
              
              <button 
                className="sidebar-nav-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  margin: '0 auto 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#4a5568' }}>{user?.name}</p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Notification Toast */}
        {notification && (
          <div 
            className={`notification ${notification.type}`}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '500',
              zIndex: 1000,
              minWidth: '300px',
              backgroundColor: notification.type === 'success' ? '#48bb78' : notification.type === 'error' ? '#f56565' : '#4299e1',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                marginLeft: '1rem',
                opacity: 0.8
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="profile-container">
          <div className="profile-header">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                {user.name?.charAt(0).toUpperCase() || '👤'}
              </div>
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>My Profile</h1>
              <p style={{ color: '#718096', margin: 0 }}>Manage your account information</p>
            </div>
          </div>

          <div className="profile-card">
            {!isEditing ? (
            <div className="profile-view">
              <div className="profile-info">
                <div className="info-item">
                  <label>👤 Full Name</label>
                  <p>{user.name}</p>
                </div>
                
                <div className="info-item">
                  <label>📧 Email Address</label>
                  <p>{user.email}</p>
                </div>
                
                <div className="info-item">
                  <label>📅 Member Since</label>
                  <p>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ marginRight: '1rem' }}
                >
                  ✏️ Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="btn btn-danger"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">👤 Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">📧 Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
