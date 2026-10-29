import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AIReportBuilder from './pages/AIReportBuilder/AIReportBuilder';
import StudentsList from './pages/StudentsList';
import StudentDetail from './pages/StudentDetail';
import PredictionHub from './pages/PredictionHub';
import AIAnalytics from './pages/AIAnalytics';
import AILogs from './pages/AILogs';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Search, Bell, User, LogOut, Home, ShieldCheck, Sun, Moon, Menu } from 'lucide-react';
import './index.css';

const Topbar = ({ collapsed = false, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchVal, setSearchVal] = React.useState('');

  let title = "Department Performance Overview";
  let subtitle = "Comprehensive academic intelligence and analytics dashboard";
  
  if (location.pathname.includes('/ai-logs')) {
    title = "AI Query & Response Audit Logs";
    subtitle = "Inspect raw Groq LLM prompts, completions, query plans, and database execution telemetry";
  } else if (location.pathname.includes('/ai-analytics')) {
    title = "AI-Powered Dynamic Analytics";
    subtitle = "Natural language queries, real university database analytics & interactive visualization";
  } else if (location.pathname.includes('/prediction-hub')) {
    title = "AI Prediction Hub & Risk Engine";
    subtitle = "Predict student pass/fail probabilities using XGBoost Machine Learning";
  } else if (location.pathname.includes('/students')) {
    title = "Students Directory";
    subtitle = "Search and filter student performance records across departments";
  } else if (location.pathname.includes('/student/')) {
    title = "Student Performance Analytics";
    subtitle = "Comprehensive view of individual student academic progression";
  } else if (location.pathname.includes('/ai-report') || location.pathname.includes('/reports')) {
    title = "AI Report Card & Dynamic Dossier Builder";
    subtitle = "Drag-and-drop report workspace with factual database queries and high-DPI PDF generation";
  } else if (location.pathname.includes('/settings')) {
    title = "System Configuration & ML Settings";
    subtitle = "API connections, prediction thresholds, and grading parameters";
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: 'var(--theme-surface-elevated, #F5F5F5)',
              border: '1px solid var(--theme-border, #E5E5E5)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--theme-text-primary, #111111)',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Menu size={18} />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="search-bar">
          <Search size={16} color="var(--theme-text-secondary, #666666)" />
          <input 
            type="text" 
            placeholder="Search student or roll number..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid var(--theme-border, #E5E5E5)',
            background: 'var(--theme-surface-elevated, #F5F5F5)',
            color: 'var(--theme-accent, #FFD43B)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div style={{ position: 'relative', cursor: 'pointer', padding: '6px' }} title="System Notifications">
          <Bell size={18} color="var(--theme-text-secondary, #666666)" />
          <span style={{ position: 'absolute', top: 3, right: 3, background: 'var(--theme-accent, #FFD43B)', width: 7, height: 7, borderRadius: '50%' }}></span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--theme-border, #E5E5E5)' }} />

        <div className="profile-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="profile-img">
            <User size={18} color="var(--theme-accent, #FFD43B)" />
          </div>
          <div className="profile-info" style={{ lineHeight: 1.2 }}>
            <span className="profile-name">{user?.full_name || 'Academic Member'}</span>
            <span className="profile-role">{user?.department || 'Academic Intelligence'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            style={{
              marginLeft: '4px',
              padding: '6px 12px',
              background: 'var(--theme-surface-elevated, #F5F5F5)',
              border: '1px solid var(--theme-border, #E5E5E5)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--theme-text-primary, #111111)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div style={{ background: 'var(--theme-card-bg, #141414)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--theme-border, #292929)' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>System & ML Model Settings</h2>
    <p style={{ color: 'var(--theme-text-secondary, #A3A3A3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
      Connected to XGBoost inference engine with dynamic internal mark benchmark totals (40 / 50 / 60 scale) and secured SQLite authentication.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      <div style={{ padding: '1.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '10px', border: '1px solid var(--theme-border, #292929)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>Backend API Connection</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>Active endpoint: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</code></p>
      </div>
      <div style={{ padding: '1.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '10px', border: '1px solid var(--theme-border, #292929)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>SQLite Database</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>Auto-created <code>users.db</code> with bcrypt salted password hashing.</p>
      </div>
      <div style={{ padding: '1.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '10px', border: '1px solid var(--theme-border, #292929)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>Risk Thresholds</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>High Risk: &ge; 65% Fail Chance · Medium Risk: &ge; 30%</p>
      </div>
    </div>
  </div>
);

// Portal layout for authenticated views with collapsible sidebar
const PortalLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('bit_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('bit_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <ProtectedRoute>
      <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="main-content">
          <Topbar collapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing & Authentication Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />

            {/* Protected Institutional Portal Routes */}
            <Route path="/dashboard" element={<PortalLayout><Dashboard /></PortalLayout>} />
            <Route path="/prediction-hub" element={<PortalLayout><PredictionHub /></PortalLayout>} />
            <Route path="/ai-analytics" element={<PortalLayout><AIAnalytics /></PortalLayout>} />
            <Route path="/ai-logs" element={<PortalLayout><AILogs /></PortalLayout>} />
            <Route path="/students" element={<PortalLayout><StudentsList /></PortalLayout>} />
            <Route path="/student/:id" element={<PortalLayout><StudentDetail /></PortalLayout>} />
            <Route path="/reports" element={<PortalLayout><AIReportBuilder /></PortalLayout>} />
            <Route path="/ai-report" element={<PortalLayout><AIReportBuilder /></PortalLayout>} />
            <Route path="/settings" element={<PortalLayout><SettingsPage /></PortalLayout>} />

            {/* Catch-all redirect to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
