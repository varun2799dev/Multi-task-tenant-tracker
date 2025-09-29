import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [joinOrgId, setJoinOrgId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Add API base URL for Vite
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/organizations`);
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const createOrganization = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/organizations`, {
        name: newOrgName
      });
      setNewOrgName('');
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinOrganization = async (e) => {
    e.preventDefault();
    if (!joinOrgId.trim()) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/organizations/${joinOrgId}/join`);
      setJoinOrgId('');
      fetchOrganizations();
    } catch (error) {
      console.error('Error joining organization:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <span className="nav-link" onClick={handleLogout}>Logout</span>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '30px' }}>
        <div className="card">
          <h2>Your Organizations</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
            {/* Create Organization */}
            <div>
              <h3>Create New Organization</h3>
              <form onSubmit={createOrganization}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Organization'}
                </button>
              </form>
            </div>

            {/* Join Organization */}
            <div>
              <h3>Join Organization</h3>
              <form onSubmit={joinOrganization}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Organization ID"
                    value={joinOrgId}
                    onChange={(e) => setJoinOrgId(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Organization'}
                </button>
              </form>
            </div>
          </div>

          {/* Organizations List */}
          <div style={{ marginTop: '30px' }}>
            <h3>Your Organizations</h3>
            {organizations.length === 0 ? (
              <p>You are not a member of any organizations yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                {organizations.map(org => (
                  <div key={org.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{org.name}</h4>
                      <p>Role: <strong>{org.role}</strong></p>
                    </div>
                    <Link 
                      to={`/organization/${org.id}`} 
                      className="btn btn-primary"
                    >
                      Open Workspace
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organizations;