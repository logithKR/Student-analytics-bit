import React from 'react';
import { X, Download, FileText, RefreshCw } from 'lucide-react';
import ReportComponentItem from './ReportComponentItem';

export const ReportPreviewModal = ({
  isOpen,
  onClose,
  onExportPDF,
  isExporting,
  reportTitle,
  pages = [],
  canvasComponents = [],
  scope = 'student',
  dataset = null
}) => {
  if (!isOpen) return null;

  const studentInfo = dataset?.studentInfo;
  const cohortInfo = dataset?.cohortInfo;

  const entityName = scope === 'student'
    ? `${studentInfo?.name || 'Student'} (${studentInfo?.registerNumber || ''})`
    : `${cohortInfo?.departmentLabel || 'Department'} - Sem ${cohortInfo?.semesterLabel || ''}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          background: 'var(--theme-card-bg, #141414)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--theme-border, #292929)',
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: 'var(--theme-card-bg, #141414)',
            borderBottom: '1px solid var(--theme-border, #292929)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255, 212, 59, 0.12)',
                color: 'var(--theme-accent, #FFD43B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)', margin: 0 }}>
                Document Print &amp; PDF Preview
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--theme-text-secondary, #A3A3A3)', margin: '2px 0 0' }}>
                Official Institutional Academic Evaluation Dossier • {entityName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 800,
                background: isExporting ? 'var(--theme-surface-elevated, #1C1C1C)' : 'var(--theme-accent, #FFD43B)',
                color: isExporting ? 'var(--theme-text-secondary, #A3A3A3)' : 'var(--theme-accent-text, #080808)',
                border: 'none',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {isExporting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Download Official PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--theme-text-secondary, #A3A3A3)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Scroll Canvas (Displays A4 Physical Sheets @ 794px min-height 1123px) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            background: '#334155'
          }}
        >
          {pages.map((p) => {
            const isP1 = p.pageNumber === 1;
            const pComps = p.components || [];

            return (
              <div
                key={p.id}
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  background: 'var(--theme-card-bg, #141414)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  borderRadius: '4px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                {/* ── Top Header Area ── */}
                <div>
                  {isP1 ? (
                    <div style={{ marginBottom: '16px' }}>
                      {/* Centered Institutional Letterhead */}
                      <div
                        style={{
                          borderBottom: '2px solid var(--theme-border, #292929)',
                          paddingBottom: '14px',
                          marginBottom: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '4px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: 'var(--theme-accent, #FFD43B)',
                              color: 'var(--theme-accent-text, #080808)',
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              letterSpacing: '0.06em',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)',
                              flexShrink: 0
                            }}
                          >
                            BIT
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <h1 style={{
                              fontSize: '1.15rem',
                              fontWeight: 900,
                              color: 'var(--theme-text-primary, #FFFFFF)',
                              letterSpacing: '0.04em',
                              margin: 0,
                              textTransform: 'uppercase',
                              lineHeight: 1.15
                            }}>
                              Bannari Amman Institute of Technology
                            </h1>
                            <p style={{
                              fontSize: '0.68rem',
                              color: 'var(--theme-text-secondary, #A3A3A3)',
                              margin: '2px 0 0',
                              fontWeight: 500,
                              letterSpacing: '0.01em'
                            }}>
                              Autonomous Institution Affiliated to Anna University • Accredited by NAAC with &quot;A+&quot; Grade
                            </p>
                          </div>
                        </div>

                        {/* Centered Ribbon: Dossier Badge + Reference */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              background: 'var(--theme-accent, #FFD43B)',
                              color: 'var(--theme-accent-text, #080808)',
                              border: '1px solid var(--theme-accent, #FFD43B)',
                              borderRadius: '20px',
                              padding: '2px 10px',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase'
                            }}
                          >
                            Official Academic Dossier
                          </span>
                          <span style={{ fontSize: '0.66rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 500 }}>
                            Ref: BIT/ACAD/2026/UG • Sathyamangalam, Tamil Nadu • Date: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Student Identity Card */}
                      {scope === 'student' && studentInfo && (
                        <div
                          style={{
                            background: 'var(--theme-surface-elevated, #1C1C1C)',
                            border: '1px solid var(--theme-border, #292929)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '14px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: 'var(--theme-accent, #FFD43B)',
                                color: 'var(--theme-accent-text, #080808)',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)'
                              }}
                            >
                              {studentInfo.name ? studentInfo.name.charAt(0) : 'S'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '1.02rem',
                                  fontWeight: 800,
                                  color: 'var(--theme-text-primary, #FFFFFF)',
                                  letterSpacing: '0.01em',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {studentInfo.name}
                                </span>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: 'var(--theme-accent-text, #080808)',
                                  background: 'var(--theme-accent, #FFD43B)',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  border: '1px solid var(--theme-accent, #FFD43B)',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.04em'
                                }}>
                                  {studentInfo.registerNumber}
                                </span>
                              </div>
                              <div style={{
                                fontSize: '0.72rem',
                                color: 'var(--theme-text-secondary, #A3A3A3)',
                                marginTop: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span><strong style={{ color: 'var(--theme-text-primary, #FFFFFF)' }}>Dept:</strong> {studentInfo.department}</span>
                                <span style={{ opacity: 0.4 }}>•</span>
                                <span><strong style={{ color: 'var(--theme-text-primary, #FFFFFF)' }}>Current:</strong> Semester {studentInfo.currentSemester}</span>
                                <span style={{ opacity: 0.4 }}>•</span>
                                <span><strong style={{ color: 'var(--theme-text-primary, #FFFFFF)' }}>Evaluated:</strong> {studentInfo.totalSemesters} Semesters</span>
                              </div>
                            </div>
                          </div>

                          {/* 3 Centered Metric Cards */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              textAlign: 'center',
                              minWidth: '108px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}>
                              <div style={{ fontSize: '0.58rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                Cumulative CGPA
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-accent, #FFD43B)', lineHeight: 1.1 }}>
                                {Number(studentInfo.cgpa).toFixed(2)} <span style={{ fontSize: '0.65rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 500 }}>/ 10</span>
                              </div>
                            </div>

                            <div style={{
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              textAlign: 'center',
                              minWidth: '100px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}>
                              <div style={{ fontSize: '0.58rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                Standing Arrears
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: studentInfo.totalArrears > 0 ? '#ef4444' : '#10b981', lineHeight: 1.1 }}>
                                {studentInfo.totalArrears}
                              </div>
                            </div>

                            <div style={{
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              textAlign: 'center',
                              minWidth: '112px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}>
                              <div style={{ fontSize: '0.58rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                                Academic Standing
                              </div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  background: (studentInfo.standing || '').toLowerCase().includes('green') || (studentInfo.standing || '').toLowerCase().includes('optimal')
                                    ? 'rgba(16, 185, 129, 0.14)'
                                    : 'rgba(239, 68, 68, 0.14)',
                                  color: (studentInfo.standing || '').toLowerCase().includes('green') || (studentInfo.standing || '').toLowerCase().includes('optimal')
                                    ? '#10b981'
                                    : '#ef4444',
                                  border: `1px solid ${(studentInfo.standing || '').toLowerCase().includes('green') || (studentInfo.standing || '').toLowerCase().includes('optimal') ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                  lineHeight: 1.25,
                                  letterSpacing: '0.02em'
                                }}
                              >
                                {studentInfo.standing?.split(' ')[0] || 'Optimal'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cohort Header Card */}
                      {scope === 'department' && cohortInfo && (
                        <div
                          style={{
                            background: 'var(--theme-surface-elevated, #1C1C1C)',
                            border: '1px solid var(--theme-border, #292929)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '14px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                              {cohortInfo.departmentLabel}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--theme-text-secondary, #A3A3A3)', marginTop: '2px' }}>
                              Academic Semester: {cohortInfo.semesterLabel} • Evaluated Strengths across Engineering Programs
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              textAlign: 'center',
                              minWidth: '110px'
                            }}>
                              <div style={{ fontSize: '0.58rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                Enrolled Students
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--theme-accent, #FFD43B)', lineHeight: 1.1 }}>
                                {cohortInfo.totalStudents}
                              </div>
                            </div>

                            <div style={{
                              background: 'var(--theme-card-bg, #141414)',
                              border: '1px solid var(--theme-border, #292929)',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              textAlign: 'center',
                              minWidth: '110px'
                            }}>
                              <div style={{ fontSize: '0.58rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                Pass Percentage
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
                                {cohortInfo.passPercentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── PAGE 2+: Running Header ── */
                    <div style={{
                      borderBottom: '1px solid var(--theme-border, #292929)',
                      paddingBottom: '10px',
                      marginBottom: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Bannari Amman Institute of Technology • Official Academic Dossier
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--theme-text-secondary, #A3A3A3)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--theme-text-primary, #FFFFFF)' }}>{scope === 'student' ? studentInfo?.name : cohortInfo?.departmentLabel}</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>Page {p.pageNumber} of {pages.length}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Real Visual Report Components Flow ── */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignContent: 'flex-start',
                      width: '100%'
                    }}
                  >
                    {pComps.length === 0 ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '2rem',
                          textAlign: 'center',
                          fontSize: '0.78rem',
                          color: 'var(--theme-text-secondary, #A3A3A3)',
                          background: 'var(--theme-surface-elevated, #1C1C1C)',
                          borderRadius: '8px',
                          border: '1px dashed var(--theme-border, #292929)'
                        }}
                      >
                        No components placed on Page {p.pageNumber}.
                      </div>
                    ) : (
                      pComps.map((comp, idx) => (
                        <ReportComponentItem
                          key={comp.instanceId || idx}
                          component={comp}
                          index={idx}
                          totalCount={pComps.length}
                          currentPageNumber={p.pageNumber}
                          totalPages={pages.length}
                          isSelected={false}
                          isPreview={true}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* ── Page Footer ── */}
                <div
                  style={{
                    paddingTop: '12px',
                    marginTop: 'auto',
                    borderTop: '1px solid var(--theme-border, #292929)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.66rem',
                    color: 'var(--theme-text-secondary, #A3A3A3)'
                  }}
                >
                  <span>CONFIDENTIAL &amp; PROPRIETARY • BANNARI AMMAN INSTITUTE OF TECHNOLOGY</span>
                  <span>Page {p.pageNumber} of {pages.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            background: 'var(--theme-card-bg, #141414)',
            borderTop: '1px solid var(--theme-border, #292929)'
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>
            PDF will be generated with high-DPI vector charts, selectable text, and official layout.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--theme-text-secondary, #A3A3A3)',
                background: 'transparent',
                border: '1px solid var(--theme-border, #292929)',
                cursor: 'pointer'
              }}
            >
              Back to Canvas
            </button>
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 800,
                background: isExporting ? 'var(--theme-surface-elevated, #1C1C1C)' : 'var(--theme-accent, #FFD43B)',
                color: isExporting ? 'var(--theme-text-secondary, #A3A3A3)' : 'var(--theme-accent-text, #080808)',
                border: 'none',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={14} />
              Download Official PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;