import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">Task Tracker</div>
          <div className="navbar-nav">
            <span>Welcome, {user?.name}</span>
            <Link to="/organizations" className="nav-link">Organizations</Link>
            <span className="nav-link" onClick={handleLogout}>Logout</span>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '50px' }}>
        <div className="card">
          <h1>Dashboard</h1>
          <p>Welcome to your Task Tracker dashboard!</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <Link to="/organizations" className="btn btn-primary">
                Manage Organizations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;