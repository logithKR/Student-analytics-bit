import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Search, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { getDepartments, getStudents } from '../../services/api';

export const ReportDataSelector = ({
  mode,
  onModeChange,
  selectedStudent,
  onSelectStudent,
  selectedDepartment,
  onDepartmentChange,
  selectedSemester,
  onSemesterChange,
  dataset,
  loading,
  onRefresh
}) => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const depts = await getDepartments();
        if (Array.isArray(depts)) {
          setDepartments(depts);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepts();
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search students against real database
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getStudents('All', 'All', searchTerm.trim());
        const unique = [];
        const seen = new Set();
        (results || []).forEach((s) => {
          if (!seen.has(s.registerNumber)) {
            seen.add(s.registerNumber);
            unique.push(s);
          }
        });
        setSearchResults(unique.slice(0, 8));
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Student search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (student) => {
    onSelectStudent(student.registerNumber);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const studentInfo = dataset?.studentInfo;
  const cohortInfo = dataset?.cohortInfo;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.875rem 1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}
    >
      {/* ── Left: Segmented Mode Selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '3px'
          }}
        >
          <button
            type="button"
            onClick={() => onModeChange('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: mode === 'student' ? 600 : 500,
              background: mode === 'student' ? '#ffffff' : 'transparent',
              color: mode === 'student' ? '#2563eb' : '#475569',
              boxShadow: mode === 'student' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={14} />
            <span>Individual Student</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('department')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: mode === 'department' ? 600 : 500,
              background: mode === 'department' ? '#ffffff' : 'transparent',
              color: mode === 'department' ? '#2563eb' : '#475569',
              boxShadow: mode === 'department' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={14} />
            <span>Department Cohort</span>
          </button>
        </div>

        {/* ── Mode 1 Controls: Student Search ── */}
        {mode === 'student' && (
          <div ref={searchRef} style={{ position: 'relative', width: '260px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                gap: '0.5rem'
              }}
            >
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Search Reg No or Name..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              {isSearching && (
                <RefreshCw size={13} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              )}
            </div>

            {/* Dropdown matching app design */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}
              >
                <div
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f8fafc',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  DATABASE MATCHES
                </div>
                {searchResults.map((s) => (
                  <button
                    key={s.registerNumber}
                    type="button"
                    onClick={() => handleSelect(s)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {s.registerNumber}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        background: '#e2e8f0',
                        color: '#475569',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Sem {s.semester}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Mode 2 Controls: Department & Semester Dropdowns ── */}
        {mode === 'department' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                color: '#0f172a',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => onSemesterChange(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                color: '#0f172a',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Semesters</option>
              <option value="I">Semester I</option>
              <option value="III">Semester III</option>
              <option value="V">Semester V</option>
              <option value="VII">Semester VII</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Right: Target Data Metadata Pill ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {mode === 'student' && studentInfo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{studentInfo.name}</span>
              <span style={{ marginLeft: '6px', color: '#2563eb', fontFamily: 'monospace', fontWeight: 600 }}>
                ({studentInfo.registerNumber})
              </span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <span style={{ color: '#64748b' }}>CGPA: </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{studentInfo.cgpa}</span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <span style={{ color: '#64748b' }}>Arrears: </span>
              <span style={{ fontWeight: 700, color: studentInfo.totalArrears > 0 ? '#ef4444' : '#10b981' }}>
                {studentInfo.totalArrears}
              </span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                background: studentInfo.totalArrears === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: studentInfo.totalArrears === 0 ? '#10b981' : '#ef4444'
              }}
            >
              {studentInfo.standing}
            </span>
          </div>
        )}

        {mode === 'department' && cohortInfo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{cohortInfo.departmentLabel}</span>
              <span style={{ marginLeft: '6px', color: '#64748b' }}>• {cohortInfo.semesterLabel}</span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <span style={{ color: '#64748b' }}>Enrolled: </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{cohortInfo.totalStudents}</span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <span style={{ color: '#64748b' }}>Pass Rate: </span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{cohortInfo.passPercentage}%</span>
            </div>
            <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />
            <div>
              <span style={{ color: '#64748b' }}>At-Risk: </span>
              <span style={{ fontWeight: 700, color: cohortInfo.totalAtRisk > 0 ? '#f59e0b' : '#64748b' }}>
                {cohortInfo.totalAtRisk}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title="Reload dataset records"
          style={{
            padding: '0.45rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#64748b',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>
    </div>
  );
};

export default ReportDataSelector;
