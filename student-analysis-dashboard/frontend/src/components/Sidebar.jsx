import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  BrainCircuit,
  Users,
  ShieldAlert,
  FileText,
  Settings,
  Sparkles,
  Terminal,
  LogOut,
  Home,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <BookOpen size={24} color="#2563eb" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>Academic Intelligence</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>BIT Higher Education</span>
        </div>
      </div>
      
      <div className="nav-links">
        <div className="sidebar-category-header">Public & Portal</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={18} />
          Landing Page
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Executive Overview
        </NavLink>

        <div className="sidebar-category-header">Analytics & AI</div>
        <NavLink to="/prediction-hub" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <BrainCircuit size={18} color="#3b82f6" />
          Prediction Hub
        </NavLink>
        <NavLink to="/ai-analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Sparkles size={18} color="#60a5fa" />
          AI Analytics
        </NavLink>
        <NavLink to="/ai-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Terminal size={18} color="#10b981" />
          AI Query Logs
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          Student Directory
        </NavLink>
        <NavLink to="/at-risk" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={18} />
          At-Risk Cohort
        </NavLink>

        <div className="sidebar-category-header">Administration</div>
        <NavLink to="/ai-report" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <FileText size={18} />
          AI Report Builder
        </NavLink>
        <NavLink to="/settings" className="nav-link">
          <Settings size={18} />
          System Settings
        </NavLink>
      </div>

      <div className="sidebar-bottom-card" style={{ marginTop: 'auto', padding: '1rem' }}>
        {user ? (
          <div style={{ background: '#1e293b', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: 500
              }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              background: '#facc15',
              color: '#000000',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '0.5rem',
              boxShadow: '0 2px 10px rgba(250, 204, 21, 0.3)'
            }}
          >
            <UserCheck size={16} /> Sign In
          </Link>
        )}

        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.75rem' }}>
            <Sparkles size={14} /> XGBoost & Groq
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Inference online · SQLite auth enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
