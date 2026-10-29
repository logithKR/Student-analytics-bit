import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Search, RefreshCw, Trash2, Download, CheckCircle2,
  AlertTriangle, XCircle, Clock, Zap, Database, Terminal,
  Copy, Check, ChevronDown, ChevronUp, Code2, Sparkles,
  ArrowLeft, Layers, Info, Filter, ArrowUpDown, Key
} from 'lucide-react';
import { getAILogs, getAILogsStats, clearAILogs } from '../services/api';

const AILogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, success, error
  const [modeFilter, setModeFilter] = useState('all'); // all, chat_only, chat_viz, data_table

  // Expanded Log Card ID & active tabs for inspector
  const [expandedId, setExpandedId] = useState(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState({}); // { [logId]: 'response' | 'prompt' | 'plan' | 'data' | 'error' }

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState(null);

  // Confirm clear modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch logs and stats
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const [logsData, statsData] = await Promise.all([
        getAILogs({ limit: 100 }),
        getAILogsStats()
      ]);
      setLogs(logsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error("Failed to load AI logs:", err);
      setError("Unable to connect to the backend logging service. Ensure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (statusFilter !== 'all') {
      result = result.filter(l => l.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (modeFilter !== 'all') {
      result = result.filter(l => l.mode?.toLowerCase() === modeFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(l =>
        (l.question || '').toLowerCase().includes(q) ||
        (l.answer || '').toLowerCase().includes(q) ||
        (l.rawGroqResponse || '').toLowerCase().includes(q) ||
        (l.error || '').toLowerCase().includes(q) ||
        (l.modelUsed || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, statusFilter, modeFilter, search]);

  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
    if (!activeInspectorTab[id]) {
      setActiveInspectorTab(prev => ({ ...prev, [id]: 'response' }));
    }
  };

  const handleTabChange = (id, tab) => {
    setActiveInspectorTab(prev => ({ ...prev, [id]: tab }));
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      await clearAILogs();
      setLogs([]);
      setStats({
        totalQueries: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100.0,
        avgExecutionTimeMs: 0,
        lastQueryTime: null
      });
      setShowClearConfirm(false);
    } catch (err) {
      alert("Failed to clear logs: " + (err.response?.data?.detail || err.message));
    } finally {
      setClearing(false);
    }
  };

  const handleExportJSON = () => {
    if (!logs || logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((new Date() - date) / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* ── Top Navigation & Actions Bar ── */}
      <div style={{
        background: 'var(--theme-card-bg, #141414)',
        border: '1px solid var(--theme-border, #292929)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/ai-analytics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'var(--theme-surface-elevated, #1C1C1C)',
              color: 'var(--theme-text-secondary, #A3A3A3)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>AI Assistant</span>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)', margin: 0 }}>
                AI Query & Response Audit Log
              </h2>
              <span style={{
                background: 'var(--theme-accent, #FFD43B)',
                color: 'var(--theme-accent-text, #080808)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid var(--theme-accent, #FFD43B)'
              }}>
                Live Audit
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-secondary, #A3A3A3)', margin: '2px 0 0' }}>
              Inspect actual Groq LLM requests, raw JSON outputs, query plans, and database execution traces.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'var(--theme-card-bg, #141414)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              color: 'var(--theme-text-secondary, #A3A3A3)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'var(--theme-card-bg, #141414)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              color: 'var(--theme-text-secondary, #A3A3A3)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: logs.length === 0 ? 0.6 : 1
            }}
          >
            <Download size={15} />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={logs.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: logs.length === 0 ? 0.6 : 1
            }}
          >
            <Trash2 size={15} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* ── Department & Database Coverage Explainer Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid rgba(255, 212, 59, 0.3)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <div style={{ background: '#10b981', color: '#fff', borderRadius: '8px', padding: '6px', marginTop: '2px' }}>
          <Database size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46', margin: '0 0 0.25rem' }}>
            Active Database Coverage: 20 Departments (7,293 Student Records Loaded)
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--theme-text-secondary, #A3A3A3)', margin: 0, lineHeight: 1.5 }}>
            The application dynamically scans and loads all Excel spreadsheets located inside <code style={{ background: 'var(--theme-card-bg, #141414)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--theme-border, #292929)' }}>backend/data/UG/</code>.
            Currently, the database has indexed <strong>7,293 student records</strong> across all <strong>20 departments</strong>:
            <span style={{ fontWeight: 600, color: '#1e3a8a', marginLeft: '4px' }}>
              AD, AG, AL, BM, BT, CB, CD, CE, CS, CT, EC, EE, EI, FD, FT, ISE, IT, MC, ME, TT
            </span>.
            Natural language queries across these cohorts now query all 20 departments in real time.
          </p>
        </div>
      </div>

      {/* ── Telemetry & Overview Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>TOTAL QUERIES</span>
            <div style={{ background: 'var(--theme-surface-elevated, #1C1C1C)', padding: '6px', borderRadius: '8px', color: 'var(--theme-text-secondary, #A3A3A3)' }}>
              <Terminal size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
            {stats?.totalQueries ?? logs.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>Audit log entries stored</span>
        </div>

        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>SUCCESS RATE</span>
            <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '8px', color: '#059669' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>
            {stats?.successRate ?? 100}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>
            {stats?.successCount ?? 0} successful executions
          </span>
        </div>

        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>FAILED QUERIES</span>
            <div style={{ background: '#fef2f2', padding: '6px', borderRadius: '8px', color: '#dc2626' }}>
              <XCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: (stats?.errorCount || 0) > 0 ? '#dc2626' : '#0f172a' }}>
            {stats?.errorCount ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>API or parsing errors</span>
        </div>

        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>AVG LATENCY</span>
            <div style={{ background: 'rgba(255, 212, 59, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--theme-accent, #FFD43B)' }}>
              <Zap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--theme-accent, #FFD43B)' }}>
            {stats?.avgExecutionTimeMs ? `${stats.avgExecutionTimeMs} ms` : '—'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>Round-trip Groq + DB</span>
        </div>

        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>ACTIVE LLM</span>
            <div style={{ background: '#faf5ff', padding: '6px', borderRadius: '8px', color: '#9333ea' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#9333ea', wordBreak: 'break-all' }}>
            gpt-oss-120b
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>Groq Cloud Inference</span>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div style={{
        background: 'var(--theme-card-bg, #141414)',
        border: '1px solid var(--theme-border, #292929)',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--theme-surface-elevated, #1C1C1C)',
            border: '1px solid var(--theme-border, #292929)',
            borderRadius: '8px',
            padding: '0.45rem 0.75rem',
            flex: 1
          }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search user query, response, raw Groq JSON, or error..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.825rem',
                width: '100%',
                color: 'var(--theme-text-primary, #FFFFFF)'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All Status' },
              { id: 'success', label: 'Success' },
              { id: 'error', label: 'Error' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  border: 'none',
                  background: statusFilter === tab.id ? '#ffffff' : 'transparent',
                  color: statusFilter === tab.id ? '#0f172a' : '#64748b',
                  fontSize: '0.775rem',
                  fontWeight: statusFilter === tab.id ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mode Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'chat_viz', label: 'Chat + Viz' },
              { id: 'chat_only', label: 'Chat Only' },
              { id: 'data_table', label: 'Table' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModeFilter(tab.id)}
                style={{
                  border: 'none',
                  background: modeFilter === tab.id ? '#ffffff' : 'transparent',
                  color: modeFilter === tab.id ? '#0f172a' : '#64748b',
                  fontSize: '0.775rem',
                  fontWeight: modeFilter === tab.id ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: modeFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 500 }}>
            Showing {filteredLogs.length} of {logs.length} entries
          </span>
        </div>
      </div>

      {/* ── Log Entries Stream ── */}
      {loading ? (
        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--theme-text-secondary, #A3A3A3)'
        }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading AI query audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{
          background: 'var(--theme-card-bg, #141414)',
          border: '1px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <Terminal size={36} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--theme-text-primary, #FFFFFF)', marginBottom: '0.5rem' }}>
            No Audit Logs Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-secondary, #A3A3A3)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {search || statusFilter !== 'all' || modeFilter !== 'all'
              ? "No queries match your current filter criteria. Try clearing filters or search terms."
              : "No AI queries have been recorded yet in this session. Head to the AI Analytics page and run a question to see real Groq outputs and query plans logged here!"}
          </p>
          <Link
            to="/ai-analytics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.25rem',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <Sparkles size={16} />
            <span>Go to AI Assistant</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const currentTab = activeInspectorTab[log.id] || 'response';
            const isSuccess = log.status === 'success';

            return (
              <div
                key={log.id}
                style={{
                  background: 'var(--theme-card-bg, #141414)',
                  border: isExpanded ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isExpanded ? '0 4px 12px rgba(59, 130, 246, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* ── Entry Header Row ── */}
                <div
                  onClick={() => handleToggleExpand(log.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    background: isExpanded ? '#fafcff' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '300px' }}>
                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSuccess ? '#ecfdf5' : '#fef2f2',
                      color: isSuccess ? '#059669' : '#dc2626',
                      flexShrink: 0
                    }}>
                      {isSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                          "{log.question}"
                        </span>
                        {/* Mode Pill */}
                        <span style={{
                          background: 'var(--theme-surface-elevated, #1C1C1C)',
                          color: 'var(--theme-text-secondary, #A3A3A3)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}>
                          {log.mode === 'chat_viz' ? 'Chat + Viz' : log.mode === 'data_table' ? 'Data Table' : 'Chat Only'}
                        </span>

                        {log.intent && (
                          <span style={{
                            background: 'var(--theme-accent, #FFD43B)',
                            color: 'var(--theme-accent-text, #080808)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            {log.intent}
                          </span>
                        )}

                        {log.keyUsed && (
                          <span style={{
                            background: 'var(--theme-surface-elevated, #1C1C1C)',
                            border: '1px solid var(--theme-border, #292929)',
                            color: 'var(--theme-text-secondary, #A3A3A3)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Key size={11} color="#64748b" />
                            {log.keyUsed}
                          </span>
                        )}

                        {log.failoverLog && log.failoverLog.length > 0 && (
                          <span style={{
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Zap size={11} color="#b45309" />
                            Failover ({log.failoverLog.length})
                          </span>
                        )}

                        {log.errorStage && (
                          <span style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            Stage: {log.errorStage}
                          </span>
                        )}
                      </div>

                      {/* Brief Answer Preview (when collapsed) */}
                      {!isExpanded && (
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--theme-text-secondary, #A3A3A3)',
                          margin: '0.25rem 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '850px'
                        }}>
                          {log.error ? `Error: ${log.error}` : log.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata & Expand Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
                        <Clock size={12} />
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      <span>
                        {log.executionTimeMs ? `${log.executionTimeMs} ms` : '—'} · {log.modelUsed || 'openai/gpt-oss-120b'}
                      </span>
                    </div>

                    <div style={{
                      color: 'var(--theme-text-secondary, #A3A3A3)',
                      background: 'var(--theme-surface-elevated, #1C1C1C)',
                      borderRadius: '6px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* ── Expanded Deep-Dive Audit Inspector ── */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderTop: '1px solid #e2e8f0' }}>
                    
                    {/* Inspector Tabs */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      borderBottom: '1px solid var(--theme-border, #292929)',
                      paddingBottom: '0.75rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      {[
                        { id: 'response', label: 'Raw Groq LLM Output', icon: Terminal },
                        { id: 'answer', label: 'Final Answer', icon: CheckCircle2 },
                        { id: 'prompt', label: 'Raw Groq Prompt', icon: Code2 },
                        { id: 'plan', label: 'Query Plan & Graph Spec', icon: Layers },
                        { id: 'data', label: `Database Results (${log.rowsCount || 0})`, icon: Database },
                        ...(log.failoverLog && log.failoverLog.length > 0 ? [{ id: 'failover', label: `Failover Events (${log.failoverLog.length})`, icon: Zap }] : []),
                        ...(log.error ? [{ id: 'error', label: 'Error Diagnostics', icon: AlertTriangle }] : [])
                      ].map(tab => {
                        const Icon = tab.icon;
                        const isTabActive = currentTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(log.id, tab.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '7px',
                              border: isTabActive ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                              background: isTabActive ? '#2563eb' : '#ffffff',
                              color: isTabActive ? '#ffffff' : '#475569',
                              fontSize: '0.775rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ── Tab 1: Raw Groq LLM Output ── */}
                    {currentTab === 'response' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                              Exact String Returned by Groq ({log.modelUsed})
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              Live Groq Response
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.rawGroqResponse, `res_${log.id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.65rem',
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedKey === `res_${log.id}` ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            <span>{copiedKey === `res_${log.id}` ? 'Copied!' : 'Copy Raw Output'}</span>
                          </button>
                        </div>

                        {log.rawGroqResponse ? (
                          <pre style={{
                            background: '#0f172a',
                            color: '#38bdf8',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            overflowX: 'auto',
                            maxHeight: '380px',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                          }}>
                            {log.rawGroqResponse}
                          </pre>
                        ) : (
                          <div style={{ padding: '1.5rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '8px', color: 'var(--theme-text-secondary, #A3A3A3)', fontSize: '0.85rem' }}>
                            No raw Groq response captured (request may have failed prior to receiving completion).
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Tab 2: Final Grounded Answer ── */}
                    {currentTab === 'answer' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                            Rendered AI Response to Faculty
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.answer, `ans_${log.id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.65rem',
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedKey === `ans_${log.id}` ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            <span>{copiedKey === `ans_${log.id}` ? 'Copied!' : 'Copy Answer'}</span>
                          </button>
                        </div>
                        <div style={{
                          background: 'var(--theme-card-bg, #141414)',
                          border: '1px solid var(--theme-border, #292929)',
                          borderRadius: '8px',
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: 'var(--theme-text-primary, #FFFFFF)',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {log.answer || 'No textual answer recorded.'}
                        </div>
                      </div>
                    )}

                    {/* ── Tab 3: Raw Groq Prompt ── */}
                    {currentTab === 'prompt' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                            Full Prompt Sent to Groq (System & Schema Instructions)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.rawGroqPrompt, `prompt_${log.id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.65rem',
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedKey === `prompt_${log.id}` ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            <span>{copiedKey === `prompt_${log.id}` ? 'Copied!' : 'Copy Prompt'}</span>
                          </button>
                        </div>
                        <pre style={{
                          background: '#1e293b',
                          color: '#e2e8f0',
                          padding: '1rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          lineHeight: 1.5,
                          overflowX: 'auto',
                          maxHeight: '380px',
                          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {log.rawGroqPrompt || 'No prompt payload available.'}
                        </pre>
                      </div>
                    )}

                    {/* ── Tab 4: Query Plan & Graph Spec ── */}
                    {currentTab === 'plan' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                              Structured Query Plan (Parsed)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(log.queryPlan, `qp_${log.id}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.5rem',
                                background: 'var(--theme-card-bg, #141414)',
                                border: '1px solid var(--theme-border, #292929)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--theme-text-secondary, #A3A3A3)',
                                cursor: 'pointer'
                              }}
                            >
                              {copiedKey === `qp_${log.id}` ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                              <span>Copy Plan</span>
                            </button>
                          </div>
                          <pre style={{
                            background: '#0f172a',
                            color: '#a7f3d0',
                            padding: '0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.775rem',
                            lineHeight: 1.45,
                            overflowX: 'auto',
                            maxHeight: '300px',
                            fontFamily: 'Consolas, Monaco, monospace'
                          }}>
                            {log.queryPlan ? JSON.stringify(log.queryPlan, null, 2) : '// No query plan generated'}
                          </pre>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                              Graph Specification (Chart Config)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(log.graphSpecification, `gs_${log.id}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.5rem',
                                background: 'var(--theme-card-bg, #141414)',
                                border: '1px solid var(--theme-border, #292929)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--theme-text-secondary, #A3A3A3)',
                                cursor: 'pointer'
                              }}
                            >
                              {copiedKey === `gs_${log.id}` ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                              <span>Copy Spec</span>
                            </button>
                          </div>
                          <pre style={{
                            background: '#0f172a',
                            color: '#fde047',
                            padding: '0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.775rem',
                            lineHeight: 1.45,
                            overflowX: 'auto',
                            maxHeight: '300px',
                            fontFamily: 'Consolas, Monaco, monospace'
                          }}>
                            {log.graphSpecification ? JSON.stringify(log.graphSpecification, null, 2) : '// No graph specification generated'}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* ── Tab 5: Database Results & Data Snippet ── */}
                    {currentTab === 'data' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                            Database Grounded Result Rows ({log.rowsCount || 0} total records)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.dataSnippet, `data_${log.id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.65rem',
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedKey === `data_${log.id}` ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            <span>{copiedKey === `data_${log.id}` ? 'Copied!' : 'Copy Rows JSON'}</span>
                          </button>
                        </div>

                        {log.dataSnippet && log.dataSnippet.length > 0 ? (
                          <div style={{ overflowX: 'auto', background: 'var(--theme-card-bg, #141414)', border: '1px solid var(--theme-border, #292929)', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ background: 'var(--theme-surface-elevated, #1C1C1C)', borderBottom: '1px solid #cbd5e1' }}>
                                  {Object.keys(log.dataSnippet[0]).map(col => (
                                    <th key={col} style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)' }}>
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {log.dataSnippet.map((row, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {Object.values(row).map((val, cIdx) => (
                                      <td key={cIdx} style={{ padding: '0.55rem 0.85rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>
                                        {val !== null && val !== undefined ? String(val) : '—'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div style={{ padding: '1.5rem', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '8px', color: 'var(--theme-text-secondary, #A3A3A3)', fontSize: '0.85rem', textAlign: 'center' }}>
                            No tabular data was retrieved for this query (e.g. conversational prompt or zero-record filter match).
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Tab 6: Error Diagnostics (if failed) ── */}
                    {currentTab === 'error' && log.error && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <AlertTriangle size={18} color="#dc2626" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991b1b' }}>
                            Error Diagnostic Details
                          </span>
                        </div>
                        <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#7f1d1d' }}>
                          <strong>Stage:</strong> {log.errorStage || 'unknown'} · <strong>Type:</strong> {log.errorType || 'AIAppError'}
                        </div>
                        <pre style={{
                          background: '#450a0a',
                          color: '#fecaca',
                          padding: '0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          lineHeight: 1.45,
                          overflowX: 'auto',
                          fontFamily: 'Consolas, Monaco, monospace',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {log.error}
                        </pre>
                        {log.debugInfo && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b' }}>Debug Trace:</span>
                            <pre style={{
                              background: 'var(--theme-card-bg, #141414)',
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              border: '1px solid #fecaca',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              marginTop: '0.25rem'
                            }}>
                              {JSON.stringify(log.debugInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Tab 7: Failover Events ── */}
                    {currentTab === 'failover' && log.failoverLog && log.failoverLog.length > 0 && (
                      <div style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        padding: '1.25rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={18} color="#b45309" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>
                              Automated Rate-Limit Failover Sequence ({log.failoverLog.length} {log.failoverLog.length === 1 ? 'attempt' : 'attempts'})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#78350f', background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                            Final Key Used: {log.keyUsed || 'N/A'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#78350f', margin: '0 0 1rem', lineHeight: 1.5 }}>
                          When Groq API rate limits (HTTP 429) are encountered, the engine systematically switches across configured API keys and models before surfacing an error.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {log.failoverLog.map((attempt, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'var(--theme-card-bg, #141414)',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                padding: '0.85rem 1rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>
                                    Model: <code style={{ color: 'var(--theme-accent, #FFD43B)' }}>{attempt.model}</code>
                                  </span>
                                  <span style={{
                                    fontSize: '0.725rem',
                                    color: 'var(--theme-text-secondary, #A3A3A3)',
                                    background: 'var(--theme-surface-elevated, #1C1C1C)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    Key: {attempt.key} {attempt.keyIndex ? `(#${attempt.keyIndex})` : ''}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: attempt.reason === 'rate_limit_exceeded' ? '#b45309' : '#dc2626',
                                  background: attempt.reason === 'rate_limit_exceeded' ? '#fef3c7' : '#fef2f2',
                                  padding: '2px 7px',
                                  borderRadius: '4px'
                                }}>
                                  {attempt.reason?.replace(/_/g, ' ').toUpperCase() || 'FAILOVER'}
                                </span>
                              </div>
                              {attempt.error && (
                                <pre style={{
                                  margin: '0.35rem 0 0',
                                  fontSize: '0.75rem',
                                  color: '#78350f',
                                  background: '#fffbeb',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  overflowX: 'auto',
                                  fontFamily: 'Consolas, Monaco, monospace',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {attempt.error}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirmation Modal for Clear Logs ── */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--theme-card-bg, #141414)',
            borderRadius: '14px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '10px' }}>
                <Trash2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)', margin: 0 }}>
                Clear All Audit Logs?
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-secondary, #A3A3A3)', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              This will permanently delete all stored AI query prompts, raw Groq LLM responses, query plans, and execution telemetry from memory and disk.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                style={{
                  padding: '0.55rem 1rem',
                  background: 'var(--theme-surface-elevated, #1C1C1C)',
                  border: '1px solid var(--theme-border, #292929)',
                  borderRadius: '8px',
                  color: 'var(--theme-text-secondary, #A3A3A3)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing}
                style={{
                  padding: '0.55rem 1rem',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: clearing ? 'not-allowed' : 'pointer'
                }}
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILogs;
