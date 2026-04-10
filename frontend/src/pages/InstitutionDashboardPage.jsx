import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/common/DashboardSidebar";
import DashboardTopBar from "../components/common/DashboardTopBar";
import institutionLogo from "../assets/Logo_4.png";
import { 
  FaUsers, 
  FaChartLine, 
  FaClipboardList, 
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

const StatCard = ({ stat }) => {
  const cardRef = React.useRef(null);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 15 degrees for premium feel)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    // Calculate shine position
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    
    // Calculate shadow shift (opposite to tilt)
    const shadowX = (rotateY / 15) * -12;
    const shadowY = (rotateX / 15) * 12;
    
    // Apply variables
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--translate-z', '50px');
    card.style.setProperty('--shine-x', `${shineX}%`);
    card.style.setProperty('--shine-y', `${shineY}%`);
    card.style.setProperty('--shadow-x', `${shadowX}px`);
    card.style.setProperty('--shadow-y', `${shadowY + 15}px`);
    card.style.setProperty('--circle-scale', '1.3');
  };
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    // Spring back to zero
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--translate-z', '0px');
    card.style.setProperty('--shadow-x', '0px');
    card.style.setProperty('--shadow-y', '10px');
    card.style.setProperty('--circle-scale', '1');
  };

  return (
    <div 
      ref={cardRef}
      className={`stat-card ${stat.trendUp ? 'up' : 'down'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stat-card-shine" />
      
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          {stat.icon}
        </div>
        <div className="stat-mini-chart">
          {stat.chartData.map((height, i) => (
            <div 
              key={i} 
              className={`mini-bar ${i === stat.chartData.length - 1 ? 'active' : ''}`} 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="stat-label">{stat.label}</div>
      <div className="stat-number">{stat.value}</div>
      
      <div className="stat-trend-container">
        <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
          {stat.trendUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
          {stat.trend}
        </div>
        <div className="stat-trend-text">{stat.trendText}</div>
      </div>

      <div className="stat-footer">
        <div className="stat-progress-track">
          <div 
            className="stat-progress-bar" 
            style={{ width: `${stat.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const InstitutionDashboardPage = () => {
  const navigate = useNavigate();

  // Initialize state from localStorage
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

  // Effect only for navigation
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

  const handleSidebarNavigation = useCallback((key) => {
    const routeMap = {
      dashboard: "/institution-dashboard",
      courses: "/courses",
      feedback: "/feedbackForm",
      users: "/student-management",
    };

    const targetRoute = routeMap[key];

    if (targetRoute) {
      navigate(targetRoute);
    }
  }, [navigate]);

  if (!state.user) {
    return <div className="loading">Loading...</div>;
  }

  const stats = [
    {
      label: "TOTAL COURSES",
      value: "148",
      icon: <FaClipboardList />,
      trend: "12",
      trendText: "this semester",
      trendUp: true,
      progress: 65,
      chartData: [40, 60, 30, 80, 50]
    },
    {
      label: "LECTURERS",
      value: "63",
      icon: <FaUsers />,
      trend: "4",
      trendText: "this month",
      trendUp: true,
      progress: 45,
      chartData: [30, 50, 70, 40, 60]
    },
    {
      label: "ACTIVE FORMS",
      value: "31",
      icon: <FaCheckCircle />,
      trend: "7",
      trendText: "this week",
      trendUp: true,
      progress: 55,
      chartData: [20, 40, 60, 80, 100]
    },
    {
      label: "RESPONSES",
      value: "2,847",
      icon: <FaChartLine />,
      trend: "318",
      trendText: "since yesterday",
      trendUp: true,
      progress: 85,
      chartData: [50, 30, 80, 40, 90]
    }
  ];

  return (
    <div className="dash-wrapper">
      <DashboardSidebar
        activeNav="dashboard"
        onNavChange={handleSidebarNavigation}
        onLogout={handleLogout}
        logoSrc={institutionLogo}
        logoAlt="ThinkBack logo"
      />

      <main className="dashboard-main">
        <DashboardTopBar 
          userName={state.user.full_name} 
          userEmail={state.user.email} 
        />

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default InstitutionDashboardPage;
