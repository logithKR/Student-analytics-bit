import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  BrainCircuit,
  Users,
  FileText,
  Settings,
  Sparkles,
  Terminal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { section: 'Executive Portal' },
  { to: '/dashboard', label: 'Executive Overview', icon: LayoutDashboard },
  { section: 'Analytics & AI' },
  { to: '/prediction-hub', label: 'Prediction Hub', icon: BrainCircuit, color: 'var(--theme-accent, #FFD43B)' },
  { to: '/ai-analytics', label: 'AI Analytics', icon: Sparkles, color: 'var(--theme-accent, #FFD43B)' },
  { to: '/ai-logs', label: 'AI Query Logs', icon: Terminal, color: 'var(--theme-accent, #FFD43B)' },
  { to: '/students', label: 'Student Directory', icon: Users },
  { section: 'Administration' },
  { to: '/ai-report', label: 'AI Report Builder', icon: FileText },
  { to: '/settings', label: 'System Settings', icon: Settings },
];

export const Sidebar = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Brand Logo & Toggle Header ── */}
      <div className="sidebar-logo">
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
            overflow: 'hidden'
          }}
          title="Academic Intelligence BIT Portal"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--theme-accent, #FFD43B)',
              color: 'var(--theme-accent-text, #080808)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)'
            }}
          >
            <BookOpen size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Academic Intelligence
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--theme-text-secondary, #666666)', fontWeight: 500, letterSpacing: '0.02em' }}>
                BIT Autonomous
              </span>
            </div>
          )}
        </Link>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="sidebar-toggle-btn"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              marginLeft: collapsed ? 0 : 'auto',
              background: 'var(--theme-surface-elevated, #F5F5F5)',
              border: '1px solid var(--theme-border, #E5E5E5)',
              borderRadius: '6px',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--theme-text-secondary, #666666)',
              transition: 'all 0.15s ease'
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* ── Nav Links ── */}
      <div className="nav-links">
        {NAV_ITEMS.map((item, idx) => {
          if (item.section) {
            if (collapsed) {
              return (
                <div
                  key={`sec-${idx}`}
                  style={{
                    height: '1px',
                    background: 'var(--theme-border, #E5E5E5)',
                    margin: '8px 12px',
                    opacity: 0.7
                  }}
                />
              );
            }
            return (
              <div key={`sec-${idx}`} className="sidebar-category-header">
                {item.section}
              </div>
            );
          }

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent size={18} color={item.color} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* ── Bottom Section: Profile & System Info ── */}
      <div className="sidebar-bottom-card" style={{ marginTop: 'auto' }}>
        {user ? (
          <div
            style={{
              background: 'var(--theme-surface-elevated, #F5F5F5)',
              padding: collapsed ? '0.5rem' : '0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--theme-border, #E5E5E5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: collapsed ? 'center' : 'stretch',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--theme-accent, #FFD43B)',
                  color: 'var(--theme-accent-text, #080808)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
                title={user.full_name || 'Academic Member'}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #111111)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--theme-text-secondary, #666666)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.department || 'Academic Member'}
                  </div>
                </div>
              )}
            </div>

            {/* Clean, Non-Red Sign Out Action */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              style={{
                width: '100%',
                marginTop: '0.25rem',
                padding: '0.4rem 0.5rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--theme-text-primary, #111111)',
                background: 'var(--theme-card-bg, #FFFFFF)',
                border: '1px solid var(--theme-border, #E5E5E5)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={13} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem',
              background: 'var(--theme-accent, #FFD43B)',
              color: 'var(--theme-accent-text, #080808)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'none'
            }}
            title="Sign In"
          >
            <UserCheck size={15} />
            {!collapsed && <span>Sign In</span>}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
