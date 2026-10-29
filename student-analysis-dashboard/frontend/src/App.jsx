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
import { Search, Bell, User, LogOut, Home, ShieldCheck } from 'lucide-react';
import './index.css';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  } else if (location.pathname.includes('/at-risk')) {
    title = "At-Risk Academic Intervention";
    subtitle = "Identified students requiring remedial counseling and monitoring";
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
      <div className="topbar-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-right">
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#000000',
            background: '#facc15',
            padding: '6px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(250, 204, 21, 0.25)'
          }}
        >
          <Home size={15} color="#000000" />
          Landing Page
        </Link>

        <div className="search-bar">
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search student or roll number..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
        
        <div style={{ position: 'relative', cursor: 'pointer' }} title="System Notifications">
          <Bell size={20} color="#64748b" />
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#10b981', width: 8, height: 8, borderRadius: '50%' }}></span>
        </div>

        <div className="profile-section">
          <div className="profile-img">
            <User size={24} color="#94a3b8" style={{ margin: '6px' }} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.full_name || 'Academic Faculty'}</span>
            <span className="profile-role">{user?.role || 'Department Portal'}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>System & ML Model Settings</h2>
    <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
      Connected to XGBoost inference engine with dynamic internal mark benchmark totals (40 / 50 / 60 scale) and secured SQLite authentication.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Backend API Connection</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Active endpoint: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</code></p>
      </div>
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>SQLite Database</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Auto-created <code>users.db</code> with bcrypt salted password hashing.</p>
      </div>
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Risk Thresholds</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>High Risk: &ge; 65% Fail Chance · Medium Risk: &ge; 30%</p>
      </div>
    </div>
  </div>
);

// Portal layout for authenticated views
const PortalLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Topbar />
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
          <Route path="/at-risk" element={<PortalLayout><Dashboard /></PortalLayout>} />
          <Route path="/reports" element={<PortalLayout><AIReportBuilder /></PortalLayout>} />
          <Route path="/ai-report" element={<PortalLayout><AIReportBuilder /></PortalLayout>} />
          <Route path="/settings" element={<PortalLayout><SettingsPage /></PortalLayout>} />

          {/* Catch-all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
