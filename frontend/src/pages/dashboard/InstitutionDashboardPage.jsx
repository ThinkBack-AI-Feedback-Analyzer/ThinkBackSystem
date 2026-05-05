import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/common/DashboardSidebar";
import DashboardTopBar from "../../components/common/DashboardTopBar";
import institutionLogo from "../../assets/Logo_4.png";
import {
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

/* CSS custom-property driven 3D tilt + shine — can't be expressed in Tailwind */
const CARD_STYLES = `
  .stat-card-3d {
    transform: perspective(2000px)
      rotateX(var(--rotate-x, 0deg))
      rotateY(var(--rotate-y, 0deg))
      translateZ(var(--translate-z, 0px));
    box-shadow:
      0 0 0 1px rgba(16,185,129,0.06),
      var(--shadow-x, 0px) var(--shadow-y, 20px) 40px rgba(16,185,129,0.08),
      0 15px 25px -5px rgba(0,0,0,0.04),
      inset 0 0 0 1px rgba(255,255,255,0.65);
    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.2s ease;
  }
  .stat-card-3d:hover { border-color: rgba(16,185,129,0.28) !important; }
  .stat-card-shine {
    background: radial-gradient(
      circle at var(--shine-x, 50%) var(--shine-y, 50%),
      rgba(255,255,255,0.12) 0%,
      transparent 70%
    );
    opacity: var(--shine-opacity, 0);
    transition: opacity 0.4s ease;
  }
  .stat-card-3d:hover .stat-card-shine { --shine-opacity: 1; }
  .stat-ghost-circle {
    background: var(--circle-color, rgba(16,185,129,0.03));
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: scale(var(--circle-scale, 1)) translateZ(-1px);
  }
  .stat-card-3d:hover .stat-ghost-circle { transform: scale(1.2) translateZ(-1px); }
`;

const StatCard = ({ stat }) => {
  const cardRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
    card.style.setProperty("--translate-z", "50px");
    card.style.setProperty("--shine-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--shine-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--shadow-x", `${(rotateY / 15) * -12}px`);
    card.style.setProperty("--shadow-y", `${(rotateX / 15) * 12 + 15}px`);
    card.style.setProperty("--circle-scale", "1.3");
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
    card.style.setProperty("--translate-z", "0px");
    card.style.setProperty("--shadow-x", "0px");
    card.style.setProperty("--shadow-y", "10px");
    card.style.setProperty("--circle-scale", "1");
  };

  return (
    <div
      ref={cardRef}
      className="stat-card-3d relative overflow-hidden flex flex-col bg-white rounded-2xl border border-[rgba(24,80,55,0.14)] p-5 cursor-pointer [transform-style:preserve-3d]"
      style={{
        "--circle-color": stat.trendUp
          ? "rgba(16,185,129,0.07)"
          : "rgba(239,68,68,0.03)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stat-card-shine absolute inset-0 pointer-events-none z-[5]" />
      <div className="stat-ghost-circle absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full z-0" />

      <div className="relative z-[1] flex flex-col h-full">
        {/* Icon + mini chart */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[#f0fdf9] text-emerald-500">
            {stat.icon}
          </div>
          <div className="flex items-end gap-[3px] h-7">
            {stat.chartData.map((h, i) => (
              <div
                key={i}
                className={`w-[5px] rounded-sm transition-[height] duration-[800ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
                  i === stat.chartData.length - 1 ? "bg-emerald-500" : "bg-slate-100"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
          {stat.label}
        </div>
        <div className="text-3xl font-bold text-slate-800 mb-3 leading-none tracking-tight">
          {stat.value}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              stat.trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {stat.trendUp ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
            {stat.trend}
          </div>
          <div className="text-xs text-slate-400">{stat.trendText}</div>
        </div>

        <div className="mt-auto w-full">
          <div className="w-full h-1 bg-slate-100 rounded-full">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${stat.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InstitutionDashboardPage = () => {
  const navigate = useNavigate();
  const [state] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return { user: null };
    try {
      return { user: JSON.parse(storedUser) };
    } catch {
      return { user: null };
    }
  });

  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    } else if (state.user.role !== "institution_admin") {
      navigate("/");
    }
  }, [state.user, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const handleSidebarNavigation = useCallback(
    (key) => {
      if (key === 'invite') {
        navigate('/manage-users', { state: { openInvite: true } })
        return
      }
      const routes = {
        dashboard: "/institution-dashboard",
        courses: "/courses",
        feedback: "/feedback-forms",
        users: "/manage-users",
      };
      if (routes[key]) navigate(routes[key]);
    },
    [navigate]
  );

  if (!state.user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#64748b] text-[16px]">
        Loading...
      </div>
    );
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
      chartData: [40, 60, 30, 80, 50],
    },
    {
      label: "LECTURERS",
      value: "63",
      icon: <FaUsers />,
      trend: "4",
      trendText: "this month",
      trendUp: true,
      progress: 45,
      chartData: [30, 50, 70, 40, 60],
    },
    {
      label: "ACTIVE FORMS",
      value: "31",
      icon: <FaCheckCircle />,
      trend: "7",
      trendText: "this week",
      trendUp: true,
      progress: 55,
      chartData: [20, 40, 60, 80, 100],
    },
    {
      label: "RESPONSES",
      value: "2,847",
      icon: <FaChartLine />,
      trend: "318",
      trendText: "since yesterday",
      trendUp: true,
      progress: 85,
      chartData: [50, 30, 80, 40, 90],
    },
  ];

  return (
    <>
      <style>{CARD_STYLES}</style>

      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <DashboardSidebar
          activeNav="dashboard"
          onNavChange={handleSidebarNavigation}
          onLogout={handleLogout}
          logoSrc={institutionLogo}
          logoAlt="ThinkBack logo"
        />

        <main className="flex-1 overflow-y-auto min-w-0 max-md:pt-14">
          <DashboardTopBar
            userName={state.user.full_name}
            userEmail={state.user.email}
          />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-6">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default InstitutionDashboardPage;
