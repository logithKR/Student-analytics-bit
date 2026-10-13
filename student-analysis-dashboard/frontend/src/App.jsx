import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentDetail from './pages/StudentDetail';
import PredictionHub from './pages/PredictionHub';
import AIAnalytics from './pages/AIAnalytics';
import { Search, Bell, User } from 'lucide-react';
import './index.css';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = React.useState('');

  let title = "Department Performance Overview";
  let subtitle = "Comprehensive academic intelligence and analytics dashboard";
  
  if (location.pathname.includes('/ai-analytics')) {
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
  } else if (location.pathname.includes('/reports')) {
    title = "Academic Performance Reports";
    subtitle = "Downloadable semester summaries and department evaluations";
  } else if (location.pathname.includes('/settings')) {
    title = "System Configuration & ML Settings";
    subtitle = "API connections, prediction thresholds, and grading parameters";
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-right">
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
            <span className="profile-name">Academic Faculty</span>
            <span className="profile-role">Department Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>System & ML Model Settings</h2>
    <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
      Connected to XGBoost inference engine with dynamic internal mark benchmark totals (40 / 50 / 60 scale).
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Backend API Connection</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Active endpoint: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</code></p>
      </div>
      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Risk Thresholds</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>High Risk: &ge; 50% Fail Chance · Medium Risk: &ge; 25%</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Topbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prediction-hub" element={<PredictionHub />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
              <Route path="/students" element={<StudentsList />} />
              <Route path="/student/:id" element={<StudentDetail />} />
              <Route path="/at-risk" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
