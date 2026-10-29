import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import '../landing.css';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Agricultural Engineering',
  'Artificial Intelligence & Machine Learning',
  'Biomedical Engineering',
  'Biotechnology',
  'Computer Science & Business Systems',
  'Computer Science & Design',
  'Civil Engineering',
  'Computer Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Instrumentation Engineering',
  'Fashion Technology',
  'Food Technology',
  'Information Science & Engineering',
  'Mechatronics Engineering',
  'Mechanical Engineering',
  'Textile Technology',
  'Academic Administration'
];

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Keep mode in sync if route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState(DEPARTMENTS[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (res.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters in length.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    const res = await register({
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      department: regDepartment,
      password: regPassword
    });
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('Account registered successfully! Redirecting to dashboard...');
      setTimeout(() => {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }, 600);
    } else {
      setErrorMsg(res.error || 'Registration failed. Email may already be registered.');
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="landing-root auth-page-wrapper">
      {/* ── Background Subtle Glow & Grid ── */}
      <div className="landing-bg-grid" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />

      {/* Top Nav: Back Link */}
      <div className={`auth-nav-bar ${isRegister ? 'reg-mode' : ''}`}>
        <Link
          to="/"
          className="btn-dark-outline btn-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
          Back to Home
        </Link>
      </div>

      {/* Centered Auth Card Container */}
      <div className={`auth-card-container ${isRegister ? 'reg-mode' : ''}`}>
        {/* Branding Header */}
        <div className="auth-branding">
          <div className="auth-brand-logo">
            <GraduationCap className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="auth-brand-title">Academic Intelligence</h1>
          <p className="auth-brand-subtitle">
            Bannari Amman Institute of Technology · Unified Portal Access
          </p>
        </div>

        {/* Main Card */}
        <div className="auth-card">
          {/* Segmented Control Tabs */}
          <div className="auth-segmented-tabs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                navigate('/login', { replace: true, state: location.state });
              }}
              className={`auth-tab-button ${!isRegister ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
                navigate('/register', { replace: true, state: location.state });
              }}
              className={`auth-tab-button ${isRegister ? 'active' : ''}`}
            >
              Register Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="auth-alert-error">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert-success">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegister && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-label">Account Email</label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@bit.edu"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <span className="auth-label-helper">Bcrypt Salted</span>
                </div>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="auth-toggle-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold-primary"
                style={{ width: '100%', height: '50px', marginTop: '0.5rem' }}
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {isRegister && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ramesh Sakthivel"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Account Email</label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ramesh@bit.edu"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Department / Unit</label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="auth-select"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-black text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <span className="auth-label-helper">Min. 8 characters</span>
                </div>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="auth-toggle-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div style={{
                padding: '10px 14px',
                backgroundColor: '#050505',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                fontSize: '0.72rem',
                color: '#a1a1aa'
              }}>
                <span style={{ color: '#facc15', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  Equal Platform Access:
                </span>
                All registered accounts receive instant access to all student analytics, ML risk models, and reporting tools.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold-primary"
                style={{ width: '100%', height: '50px' }}
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Access Portal</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
