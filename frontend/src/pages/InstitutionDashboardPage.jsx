import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBook, FaComments, FaUsers, FaCog, FaSignOutAlt, FaChartBar } from "react-icons/fa";

const InstitutionDashboardPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");

  // Initialize state from localStorage (synchronous, no effect needed)
  const [state] = useState(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      return { user: null, loading: false };
    }

    try {
      const userData = JSON.parse(storedUser);
      return { user: userData, loading: false };
    } catch {
      return { user: null, loading: false };
    }
  });

  // Effect only for side effects (navigation)
  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    } else if (state.user.role !== 'institution_admin') {
      navigate("/");
    }
  }, [state.user, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate("/login");
  }, [navigate]);

  if (!state.user) {
    return <div className="loading">Loading...</div>;
  }

  const { user } = state;

  return (
    <div className="dash-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">TB</div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <FaHome />
          </button>
          <button 
            className={`nav-item ${activeNav === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveNav('courses')}
          >
            <FaBook />
          </button>
          <button 
            className={`nav-item ${activeNav === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveNav('feedback')}
          >
            <FaComments />
          </button>
          <button 
            className={`nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveNav('analytics')}
          >
            <FaChartBar />
          </button>
          <button 
            className={`nav-item ${activeNav === 'users' ? 'active' : ''}`}
            onClick={() => setActiveNav('users')}
          >
            <FaUsers />
          </button>
          <button 
            className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <FaCog />
          </button>
        </nav>

        <button className="nav-logout" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>Welcome back, {user.full_name}!</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">{user.full_name.charAt(0)}</div>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">24</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">18</div>
            <div className="stat-label">Completed Forms</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Active Forms</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">08</div>
            <div className="stat-label">Draft Forms</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-primary">+ Create New Course</button>
          <button className="btn-secondary">+ Create New Feedback Form</button>
          <button className="btn-secondary">↓ Export Data</button>
        </div>

        {/* Analytics Section */}
        <section className="analytics-section">
          <div className="section-header">
            <h2>Feedback Analytics</h2>
          </div>

          <div className="analytics-controls">
            <label>Select Course</label>
            <select>
              <option>Choose a course to view analytics</option>
              <option>Course 101</option>
              <option>Course 102</option>
            </select>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Feedback Sentiment Overview</h3>
              <div className="chart-placeholder">
                <div style={{ height: '250px', background: 'linear-gradient(to right, #1b5e20 0%, #2e7d32 100%)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px' }}>
                  <div style={{ width: '60px', height: '150px', background: '#1b5e20', borderRadius: '4px' }}></div>
                  <div style={{ width: '60px', height: '100px', background: '#558b2f', borderRadius: '4px' }}></div>
                  <div style={{ width: '60px', height: '60px', background: '#9ccc65', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Top 5 Topics Mentioned</h3>
              <div className="chart-placeholder">
                <div style={{ width: '100%', height: '250px', background: 'conic-gradient(#1b5e20 0deg 90deg, #2e7d32 90deg 180deg, #558b2f 180deg 270deg, #9ccc65 270deg 360deg)', borderRadius: '50%', margin: '0 auto' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="table-section">
          <h2>Feedback Sentiment Overview</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Instructor</th>
                  <th>Count</th>
                  <th>Sentiment</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Database 101</td>
                  <td>Dr. Jane Patel</td>
                  <td>28</td>
                  <td><span className="badge positive">Positive</span></td>
                  <td>3 days ago</td>
                  <td><button className="view-btn">View Report</button></td>
                </tr>
                <tr>
                  <td>Database 102</td>
                  <td>Dr. Jane Patel</td>
                  <td>24</td>
                  <td><span className="badge positive">Positive</span></td>
                  <td>2 days ago</td>
                  <td><button className="view-btn">View Report</button></td>
                </tr>
                <tr>
                  <td>Database 103</td>
                  <td>Dr. Jane Patel</td>
                  <td>18</td>
                  <td><span className="badge neutral">Neutral</span></td>
                  <td>1 day ago</td>
                  <td><button className="view-btn">View Report</button></td>
                </tr>
                <tr>
                  <td>Database 104</td>
                  <td>Dr. Jane Patel</td>
                  <td>35</td>
                  <td><span className="badge negative">Negative</span></td>
                  <td>2 days ago</td>
                  <td><button className="view-btn">View Report</button></td>
                </tr>
                <tr>
                  <td>Database 105</td>
                  <td>Dr. Jane Patel</td>
                  <td>12</td>
                  <td><span className="badge positive">Positive</span></td>
                  <td>1 hour ago</td>
                  <td><button className="view-btn">View Report</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstitutionDashboardPage;
