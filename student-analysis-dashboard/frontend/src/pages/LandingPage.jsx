import React, { useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  School,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Database,
  ArrowRight,
  LogIn,
  UserCheck,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import '../landing.css';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // If user is already authenticated, immediately route to main dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-root">
      {/* ── Background Subtle Glow & Grid Animation ── */}
      <div className="landing-bg-grid" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* ── 1. Clean Public Institutional Header ── */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-header-inner">
            {/* Left: Branding */}
            <Link to="/" className="landing-brand">
              <div className="landing-brand-logo">
                <GraduationCap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="landing-brand-title">
                  Academic Intelligence
                  <span className="landing-brand-badge">BIT</span>
                </div>
                <p className="landing-brand-subtitle">Bannari Amman Institute of Technology</p>
              </div>
            </Link>

            {/* Right: Public Actions Only (Login & Register) + Theme Toggle */}
            <div className="landing-header-actions">
              <button
                onClick={toggleTheme}
                className="btn-dark-outline btn-sm"
                style={{ padding: '0.45rem', minWidth: '34px', justifyContent: 'center' }}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-yellow-400" />}
              </button>
              <Link to="/login" className="btn-dark-outline btn-sm">
                <LogIn className="w-3.5 h-3.5 text-yellow-400" />
                Login
              </Link>
              <Link to="/register" className="btn-gold-primary btn-sm">
                Register
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section: Perfectly Centered ── */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-inner">
            {/* Centered Institution Badge */}
            <div className="landing-pill-badge">
              <School className="w-4 h-4 text-yellow-400" />
              <span>Bannari Amman Institute of Technology</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Autonomous Institution</span>
            </div>

            {/* Responsive Centered Headline */}
            <h1 className="landing-hero-headline">
              Transform Academic Records <br className="hidden sm:inline" />
              into <span className="landing-gold-highlight">Proactive Student Success</span>
            </h1>

            {/* Descriptive Context */}
            <p className="landing-hero-description">
              An enterprise-grade academic intelligence and early-intervention platform. Unifying multi-semester cohorts, predictive machine learning models, and dynamic analytics with equal, comprehensive access for all registered members.
            </p>

            {/* Two Primary Centered CTAs */}
            <div className="landing-hero-ctas">
              <Link to="/login" className="btn-gold-primary">
                Login to Portal
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link to="/register" className="btn-dark-outline">
                <UserCheck className="w-4 h-4 text-yellow-400" />
                Register New Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. High-Level Institutional Governance & Architectural Pillars ── */}
      <section className="landing-features-section" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="landing-container">
          <div className="section-header-center">
            <div className="landing-pill-badge mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
              Platform Architecture & Capabilities
            </div>
            <h2 className="section-title">
              Engineered for Complete Academic Intelligence
            </h2>
            <p className="section-subtitle">
              Every authenticated member receives equal access to cohort records, predictive risk analytics, and conversational intelligence.
            </p>
          </div>

          <div className="features-bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* Pillar 1 */}
            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <UserCheck className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="feature-title">Unified Platform Access</h3>
                <p className="feature-desc">
                  Equal, unrestricted access across all dashboard features, student directories, batch predictions, and dynamic reports for every registered account.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Equal Access for All Members</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <BrainCircuit className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="feature-title">Predictive ML Risk Engine</h3>
                <p className="feature-desc">
                  Calibrated XGBoost models evaluating multi-semester internal assessment trajectories to detect early course arrear risks and guide proactive mentoring.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Continuous Assessment Tracking</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="feature-title">Conversational AI Analytics</h3>
                <p className="feature-desc">
                  Natural language query engine with rate-limit resilient failover, verified database schema validation, and 12 exportable dynamic visualizations.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Natural Language Decision Support</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <Database className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="feature-title">Secured SQLite & JWT</h3>
                <p className="feature-desc">
                  Auto-created database on startup with 12-round salted bcrypt password hashing, stateless token verification, and instant server-side token revocation on logout.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Zero-Config Persistence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action Strip ── */}
      <section style={{ padding: '3rem 0', background: 'var(--theme-card-bg)', borderTop: '1px solid var(--theme-border)', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="landing-container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--theme-text-primary)', marginBottom: '0.75rem' }}>
              Access the Academic Intelligence Portal
            </h3>
            <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Sign in with your registered account credentials or create a new account for instant access to all institutional analytics modules.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/login" className="btn-gold-primary">
                Login to Portal
                <LogIn className="w-4 h-4" />
              </Link>
              <Link to="/register" className="btn-dark-outline">
                Register New Account
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Institutional Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400" style={{ background: 'var(--theme-surface-elevated)', border: '1px solid var(--theme-border)' }}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Bannari Amman Institute of Technology</p>
                <p className="text-[11px] m-0" style={{ color: 'var(--theme-text-secondary)' }}>Autonomous Institution &bull; Sathyamangalam &bull; All Rights Reserved</p>
              </div>
            </div>

            <div className="footer-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                API Docs
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Secured Academic Gateway</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
