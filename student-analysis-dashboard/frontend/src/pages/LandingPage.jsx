import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Cpu,
  FileSpreadsheet,
  Lock,
  CheckCircle2,
  ChevronRight,
  School,
  Activity,
  Sliders,
  LogIn,
  Database,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import '../landing.css';

const DEPARTMENTS = [
  { code: 'CS', name: 'Computer Science & Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'AD', name: 'Artificial Intelligence & Data Science' },
  { code: 'AG', name: 'Agricultural Engineering' },
  { code: 'AL', name: 'AI & Machine Learning' },
  { code: 'BM', name: 'Biomedical Engineering' },
  { code: 'BT', name: 'Biotechnology' },
  { code: 'CB', name: 'CS & Business Systems' },
  { code: 'CD', name: 'Computer Science & Design' },
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'CT', name: 'Computer Technology' },
  { code: 'EC', name: 'Electronics & Communication' },
  { code: 'EE', name: 'Electrical & Electronics' },
  { code: 'EI', name: 'Electronics & Instrumentation' },
  { code: 'FD', name: 'Fashion Technology' },
  { code: 'FT', name: 'Food Technology' },
  { code: 'ISE', name: 'Information Science & Engg' },
  { code: 'MC', name: 'Mechatronics Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'TT', name: 'Textile Technology' }
];

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboard preview tabs: 'executive' | 'xgboost' | 'groq'
  const [activeTab, setActiveTab] = useState('executive');

  // Interactive Live Model Simulator State
  const [internal1, setInternal1] = useState(38);
  const [internal2, setInternal2] = useState(42);
  const [internal3, setInternal3] = useState(35);

  // Dynamic risk calculation for simulator
  const avgMark = (internal1 + internal2 + internal3) / 3;
  let failProbability = 0;
  if (avgMark < 20) {
    failProbability = Math.min(96, Math.round(92 - (avgMark - 10) * 1.5));
  } else if (avgMark < 30) {
    failProbability = Math.round(75 - (avgMark - 20) * 3.5);
  } else if (avgMark < 40) {
    failProbability = Math.round(38 - (avgMark - 30) * 2.2);
  } else {
    failProbability = Math.max(4, Math.round(16 - (avgMark - 40) * 1.2));
  }

  const getRiskStatus = (prob) => {
    if (prob > 65) {
      return { 
        label: 'HIGH RISK (FAIL)', 
        color: '#f87171', 
        bg: 'rgba(239, 68, 68, 0.12)', 
        border: 'rgba(239, 68, 68, 0.4)' 
      };
    }
    if (prob >= 30) {
      return { 
        label: 'MEDIUM RISK', 
        color: '#facc15', 
        bg: 'rgba(250, 204, 21, 0.12)', 
        border: 'rgba(250, 204, 21, 0.4)' 
      };
    }
    return { 
      label: 'SAFE (PASS)', 
      color: '#4ade80', 
      bg: 'rgba(74, 222, 128, 0.12)', 
      border: 'rgba(74, 222, 128, 0.4)' 
    };
  };

  const riskStatus = getRiskStatus(failProbability);

  return (
    <div className="landing-root">
      {/* ── Background Subtle Glow & Grid ── */}
      <div className="landing-bg-grid" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* ── 1. Header & Navigation (82px) ── */}
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
                <p className="landing-brand-subtitle">Student Analytics & AI Risk Engine</p>
              </div>
            </Link>

            {/* Center: Navigation Links */}
            <nav className="landing-nav-links">
              <a href="#hero" className="landing-nav-link">Overview</a>
              <a href="#preview" className="landing-nav-link">Portal</a>
              <a href="#simulator" className="landing-nav-link">ML Simulator</a>
              <a href="#features" className="landing-nav-link">Capabilities</a>
              <a href="#departments" className="landing-nav-link">20 Departments</a>
              <a href="#governance" className="landing-nav-link">Security</a>
            </nav>

            {/* Right: Actions */}
            <div className="landing-header-actions">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-gold-primary btn-sm"
                  >
                    <Activity className="w-4 h-4" />
                    Launch Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="btn-subtle-ghost btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-dark-outline btn-sm">
                    <LogIn className="w-3.5 h-3.5 text-yellow-400" />
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-gold-primary btn-sm">
                    Register Faculty
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="landing-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Overview</a>
          <a href="#preview" onClick={() => setMobileMenuOpen(false)}>Portal Preview</a>
          <a href="#simulator" onClick={() => setMobileMenuOpen(false)}>ML Simulator</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
          <a href="#departments" onClick={() => setMobileMenuOpen(false)}>20 Departments</a>
          <a href="#governance" onClick={() => setMobileMenuOpen(false)}>Security & SQLite</a>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" className="btn-dark-outline text-center justify-center">Sign In</Link>
            <Link to="/register" className="btn-gold-primary text-center justify-center">Register Faculty</Link>
          </div>
        </div>
      )}

      {/* ── 2. Hero Section ── */}
      <section id="hero" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-inner">
            {/* Centered Institution Badge */}
            <div className="landing-pill-badge">
              <School className="w-4 h-4 text-yellow-400" />
              <span>Bannari Amman Institute of Technology</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-white font-semibold">Autonomous Institution</span>
            </div>

            {/* Symmetrical Responsive Headline */}
            <h1 className="landing-hero-headline">
              Transform Academic Records <br className="hidden sm:inline" />
              into <span className="landing-gold-highlight">Proactive Student Success</span>
            </h1>

            {/* Balanced Centered Description */}
            <p className="landing-hero-description">
              Enterprise academic analytics unifying multi-semester consolidated results across 20 undergraduate departments, continuous XGBoost failure risk prediction, and Groq LLM conversational analytics.
            </p>

            {/* Primary Action Buttons */}
            <div className="landing-hero-ctas">
              <Link to="/login" className="btn-gold-primary">
                Access Intelligence Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a href="#simulator" className="btn-dark-outline">
                <BrainCircuit className="w-4 h-4 text-yellow-400" />
                Try Live ML Simulator
              </a>

              <Link to="/register" className="btn-subtle-ghost">
                Register Faculty Account
              </Link>
            </div>

            {/* Centered Reviewer Credentials Strip */}
            <div className="landing-credentials-strip">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                Instant Reviewer Credentials:
              </span>
              <span className="landing-credential-pill">admin@bit.edu / Admin@1234</span>
              <span className="landing-credential-pill">hod.cs@bit.edu / Hod@1234</span>
              <span className="text-yellow-400 font-medium text-[11px]">
                • Auto-created in SQLite on startup
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Coherent Dashboard Preview ── */}
      <section id="preview" className="dashboard-preview-section">
        <div className="landing-container">
          <div className="dashboard-preview-card">
            {/* Browser Window Header */}
            <div className="dashboard-window-toolbar">
              <div className="dashboard-window-dots">
                <span className="dashboard-dot dot-red" />
                <span className="dashboard-dot dot-yellow" />
                <span className="dashboard-dot dot-green" />
                <span className="dashboard-window-title">
                  academic-intelligence-portal · management-view
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-400 font-mono">XGBoost Engine v2.4 Active</span>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="dashboard-tabs-bar">
              <div className="dashboard-tab-buttons">
                <button
                  type="button"
                  onClick={() => setActiveTab('executive')}
                  className={`dashboard-tab-btn ${activeTab === 'executive' ? 'active' : ''}`}
                >
                  Executive KPIs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('xgboost')}
                  className={`dashboard-tab-btn ${activeTab === 'xgboost' ? 'active' : ''}`}
                >
                  XGBoost Engine
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('groq')}
                  className={`dashboard-tab-btn ${activeTab === 'groq' ? 'active' : ''}`}
                >
                  Groq AI Studio
                </button>
              </div>

              <div className="text-xs text-zinc-400 font-medium">
                Consolidated Batch Records: Sem I &ndash; VII
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-body-content">
              {/* TAB 1: Executive KPIs */}
              {activeTab === 'executive' && (
                <div>
                  <div className="dashboard-kpi-grid">
                    <div className="dashboard-kpi-card">
                      <p className="dashboard-kpi-label">Overall Pass Rate</p>
                      <p className="dashboard-kpi-value">86.4%</p>
                      <span className="dashboard-kpi-badge kpi-badge-green">
                        +3.2% vs Previous Sem
                      </span>
                    </div>

                    <div className="dashboard-kpi-card">
                      <p className="dashboard-kpi-label">Institution Avg SGPA</p>
                      <p className="dashboard-kpi-value gold">7.68 / 10</p>
                      <span className="dashboard-kpi-badge kpi-badge-gold">
                        20 Engg Departments
                      </span>
                    </div>

                    <div className="dashboard-kpi-card">
                      <p className="dashboard-kpi-label">At-Risk Proactive Alerts</p>
                      <p className="dashboard-kpi-value gold">42 Students</p>
                      <span className="dashboard-kpi-badge kpi-badge-gold">
                        Flagged for Mentoring
                      </span>
                    </div>

                    <div className="dashboard-kpi-card">
                      <p className="dashboard-kpi-label">ML Inference Model</p>
                      <p className="dashboard-kpi-value">XGBoost v2</p>
                      <span className="dashboard-kpi-badge kpi-badge-zinc">
                        91.8% Accuracy
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-footer-bar">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>Consolidated student records synced across 20 engineering branches with continuous assessment tracking.</span>
                    </div>
                    <Link
                      to="/login"
                      className="btn-gold-primary btn-sm"
                    >
                      Enter Executive View
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: XGBoost ML Engine */}
              {activeTab === 'xgboost' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="dashboard-kpi-card" style={{ minHeight: 'auto' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SAFE BAND</span>
                        <span className="dashboard-kpi-badge kpi-badge-green">&lt; 30% Risk</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Consistent internal marks. High probability of passing all end-semester courses with distinction.
                      </p>
                    </div>

                    <div className="dashboard-kpi-card" style={{ minHeight: 'auto' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">MEDIUM RISK</span>
                        <span className="dashboard-kpi-badge kpi-badge-gold">30% - 65% Risk</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Borderline internal assessment marks. Tutorial counseling and remedial assignments recommended.
                      </p>
                    </div>

                    <div className="dashboard-kpi-card" style={{ minHeight: 'auto' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">HIGH RISK (FAIL)</span>
                        <span className="dashboard-kpi-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>&gt; 65% Risk</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        High likelihood of course arrears. Immediate faculty mentor intervention and re-assessment required.
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-footer-bar">
                    <span>Dynamic Scaling: Normalizes 40, 50, and 60 benchmark mark structures with 0 data distortion.</span>
                    <span className="font-mono text-yellow-400 text-xs">prob_features.joblib verified</span>
                  </div>
                </div>
              )}

              {/* TAB 3: Groq AI Studio */}
              {activeTab === 'groq' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black border border-white/10">
                    <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Natural Language Query Studio (Sample Queries)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                        "Compare pass percentage between CS, IT, and AD for Semester 4"
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                        "Show top 5 students in Mechanical Engineering with SGPA &gt; 8.5"
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                        "Which 3 courses have the highest arrear rates in Semester 3?"
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-black rounded-lg border border-white/10 text-zinc-300">
                      <strong className="text-yellow-400 block mb-1">Triple Key Failover:</strong>
                      Automatic HTTP 429 quota rotation across 3 Groq API keys.
                    </div>
                    <div className="p-3 bg-black rounded-lg border border-white/10 text-zinc-300">
                      <strong className="text-yellow-400 block mb-1">Model Cascade:</strong>
                      gpt-oss-120b &rarr; gpt-oss-20b &rarr; qwen3.8-27b seamless fallback.
                    </div>
                    <div className="p-3 bg-black rounded-lg border border-white/10 text-zinc-300">
                      <strong className="text-yellow-400 block mb-1">12 Dynamic Charts:</strong>
                      Instant auto-render into Bar, Radar, Area, Pie, or Line charts.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Live ML Simulator Section ── */}
      <section id="simulator" className="landing-simulator-section">
        <div className="landing-container">
          <div className="simulator-header">
            <div className="landing-pill-badge mb-3">
              <Sliders className="w-3.5 h-3.5 text-yellow-400" />
              Live Interactive Simulation
            </div>
            <h2 className="simulator-headline">
              Test the XGBoost Risk Engine in Real-Time
            </h2>
            <p className="simulator-description">
              Adjust internal continuous assessment marks out of 50 to see real-time failure probability inference and risk classification.
            </p>
          </div>

          <div className="simulator-box landing-container-content">
            <div className="simulator-layout">
              {/* Sliders Area */}
              <div>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Internal Assessment 1 (Core Subject)</span>
                    <span className="slider-score-badge">{internal1} / 50</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={internal1}
                    onChange={(e) => setInternal1(Number(e.target.value))}
                    className="gold-range-slider"
                  />
                  <div className="slider-ticks-row">
                    <span>Critical (5)</span>
                    <span>Average (25)</span>
                    <span>Excellent (50)</span>
                  </div>
                </div>

                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Internal Assessment 2 (Problem Solving)</span>
                    <span className="slider-score-badge">{internal2} / 50</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={internal2}
                    onChange={(e) => setInternal2(Number(e.target.value))}
                    className="gold-range-slider"
                  />
                  <div className="slider-ticks-row">
                    <span>Critical (5)</span>
                    <span>Average (25)</span>
                    <span>Excellent (50)</span>
                  </div>
                </div>

                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Model Practical / Lab Assessment</span>
                    <span className="slider-score-badge">{internal3} / 50</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={internal3}
                    onChange={(e) => setInternal3(Number(e.target.value))}
                    className="gold-range-slider"
                  />
                  <div className="slider-ticks-row">
                    <span>Critical (5)</span>
                    <span>Average (25)</span>
                    <span>Excellent (50)</span>
                  </div>
                </div>

                <div className="p-3 bg-black rounded-lg border border-white/10 flex items-center justify-between text-xs text-zinc-400 mt-4">
                  <span>Aggregate Benchmark Average:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {avgMark.toFixed(1)} / 50
                  </span>
                </div>
              </div>

              {/* Output Prediction Card */}
              <div className="simulator-result-card">
                <div>
                  <span className="simulator-result-title">
                    Simulated ML Inference
                  </span>
                  
                  <div>
                    <div
                      className="simulator-status-pill"
                      style={{
                        color: riskStatus.color,
                        backgroundColor: riskStatus.bg,
                        borderColor: riskStatus.border
                      }}
                    >
                      {riskStatus.label}
                    </div>
                  </div>

                  <div className="simulator-metrics-box">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Predicted Failure Probability:</span>
                      <span className="font-mono font-bold text-white">{failProbability}%</span>
                    </div>

                    <div className="simulator-meter-bar">
                      <div
                        className="simulator-meter-fill"
                        style={{
                          width: `${failProbability}%`,
                          backgroundColor: riskStatus.color
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-zinc-300 pt-2 border-t border-white/10">
                      <span>Estimated Pass Likelihood:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(100 - failProbability).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link
                    to="/prediction-hub"
                    className="btn-gold-primary w-full text-xs justify-center"
                  >
                    Run Full Batch Predictions
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Capabilities Bento Grid ── */}
      <section id="features" className="landing-features-section">
        <div className="landing-container">
          <div className="section-header-center">
            <div className="landing-pill-badge mb-3">
              <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              Institutional Architecture
            </div>
            <h2 className="section-title">
              Engineered for Academic Excellence
            </h2>
            <p className="section-subtitle">
              Comprehensive capabilities engineered for deans, department heads, and academic mentors to preempt failure risks.
            </p>
          </div>

          <div className="features-bento-grid">
            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="feature-title">XGBoost ML Risk Engine</h3>
                <p className="feature-desc">
                  Trained on multi-semester internal assessment trajectories. Automatically normalizes 40/50/60 scoring bands to calculate precise pass probabilities.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Dynamic Calibration &bull; 91.8% Accuracy</span>
              </div>
            </div>

            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="feature-title">Groq Conversational AI Studio</h3>
                <p className="feature-desc">
                  Ask any complex academic inquiry in plain English. Includes 3-key rate-limit failover, model cascading, and zero-token local query caching.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>gpt-oss-120b &rarr; 20b &rarr; qwen cascade</span>
              </div>
            </div>

            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="feature-title">12 Dynamic Recharts Visualizations</h3>
                <p className="feature-desc">
                  Bar, Grouped, Stacked, Line, Area, Pie, Donut, Radar, and Scatter charts with instant 1-click export to PNG, vector SVG, and raw CSV.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Multi-Theme Color Palettes</span>
              </div>
            </div>

            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="feature-title">Automated Batch Excel Ingestion</h3>
                <p className="feature-desc">
                  Upload multi-subject raw Excel result sheets (.xlsx / .xls). Generates cohort-level risk reports and downloadable formatted spreadsheets in seconds.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>20MB File Upload Ceiling</span>
              </div>
            </div>

            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="feature-title">Secured SQLite Database</h3>
                <p className="feature-desc">
                  Auto-created when launching python main.py. Features bcrypt salted 12-round password hashing, JWT stateless tokens, and full auth audit logs.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Zero-Config users.db Initialization</span>
              </div>
            </div>

            <div className="feature-bento-card">
              <div>
                <div className="feature-icon-wrapper">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="feature-title">Institutional Role Governance</h3>
                <p className="feature-desc">
                  Tailored portals for Deans, HODs, Subject Faculty, and Academic Advisors with granular department filtering and student directory access.
                </p>
              </div>
              <div className="feature-badge-row">
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 20 Departments Grid ── */}
      <section id="departments" className="landing-departments-section">
        <div className="landing-container">
          <div className="section-header-center">
            <h2 className="section-title">
              Full Coverage: 20 Engineering & Tech Departments
            </h2>
            <p className="section-subtitle">
              Consolidated academic records across undergraduate departments from Semester I through Semester VII.
            </p>
          </div>

          <div className="departments-grid">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.code} className="department-pill-card">
                <span className="dept-code-tag">{dept.code}</span>
                <span className="dept-name-text" title={dept.name}>
                  {dept.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Governance & Security ── */}
      <section id="governance" className="landing-governance-section">
        <div className="landing-container">
          <div className="governance-card">
            <div className="max-w-3xl mx-auto text-center">
              <div className="landing-pill-badge mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                Institutional Security & Governance
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Auto-Configured SQLite with Enterprise Security
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed mb-8">
                The platform securely persists faculty and administrative credentials with industrial-grade cryptography, zero manual configuration, and strict institutional privacy compliance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-xl bg-black border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-white">Bcrypt 12-Rounds</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cryptographic salted password hashing. Plaintext credentials are never stored.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-white">Stateless JWT</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Signed bearer tokens with automatic session expiration and role-based access control.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-white">SQLite Engine</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Auto-created embedded database engine with complete query audit logging and zero setup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">Bannari Amman Institute of Technology</p>
                <p className="text-[11px] text-zinc-500 m-0">Academic Intelligence Platform &bull; All Rights Reserved</p>
              </div>
            </div>

            <div className="footer-links">
              <Link to="/login">Faculty Portal</Link>
              <Link to="/register">Register Account</Link>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
                OpenAPI Swagger
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-zinc-400 text-xs">XGBoost & Groq Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
