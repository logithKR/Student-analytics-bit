import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Plus,
  RefreshCw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { sendReportAIChat, getStudents } from '../../services/api';

export const AIConversationSidebar = ({
  scope = 'student',
  dataset = null,
  availableComponents = [],
  onToggleComponent,
  onSelectStudent,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  // Initialize or update welcome message when dataset changes
  useEffect(() => {
    if (!dataset) return;

    const entityName = scope === 'student'
      ? dataset.studentInfo?.name || 'this student'
      : dataset.cohortInfo?.departmentLabel || 'this cohort';

    const regNo = dataset.studentInfo?.registerNumber ? ` (${dataset.studentInfo.registerNumber})` : '';

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I am your Academic Dossier Assistant. I am directly connected to the verified database records for **${entityName}**${regNo}. Ask me any analytical question, and I will extract verified metrics or suggest report components for your canvas.`
      }
    ]);
  }, [dataset, scope]);

  // Scroll only the chat container, never the entire page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Helper to render bold markdown and clean bullet points
  const renderFormattedText = (text) => {
    if (typeof text !== 'string') return text;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={lIdx} style={{ minHeight: line.trim() ? undefined : '0.4rem', marginBottom: '2px' }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </div>
      );
    });
  };

  // Instant local fallback answering to guarantee zero error states
  const generateLocalAnswer = async (query) => {
    const qLower = query.toLowerCase();

    // Check if query is looking for a different student
    const studentInfo = dataset?.studentInfo || {};
    const currentName = (studentInfo.name || '').toLowerCase();
    const currentReg = (studentInfo.registerNumber || '').toLowerCase();

    // Check if query mentions a student name or regNo
    const hasStudentIntent = ['info about', 'details of', 'who is', 'switch to', 'show', 'student'].some(k => qLower.includes(k))
      || (!qLower.includes(currentName) && !qLower.includes(currentReg) && qLower.split(' ').length <= 5);

    if (hasStudentIntent) {
      try {
        let searchTerm = query;
        ['i need the info about', 'info about', 'tell me about', 'details of', 'show me', 'who is', 'switch to', 'student'].forEach(f => {
          searchTerm = searchTerm.replace(new RegExp(f, 'gi'), ' ');
        });
        searchTerm = searchTerm.trim();

        if (searchTerm.length >= 3) {
          const searchResults = await getStudents('All', 'All', searchTerm);
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            const match = searchResults[0];
            return {
              answer: `Found verified institutional records for **${match.name}** (${match.registerNumber}):\n\n• **Department:** ${match.department}\n• **Current Semester:** Semester ${match.semester}\n• **Cumulative SGPA / CGPA:** ${match.gpa || 0.0} / 10.0\n• **Standing Arrears:** ${match.failCount || 0} (${match.failCount > 0 ? 'Remedial coaching recommended' : 'Clear academic record'})\n• **Academic Standing:** ${match.failCount > 0 ? 'Remedial Intervention' : 'Optimal (Green)'}\n\nWould you like to switch the current report canvas to **${match.name}**?`,
              suggested: ['student_kpi_overview', 'student_sgpa_progression', 'student_strengths_weaknesses_card'],
              targetStudent: {
                registerNumber: match.registerNumber,
                name: match.name,
                department: match.department,
                semester: match.semester,
                cgpa: match.gpa || 0.0,
                arrears: match.failCount || 0
              }
            };
          }
        }
      } catch (e) {
        console.warn('Local student search error:', e);
      }
    }

    if (scope === 'student') {
      const name = studentInfo.name || 'The student';
      const reg = studentInfo.registerNumber || '';
      const cgpa = studentInfo.cgpa !== undefined ? studentInfo.cgpa : 0.0;
      const arrears = studentInfo.totalArrears !== undefined ? studentInfo.totalArrears : 0;
      const sem = studentInfo.currentSemester || '';

      const compMap = {};
      (availableComponents || []).forEach((c) => {
        compMap[c.id] = c;
      });

      const strengths = compMap['student_strengths_weaknesses_card']?.data?.strongest || [];
      const weakest = compMap['student_strengths_weaknesses_card']?.data?.weakest || [];

      if (qLower.includes('attendance')) {
        return {
          answer: `Attendance tracking is not present in the official database records for ${name} (${reg}). To preserve strict factual integrity, no attendance data is generated.`,
          suggested: []
        };
      }

      if (['strongest', 'best', 'strength', 'top', 'highest'].some((k) => qLower.includes(k))) {
        if (strengths.length > 0) {
          const topStr = strengths.slice(0, 3).map((s) => `${s.code} (${s.tot}/100, Grade ${s.grd})`).join(', ');
          return {
            answer: `Based on official database records, ${name}'s highest scoring courses are: ${topStr}. The student exhibits strong competency in these subjects.`,
            suggested: ['student_strengths_weaknesses_card', 'student_latest_subjects_bar']
          };
        }
      }

      if (['weakest', 'arrear', 'remedial', 'vulnerable', 'fail', 'lowest'].some((k) => qLower.includes(k))) {
        if (arrears > 0 && weakest.length > 0) {
          const lowStr = weakest.slice(0, 2).map((w) => `${w.code} (${w.tot}/100, Grade ${w.grd})`).join(', ');
          return {
            answer: `${name} currently records ${arrears} standing arrear(s). The most critical academic vulnerability is in ${lowStr}. Remedial tutorial coaching is recommended.`,
            suggested: ['student_strengths_weaknesses_card', 'student_semester_ledger_table']
          };
        } else if (weakest.length > 0) {
          return {
            answer: `${name} has zero standing arrears. The lowest recorded course score is ${weakest[0].code} with ${weakest[0].tot}/100 (Grade ${weakest[0].grd}), which is in acceptable passing standing.`,
            suggested: ['student_strengths_weaknesses_card']
          };
        }
      }

      if (['trend', 'progression', 'trajectory', 'sgpa', 'semester'].some((k) => qLower.includes(k))) {
        const trajectory = compMap['student_sgpa_progression']?.data || [];
        if (trajectory.length >= 2) {
          const first = trajectory[0];
          const last = trajectory[trajectory.length - 1];
          const diff = Math.round((last.sgpa - first.sgpa) * 100) / 100;
          const dir = diff > 0 ? 'improved by' : (diff < 0 ? 'declined by' : 'remained steady at');
          return {
            answer: `${name}'s SGPA trajectory spans ${trajectory.length} semesters: starting at ${first.sgpa} in ${first.semester} and progressing to ${last.sgpa} in ${last.semester} (${dir} ${Math.abs(diff)} pts). Cumulative CGPA: ${cgpa}/10.0.`,
            suggested: ['student_sgpa_progression']
          };
        }
        return {
          answer: `${name} records a cumulative CGPA of ${cgpa}/10.0 across evaluated terms with ${arrears} arrears.`,
          suggested: ['student_sgpa_progression']
        };
      }

      return {
        answer: `${name} (${reg}) is currently enrolled in Semester ${sem} with a cumulative CGPA of ${cgpa}/10.0 and ${arrears} standing arrear(s). Academic Standing: ${studentInfo.standing || 'Optimal'}.`,
        suggested: ['student_kpi_overview', 'student_sgpa_progression']
      };
    } else {
      const cohortInfo = dataset?.cohortInfo || {};
      const dept = cohortInfo.departmentLabel || 'The Department';
      const sem = cohortInfo.semesterLabel || 'All Semesters';
      const total = cohortInfo.totalStudents || 0;
      const passPct = cohortInfo.passPercentage || 0;
      const avgGpa = cohortInfo.averageGpa || 0.0;
      const atRisk = cohortInfo.totalAtRisk || 0;

      if (['pass', 'rate', 'percentage'].some((k) => qLower.includes(k))) {
        return {
          answer: `For ${dept} (${sem}), the overall pass percentage is ${passPct}% across ${total} evaluated students.`,
          suggested: ['cohort_kpi_overview', 'cohort_class_division_donut']
        };
      }

      if (['risk', 'at-risk', 'warning', 'critical'].some((k) => qLower.includes(k))) {
        return {
          answer: `Diagnostic analytics flag ${atRisk} student(s) at academic risk in ${dept} (${sem}). Recommended: Remedial tutorials and faculty mentorship.`,
          suggested: ['cohort_at_risk_table', 'cohort_vulnerable_courses_card']
        };
      }

      return {
        answer: `${dept} (${sem}) records ${total} enrolled students with an average SGPA of ${avgGpa}/10.0 and a pass rate of ${passPct}%.`,
        suggested: ['cohort_kpi_overview', 'cohort_sgpa_trend_chart']
      };
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg = { id: `user-${Date.now()}`, role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      let assistantAnswer = '';
      let suggestedList = [];
      let targetStudent = null;

      try {
        const res = await sendReportAIChat({
          question: query,
          scope,
          entity_data: dataset || {},
          available_components: availableComponents || [],
          history: messages.slice(-3)
        });

        if (res && res.answer) {
          assistantAnswer = res.answer;
          suggestedList = res.suggestedComponents || [];
          targetStudent = res.targetStudent || null;
        }
      } catch (networkErr) {
        console.warn('Backend chat service fallback to local factual resolver:', networkErr);
      }

      // If backend was empty or threw error, use instant local resolver
      if (!assistantAnswer) {
        const local = await generateLocalAnswer(query);
        assistantAnswer = local.answer;
        suggestedList = local.suggested;
        targetStudent = local.targetStudent || null;
      }

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: assistantAnswer,
        suggestedComponents: suggestedList,
        targetStudent: targetStudent
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user explicitly asked to switch to the student, trigger switch automatically
      if (targetStudent && onSelectStudent && query.toLowerCase().includes('switch to')) {
        onSelectStudent(targetStudent.registerNumber);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to analyze records. Please verify the active student selection.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = scope === 'student'
    ? [
        "What are the student's strongest subjects?",
        "Compare semester progression & CGPA trend",
        "Check standing arrears & remedial requirements"
      ]
    : [
        "What is the overall pass percentage?",
        "Identify courses with highest failure rates",
        "List students requiring academic intervention"
      ];

  // Collapsed Sidebar View
  if (isCollapsed) {
    return (
      <div
        style={{
          width: '52px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          height: 'calc(100vh - 195px)',
          minHeight: '540px',
          maxHeight: '760px',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand AI Copilot"
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            color: '#2563eb',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={18} />
        </button>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.05em'
          }}
        >
          ACADEMIC AI COPILOT
        </div>
      </div>
    );
  }

  // Expanded Sidebar View
  return (
    <div
      style={{
        width: '320px',
        flexShrink: 0,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: 'calc(100vh - 195px)',
        minHeight: '540px',
        maxHeight: '760px',
        position: 'relative'
      }}
    >
      {/* ── Top Header ── */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Academic AI Copilot
            </h3>
            <span style={{ fontSize: '0.65rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <ShieldCheck size={11} /> 100% Real Database Grounding
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse Sidebar"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px'
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* ── Quick Factual Analysis Prompts ── */}
      <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          <Lightbulb size={12} color="#f59e0b" /> Factual Analysis Prompts:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              style={{
                textAlign: 'left',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.68rem',
                color: '#334155',
                cursor: 'pointer',
                lineHeight: 1.3,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              • {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Messages Scroll Area ── */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '92%',
                padding: '7px 11px',
                borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
                color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                fontSize: '0.75rem',
                lineHeight: 1.45,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {renderFormattedText(msg.content)}

              {/* Direct Dossier Switch Button if another student is queried */}
              {msg.targetStudent && onSelectStudent && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => onSelectStudent(msg.targetStudent.registerNumber)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    <UserCheck size={12} />
                    <span>Switch Dossier to {msg.targetStudent.name}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Suggested Graph Pills */}
            {msg.suggestedComponents && msg.suggestedComponents.length > 0 && onToggleComponent && (
              <div style={{ marginTop: '5px', width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b' }}>
                  Recommended Report Visualizations:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {msg.suggestedComponents.map((item, idx) => {
                    const compId = typeof item === 'string' ? item : item.id;
                    const comp = availableComponents.find((c) => c.id === compId);
                    if (!comp) return null;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onToggleComponent(comp)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '3px 7px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={10} />
                        <span>{comp.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', padding: '4px' }}>
            <RefreshCw size={13} className="animate-spin" />
            <span>Analyzing student database records...</span>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Message Input Bar ── */}
      <div
        style={{
          padding: '0.65rem 0.75rem',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.03)'
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask analytical question or name..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            outline: 'none',
            background: '#f8fafc',
            color: '#0f172a'
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
          onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !inputValue.trim()}
          style={{
            padding: '7px 12px',
            background: inputValue.trim() && !loading ? '#2563eb' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: inputValue.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease'
          }}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};

export default AIConversationSidebar;
