import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Send, Bot, User, Database, Download,
  Code, ChevronDown, ChevronUp, AlertCircle, RotateCcw,
  MessageSquare, BarChart3, Table2, Search, ArrowUpDown,
  CheckCircle, HelpCircle, Layers, ArrowRight, AlertTriangle, ShieldAlert,
  FileText
} from 'lucide-react';
import { queryAI } from '../services/api';
import DynamicChartRenderer from '../components/charts/DynamicChartRenderer';
import ChartConfigPanel from '../components/charts/ChartConfigPanel';

const PROMPTS_BY_MODE = {
  chat_only: [
    "What does GPA mean and how is risk evaluated?",
    "Summarize the academic performance of CSE vs IT",
    "How are internal and external marks weighted?",
    "What intervention is recommended for students with backlogs?"
  ],
  chat_viz: [
    "Top 5 performing departments based on average percentage",
    "Compare pass and fail students for each department",
    "What percentage of students are in each performance category?",
    "Show average marks for each subject",
    "Semester SGPA progression trends",
    "Grade distribution breakdown"
  ],
  data_table: [
    "Top 10 academic achievers ranked by GPA",
    "List all students with active arrears",
    "Show CSE semester V student marks",
    "Overall department student summary"
  ]
};

const AIAnalytics = () => {
  // Mode Selection: 'chat_only' | 'chat_viz' | 'data_table'
  const [mode, setMode] = useState('chat_viz');

  // Conversation State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your Academic Intelligence AI Assistant. You can ask me conceptual questions, analyze university student records, or examine cohort metrics. Choose your preferred response mode above: Chat Only, Chat + Visualization, or Data Table.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      meta: null,
      dataSnippet: null
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [error, setError] = useState(null);

  // Visualization & Query Result State
  const [activeData, setActiveData] = useState([]);
  const [activeColumns, setActiveColumns] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [aiRecommendedConfig, setAiRecommendedConfig] = useState(null);
  const [compatibleChartTypes, setCompatibleChartTypes] = useState(['bar', 'horizontal_bar', 'line', 'donut', 'table']);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const [activeQueryPlan, setActiveQueryPlan] = useState(null);
  const [showJsonPlan, setShowJsonPlan] = useState(false);

  // Data Table (Mode C) Interactive State
  const [tableSearch, setTableSearch] = useState('');
  const [tableSortCol, setTableSortCol] = useState(null);
  const [tableSortAsc, setTableSortAsc] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 10;

  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleRunQuery = async (questionText, targetMode = mode) => {
    if (!questionText || !questionText.trim() || loading) return;

    const trimmed = questionText.trim();
    setInputQuestion('');
    setError(null);
    setLoading(true);
    setLastQuestion(trimmed);

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    // Build conversation history (user & assistant turns)
    const historyPayload = messages
      .filter(m => m.id !== 'welcome')
      .slice(-4)
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const response = await queryAI(trimmed, targetMode, historyPayload);

      if (response.status === 'success') {
        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: {
            modelUsed: response.modelUsed,
            keyUsed: response.keyUsed,
            failoverAttempts: response.failoverAttempts || [],
            totalRows: response.totalRows,
            executedAt: response.executedAt,
            intent: response.intent,
            queryExecuted: response.queryExecuted
          },
          dataSnippet: targetMode === 'chat_only' && response.data?.length > 0 ? response.data.slice(0, 5) : null
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Update active dataset
        setActiveData(response.data || []);
        setActiveColumns(response.columns || []);
        setCompatibleChartTypes(response.compatibleChartTypes || ['bar', 'line', 'pie', 'table']);
        setFallbackNotice(response.fallbackNotice || null);
        setActiveQueryPlan(response.queryPlan);

        // Update chart config if present (prefer graphSpecification over visualization)
        if (response.graphSpecification) {
          setActiveConfig(response.graphSpecification);
          setAiRecommendedConfig(response.graphSpecification);
        } else if (response.visualization) {
          setActiveConfig(response.visualization);
          setAiRecommendedConfig(response.visualization);
        } else {
          // ============================================================
          // DEFAULT/MOCK GRAPH CONFIGURATION
          // ============================================================
          // DISABLED INTENTIONALLY.
          //
          // The production AI Graph Engine must use the real Groq API.
          // Never fabricate a default graph configuration when Groq
          // did not generate a graph specification.
          //
          // const numCol = response.columns.find(c => c.type === 'number')?.name;
          // const defaultCfg = { ... };
          // setActiveConfig(defaultCfg);
          // ============================================================
          setActiveConfig(null);
          setAiRecommendedConfig(null);
        }
      } else {
        // Explicit Error Returned by Engine
        const errorDetail = {
          message: response.error || response.answer || "AI request failed.",
          stage: response.errorStage || "Groq API Request",
          type: response.errorType || "api_error"
        };
        setError(errorDetail);
        setActiveData([]);
        setActiveColumns([]);
        setActiveConfig(null);
        setActiveQueryPlan(null);

        const errorMsg = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: response.answer || `⚠️ Query request encountered an issue: ${response.error}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: {
            isError: true,
            errorStage: response.errorStage,
            errorType: response.errorType,
            modelUsed: response.modelUsed
          }
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }
    } catch (err) {
      console.error("AI Query Error:", err);
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || "Unable to reach AI service.";
      const errStage = err.response?.data?.errorStage || "Groq API Request";
      const errType = err.response?.data?.errorType || "network_error";

      setError({
        message: errMsg,
        stage: errStage,
        type: errType
      });
      setActiveData([]);
      setActiveColumns([]);
      setActiveConfig(null);
      setActiveQueryPlan(null);

      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ AI Generation Failed: ${errMsg}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meta: {
          isError: true,
          errorStage: errStage,
          errorType: errType
        }
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunQuery(inputQuestion, mode);
    }
  };

  const handleResetConfig = () => {
    if (aiRecommendedConfig) {
      setActiveConfig({ ...aiRecommendedConfig });
      setFallbackNotice(null);
    }
  };

  const handleExportCSV = () => {
    if (!activeData || activeData.length === 0) return;
    const cols = activeColumns.map(c => c.name);
    const csvRows = [
      cols.join(','),
      ...activeData.map(row => cols.map(c => JSON.stringify(row[c] ?? '')).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `academic_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Table Rows for Mode C
  const filteredTableRows = useMemo(() => {
    if (!activeData || activeData.length === 0) return [];
    let rows = [...activeData];

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(val => String(val).toLowerCase().includes(q)));
    }

    if (tableSortCol) {
      rows.sort((a, b) => {
        const valA = a[tableSortCol];
        const valB = b[tableSortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return tableSortAsc ? valA - valB : valB - valA;
        }
        return tableSortAsc
          ? String(valA ?? '').localeCompare(String(valB ?? ''))
          : String(valB ?? '').localeCompare(String(valA ?? ''));
      });
    }

    return rows;
  }, [activeData, tableSearch, tableSortCol, tableSortAsc]);

  const paginatedTableRows = useMemo(() => {
    const start = (tablePage - 1) * pageSize;
    return filteredTableRows.slice(start, start + pageSize);
  }, [filteredTableRows, tablePage]);

  const totalPages = Math.ceil(filteredTableRows.length / pageSize) || 1;

  const handleSortClick = (col) => {
    if (tableSortCol === col) {
      setTableSortAsc(prev => !prev);
    } else {
      setTableSortCol(col);
      setTableSortAsc(true);
    }
    setTablePage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── Top Header Bar with Segmented 3-Mode Selector ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            padding: '10px',
            borderRadius: '10px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Academic AI Assistant
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Natural language inquiries with database grounding & interactive analytics
            </p>
          </div>
        </div>

        {/* ── Segmented Mode Selector: Chat Only | Chat + Viz | Data Table ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setMode('chat_only')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: mode === 'chat_only' ? 600 : 500,
              background: mode === 'chat_only' ? '#ffffff' : 'transparent',
              color: mode === 'chat_only' ? '#2563eb' : '#475569',
              boxShadow: mode === 'chat_only' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={15} />
            <span>Chat Only</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('chat_viz')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: mode === 'chat_viz' ? 600 : 500,
              background: mode === 'chat_viz' ? '#ffffff' : 'transparent',
              color: mode === 'chat_viz' ? '#2563eb' : '#475569',
              boxShadow: mode === 'chat_viz' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={15} />
            <span>Chat + Visualization</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('data_table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: mode === 'data_table' ? 600 : 500,
              background: mode === 'data_table' ? '#ffffff' : 'transparent',
              color: mode === 'data_table' ? '#2563eb' : '#475569',
              boxShadow: mode === 'data_table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Table2 size={15} />
            <span>Data Table</span>
          </button>
        </div>

        {/* Audit Logs Quick Access Button */}
        <Link
          to="/ai-logs"
          title="Open AI Query & Response Audit Log"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#334155',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={15} color="#2563eb" />
          <span>Audit Logs</span>
        </Link>
      </div>

      {/* ── Main Responsive Content Area Based on Active Mode ── */}

      {/* ============================================================== */}
      {/* MODE A: CHAT ONLY (Centered, clean conversational workspace)    */}
      {/* ============================================================== */}
      {mode === 'chat_only' && (
        <div style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          height: '750px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={18} color="#2563eb" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                Academic Assistant (Conversational)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Focused on natural language explanations
            </span>
          </div>

          {/* Suggested Inquiries */}
          <div style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Sample Questions:
            </span>
            {PROMPTS_BY_MODE.chat_only.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRunQuery(prompt, 'chat_only')}
                disabled={loading}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Bot size={18} color="#2563eb" />
                  </div>
                )}

                <div style={{
                  background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  <div>{msg.text}</div>

                  {/* Inline Data Preview Snippet if query retrieved data */}
                  {msg.dataSnippet && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        📋 Database Sample ({msg.dataSnippet.length} rows):
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                              {Object.keys(msg.dataSnippet[0]).slice(0, 4).map(k => (
                                <th key={k} style={{ padding: '2px 6px', textAlign: 'left' }}>{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.dataSnippet.map((r, ri) => (
                              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                {Object.values(r).slice(0, 4).map((v, vi) => (
                                  <td key={vi} style={{ padding: '2px 6px' }}>{String(v)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {msg.meta && (
                    <div style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #e2e8f0',
                      fontSize: '0.7rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.65rem'
                    }}>
                      <span>⚙️ {msg.meta.modelUsed}</span>
                      {msg.meta.keyUsed && <span>🔑 {msg.meta.keyUsed}</span>}
                      {msg.meta.failoverAttempts && msg.meta.failoverAttempts.length > 0 && (
                        <span style={{ color: '#b45309', fontWeight: 600 }}>
                          ⚡ Failover ({msg.meta.failoverAttempts.length})
                        </span>
                      )}
                      {msg.meta.queryExecuted && <span>📊 Verified Data Grounded</span>}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.65rem',
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                    textAlign: 'right',
                    marginTop: '0.35rem'
                  }}>
                    {msg.time}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <User size={18} color="#64748b" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                <div style={{
                  width: 20,
                  height: 20,
                  border: '2px solid #e2e8f0',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Assistant is evaluating response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              background: '#ffffff'
            }}>
              <input
                type="text"
                placeholder="Ask any academic or analytical question..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem',
                  padding: '0.35rem',
                  color: '#0f172a'
                }}
              />
              <button
                type="button"
                onClick={() => handleRunQuery(inputQuestion, 'chat_only')}
                disabled={loading || !inputQuestion.trim()}
                style={{
                  background: loading || !inputQuestion.trim() ? '#94a3b8' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  cursor: loading || !inputQuestion.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE B: CHAT + VISUALIZATION (Split Desktop / Responsive Stack) */}
      {/* ============================================================== */}
      {mode === 'chat_viz' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 420px) 1fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {/* Left Chat Pane */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            height: '750px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#2563eb" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                  Analytical Inquiries
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Visualizer Connected
              </span>
            </div>

            {/* Prompt Chips */}
            <div style={{
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Quick Prompts:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {PROMPTS_BY_MODE.chat_viz.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRunQuery(prompt, 'chat_viz')}
                    disabled={loading}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <Bot size={16} color="#2563eb" />
                    </div>
                  )}

                  <div style={{
                    background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.45
                  }}>
                    <div>{msg.text}</div>

                    {msg.meta && (
                      <div style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <span>⚙️ {msg.meta.modelUsed}</span>
                        {msg.meta.totalRows > 0 && <span>📊 {msg.meta.totalRows} records</span>}
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.65rem',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      textAlign: 'right',
                      marginTop: '0.25rem'
                    }}>
                      {msg.time}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <User size={16} color="#64748b" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    border: '2px solid #e2e8f0',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>AI querying data & configuring visualization...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '0.85rem', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.35rem 0.5rem',
                background: '#ffffff'
              }}>
                <input
                  type="text"
                  placeholder="Ask for graphs, comparisons, or metrics..."
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    padding: '0.35rem',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRunQuery(inputQuestion, 'chat_viz')}
                  disabled={loading || !inputQuestion.trim()}
                  style={{
                    background: loading || !inputQuestion.trim() ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.65rem',
                    cursor: loading || !inputQuestion.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Visualization Pane */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Real Groq Generation Success Status */}
            {!error && activeConfig && activeData.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.85rem',
                marginBottom: '0.75rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#166534'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span>✓ Graph generated successfully from Groq AI response</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#15803d', fontFamily: 'monospace' }}>
                  Real Grounded Output
                </span>
              </div>
            )}

            {/* Intelligent Compact Chart Selector */}
            {!error && activeConfig && (
              <ChartConfigPanel
                config={activeConfig}
                onChangeConfig={(newCfg) => setActiveConfig(newCfg)}
                onResetConfig={handleResetConfig}
                onExportCSV={handleExportCSV}
                onToggleSpec={() => setShowJsonPlan(prev => !prev)}
                showSpec={showJsonPlan}
                columns={activeColumns}
                compatibleChartTypes={compatibleChartTypes}
                fallbackNotice={fallbackNotice}
              />
            )}

            {/* Dynamic Recharts Renderer */}
            <DynamicChartRenderer
              data={activeData}
              config={activeConfig}
              columns={activeColumns}
              loading={loading}
              error={error}
              height={420}
            />

            {/* Structured Query Plan Drawer */}
            {activeQueryPlan && (
              <div style={{
                marginTop: '1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div
                  onClick={() => setShowJsonPlan(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code size={16} color="#64748b" />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>
                      Structured Query Plan & Visualization Contract
                    </span>
                  </div>
                  {showJsonPlan ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>

                {showJsonPlan && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <pre style={{
                      background: '#0f172a',
                      color: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                      fontFamily: 'monospace',
                      lineHeight: 1.5
                    }}>
                      {JSON.stringify({
                        queryPlan: activeQueryPlan,
                        visualization: activeConfig
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE C: DATA TABLE (Data-focused rows and columns view)         */}
      {/* ============================================================== */}
      {mode === 'data_table' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 380px) 1fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {/* Left Chat Pane */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            height: '750px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Table2 size={18} color="#2563eb" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                  Data Query Assistant
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Table Mode
              </span>
            </div>

            {/* Prompt Chips */}
            <div style={{
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Table Prompts:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {PROMPTS_BY_MODE.data_table.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRunQuery(prompt, 'data_table')}
                    disabled={loading}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <Bot size={16} color="#2563eb" />
                    </div>
                  )}

                  <div style={{
                    background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.45
                  }}>
                    <div>{msg.text}</div>
                    <div style={{
                      fontSize: '0.65rem',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      textAlign: 'right',
                      marginTop: '0.25rem'
                    }}>
                      {msg.time}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <User size={16} color="#64748b" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    border: '2px solid #e2e8f0',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Retrieving structured database records...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '0.85rem', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.35rem 0.5rem',
                background: '#ffffff'
              }}>
                <input
                  type="text"
                  placeholder="Request records, lists, or filtered cohorts..."
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    padding: '0.35rem',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRunQuery(inputQuestion, 'data_table')}
                  disabled={loading || !inputQuestion.trim()}
                  style={{
                    background: loading || !inputQuestion.trim() ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.65rem',
                    cursor: loading || !inputQuestion.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Dedicated Table Workspace */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {/* Table Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  width: '220px'
                }}>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={tableSearch}
                    onChange={(e) => { setTableSearch(e.target.value); setTablePage(1); }}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '0.8rem',
                      marginLeft: '0.4rem',
                      width: '100%',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {filteredTableRows.length} results
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMode('chat_viz')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <BarChart3 size={14} />
                  <span>View as Chart</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={activeData.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: activeData.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table Element */}
            {activeData.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px'
              }}>
                <Database size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>No Records Loaded</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Ask a question to query database records into this table view.
                </p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        {activeColumns.map(col => (
                          <th
                            key={col.name}
                            onClick={() => handleSortClick(col.name)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              fontWeight: 600,
                              color: '#475569',
                              textTransform: 'capitalize',
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{col.name.replace(/_/g, ' ')}</span>
                              <ArrowUpDown size={12} color="#94a3b8" />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTableRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa'
                          }}
                        >
                          {activeColumns.map(col => {
                            const val = row[col.name];
                            const isStatus = col.name.toLowerCase() === 'result';
                            return (
                              <td key={col.name} style={{ padding: '0.65rem 0.85rem', color: '#1e293b' }}>
                                {isStatus ? (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: val === 'PASS' ? '#dcfce7' : '#fee2e2',
                                    color: val === 'PASS' ? '#15803d' : '#b91c1c'
                                  }}>
                                    {val}
                                  </span>
                                ) : (
                                  typeof val === 'number'
                                    ? (Number.isInteger(val) ? val : val.toFixed(2))
                                    : String(val ?? '-')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  <span>Page {tablePage} of {totalPages}</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      disabled={tablePage === 1}
                      onClick={() => setTablePage(p => Math.max(1, p - 1))}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: tablePage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={tablePage >= totalPages}
                      onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: tablePage >= totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;
