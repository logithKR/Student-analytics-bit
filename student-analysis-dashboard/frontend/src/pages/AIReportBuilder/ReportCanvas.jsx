import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Download,
  Eye,
  RotateCcw,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Check,
  BarChart2,
  Table as TableIcon
} from 'lucide-react';
import ReportComponentItem from './ReportComponentItem';

export const ReportCanvas = ({
  scope = 'student',
  dataset = null,
  availableComponents = [],
  pages = [],
  selectedCardId = null,
  onSelectCard,
  onToggleComponent,
  zoom = 85,
  onZoomChange,
  onMoveUp,
  onMoveDown,
  onMoveToPage,
  onRemove,
  onToggleWidth,
  onReorderWithinPage,
  onDropFromLibrary,
  onLoadDefaultTemplate,
  onResetCanvas,
  onAddPage,
  onRemovePage,
  onPreview,
  onExportPDF,
  isExporting,
  canvasRef
}) => {
  const [activeDropPage, setActiveDropPage] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const workspaceRef = useRef(null);

  // Zoom controls
  const handleZoomIn = () => {
    onZoomChange((z) => Math.min(150, z + 10));
  };

  const handleZoomOut = () => {
    onZoomChange((z) => Math.max(40, z - 10));
  };

  const handleZoomFit = () => {
    if (workspaceRef.current) {
      const containerW = workspaceRef.current.clientWidth;
      const fitZoom = Math.floor(((containerW - 60) / 850) * 100);
      onZoomChange(Math.max(45, Math.min(110, fitZoom)));
    } else {
      onZoomChange(85);
    }
  };

  // Drag and Drop handlers
  const handleItemDragStart = (e, pageNumber, index) => {
    e.dataTransfer.setData('text/plain', `canvas-item:${pageNumber}:${index}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e, pageNumber, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropPage(pageNumber);
    setDragOverIndex(index);
  };

  const handleItemDrop = (e, pageNumber, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropPage(null);
    setDragOverIndex(null);

    const canvasItemData = e.dataTransfer.getData('text/plain');
    if (canvasItemData && canvasItemData.startsWith('canvas-item:')) {
      const parts = canvasItemData.split(':');
      const fromPageNum = parseInt(parts[1], 10);
      const fromIndex = parseInt(parts[2], 10);

      if (!isNaN(fromPageNum) && !isNaN(fromIndex)) {
        if (fromPageNum === pageNumber) {
          onReorderWithinPage(pageNumber, fromIndex, index);
        } else {
          const sourcePage = pages.find((p) => p.pageNumber === fromPageNum);
          if (sourcePage && sourcePage.components[fromIndex]) {
            const item = sourcePage.components[fromIndex];
            onMoveToPage(item.instanceId, pageNumber, index);
          }
        }
      }
      return;
    }

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      if (jsonStr) {
        const comp = JSON.parse(jsonStr);
        onDropFromLibrary(comp, pageNumber, index);
      }
    } catch (err) {
      console.error('Item drop error:', err);
    }
  };

  const handlePageDragOver = (e, pageNumber) => {
    e.preventDefault();
    setActiveDropPage(pageNumber);
  };

  const handlePageDragLeave = (e, pageNumber) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (activeDropPage === pageNumber) {
      setActiveDropPage(null);
    }
  };

  const handlePageDrop = (e, pageNumber) => {
    e.preventDefault();
    setActiveDropPage(null);
    setDragOverIndex(null);

    const canvasItemData = e.dataTransfer.getData('text/plain');
    if (canvasItemData && canvasItemData.startsWith('canvas-item:')) {
      const parts = canvasItemData.split(':');
      const fromPageNum = parseInt(parts[1], 10);
      const fromIndex = parseInt(parts[2], 10);

      if (!isNaN(fromPageNum) && !isNaN(fromIndex) && fromPageNum !== pageNumber) {
        const sourcePage = pages.find((p) => p.pageNumber === fromPageNum);
        if (sourcePage && sourcePage.components[fromIndex]) {
          const item = sourcePage.components[fromIndex];
          onMoveToPage(item.instanceId, pageNumber);
        }
      }
      return;
    }

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      if (jsonStr) {
        const comp = JSON.parse(jsonStr);
        onDropFromLibrary(comp, pageNumber, null);
      }
    } catch (err) {
      console.error('Page drop error:', err);
    }
  };

  // Helper to find which page a component is currently placed on
  const findPlacedPage = (compId) => {
    for (const p of pages) {
      if ((p.components || []).some((c) => c.id === compId || c.originalId === compId)) {
        return p.pageNumber;
      }
    }
    return null;
  };

  const studentInfo = dataset?.studentInfo;
  const cohortInfo = dataset?.cohortInfo;
  const totalComponents = pages.reduce((sum, p) => sum + (p.components?.length || 0), 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* ── Document Control Toolbar ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.65rem'
        }}
      >
        {/* Left: Document Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={18} color="#2563eb" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
              Report Document Canvas
            </span>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}
          >
            {pages.length} Pages • {totalComponents} Visualizations Selected
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '3px 8px'
          }}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (-10%)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '3px', display: 'flex', alignItems: 'center' }}
          >
            <ZoomOut size={14} />
          </button>

          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', minWidth: '38px', textAlign: 'center' }}>
            {zoom}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (+10%)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '3px', display: 'flex', alignItems: 'center' }}
          >
            <ZoomIn size={14} />
          </button>

          <div style={{ width: '1px', height: '14px', background: '#cbd5e1', margin: '0 4px' }} />

          <button
            type="button"
            onClick={handleZoomFit}
            title="Fit to Screen"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2563eb',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 5px'
            }}
          >
            Fit
          </button>

          <button
            type="button"
            onClick={() => onZoomChange(100)}
            title="Actual 100% Zoom"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: zoom === 100 ? '#2563eb' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 5px'
            }}
          >
            100%
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onAddPage}
            title="Add a new blank A4 page"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Plus size={13} color="#2563eb" />
            <span>Add Page</span>
          </button>

          <button
            type="button"
            onClick={onLoadDefaultTemplate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={13} color="#7c3aed" />
            <span>Recommended Template</span>
          </button>

          <button
            type="button"
            onClick={onResetCanvas}
            title="Clear all pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.65rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={totalComponents === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: totalComponents === 0 ? 'not-allowed' : 'pointer',
              opacity: totalComponents === 0 ? 0.4 : 1
            }}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            disabled={isExporting || totalComponents === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              background: isExporting ? '#94a3b8' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#ffffff',
              cursor: isExporting || totalComponents === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              opacity: totalComponents === 0 ? 0.4 : 1
            }}
          >
            <Download size={14} />
            <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* ── Direct Graph Selector Pills (Replaces the 3rd Column!) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.55rem 0.85rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '0.85rem'
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Select Graphs & Components:
        </span>

        {availableComponents.map((comp) => {
          const placedPage = findPlacedPage(comp.id);
          const isPlaced = placedPage !== null;

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => onToggleComponent(comp)}
              title={isPlaced ? `Currently on Page ${placedPage}. Click to remove.` : 'Click to select and add to canvas'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '6px',
                border: isPlaced ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                background: isPlaced
                  ? placedPage === 1 ? '#eff6ff' : '#faf5ff'
                  : '#f8fafc',
                color: isPlaced
                  ? placedPage === 1 ? '#2563eb' : '#7c3aed'
                  : '#64748b',
                fontSize: '0.72rem',
                fontWeight: isPlaced ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isPlaced ? (
                <>
                  <Check size={12} strokeWidth={3} />
                  <span>{comp.title}</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: placedPage === 1 ? '#dbeafe' : '#f3e8ff',
                      color: placedPage === 1 ? '#1d4ed8' : '#6b21a8',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      marginLeft: '2px'
                    }}
                  >
                    P{placedPage}
                  </span>
                </>
              ) : (
                <>
                  <Plus size={11} />
                  <span>{comp.title}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Document Desk Workspace (Full-Width Slate Workspace) ── */}
      <div
        ref={workspaceRef}
        style={{
          background: '#475569',
          borderRadius: '12px',
          padding: '2rem 1rem 3rem',
          minHeight: '740px',
          maxHeight: '840px',
          overflowY: 'auto',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Scaled Document Pages Container */}
        <div
          ref={canvasRef}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            alignItems: 'center',
            marginBottom: `${((zoom / 100) - 1) * 1200}px`
          }}
        >
          {pages.map((page) => {
            const isP1 = page.pageNumber === 1;
            const isOverPage = activeDropPage === page.pageNumber;
            const comps = page.components || [];

            return (
              <div key={page.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Page Sheet Header Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '794px',
                    marginBottom: '8px',
                    padding: '0 4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#1e293b',
                        color: '#94a3b8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                      }}
                    >
                      PDF PAGE {page.pageNumber} OF {pages.length}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                      {page.title || (isP1 ? 'Identity & Academic Standing' : 'Examination Ledger & Detailed Visualizations')}
                    </span>
                  </div>

                  {page.pageNumber > 2 && comps.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onRemovePage(page.id)}
                      title="Remove this empty page"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '4px',
                        color: '#fca5a5',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={11} />
                      <span>Remove Page</span>
                    </button>
                  )}
                </div>

                {/* Actual Fixed A4 Physical Sheet (794px × 1123px @ 96 DPI) */}
                <div
                  className={`report-page-sheet report-page-sheet-${page.pageNumber}`}
                  onDragOver={(e) => handlePageDragOver(e, page.pageNumber)}
                  onDragLeave={(e) => handlePageDragLeave(e, page.pageNumber)}
                  onDrop={(e) => handlePageDrop(e, page.pageNumber)}
                  style={{
                    width: '794px',
                    minHeight: '1123px',
                    background: '#ffffff',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                    padding: '40px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: isOverPage ? '2px dashed #2563eb' : '1px solid #e2e8f0',
                    transition: 'border 0.15s ease'
                  }}
                >
                  {/* Subtle Printable Safety Margin Guideline (20mm) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '38px',
                      left: '38px',
                      right: '38px',
                      bottom: '38px',
                      border: '1px dashed rgba(203, 213, 225, 0.45)',
                      pointerEvents: 'none',
                      borderRadius: '2px'
                    }}
                  />

                  {/* ── PAGE 1: Institutional Letterhead + Student Identity Card ── */}
                  {isP1 ? (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                background: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '1rem',
                                letterSpacing: '0.05em'
                              }}
                            >
                              BIT
                            </div>
                            <div>
                              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', margin: 0, textTransform: 'uppercase' }}>
                                Bannari Amman Institute of Technology
                              </h1>
                              <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                                Autonomous Institution Affiliated to Anna University • Accredited by NAAC with "A+" Grade
                              </p>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                background: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                letterSpacing: '0.04em'
                              }}
                            >
                              OFFICIAL ACADEMIC DOSSIER
                            </span>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                              Ref: BIT/ACAD/2026 • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Student Identity Card */}
                      {scope === 'student' && studentInfo && (
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {studentInfo.name ? studentInfo.name.charAt(0) : 'S'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                  {studentInfo.name}
                                </span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                  {studentInfo.registerNumber}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '6px' }}>
                                <span><strong>Dept:</strong> {studentInfo.department}</span>
                                <span>•</span>
                                <span><strong>Current:</strong> Sem {studentInfo.currentSemester}</span>
                                <span>•</span>
                                <span><strong>Evaluated:</strong> {studentInfo.totalSemesters} Semesters</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cumulative CGPA</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb' }}>
                                {studentInfo.cgpa} <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>/ 10</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Standing Arrears</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: studentInfo.totalArrears > 0 ? '#dc2626' : '#16a34a' }}>
                                {studentInfo.totalArrears}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Academic Standing</div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: studentInfo.standing?.includes('Green') ? '#ecfdf5' : '#fef2f2',
                                  color: studentInfo.standing?.includes('Green') ? '#059669' : '#dc2626',
                                  border: `1px solid ${studentInfo.standing?.includes('Green') ? '#a7f3d0' : '#fecaca'}`
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
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                              {cohortInfo.departmentLabel}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                              Academic Semester: {cohortInfo.semesterLabel} • Evaluated Strengths across Engineering Programs
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Enrolled Students</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb' }}>
                                {cohortInfo.totalStudents}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pass Percentage</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                                {cohortInfo.passPercentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── PAGE 2+: Running Header ── */
                    <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Bannari Amman Institute of Technology • Academic Evaluation Dossier
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                        <span>{scope === 'student' ? studentInfo?.name : cohortInfo?.departmentLabel}</span>
                        <span>•</span>
                        <span>Page {page.pageNumber}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Page Drop Zone & Components Flow ── */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignContent: 'flex-start',
                      width: '100%',
                      minHeight: isP1 ? '820px' : '960px'
                    }}
                  >
                    {comps.length === 0 ? (
                      <div
                        style={{
                          width: '100%',
                          minHeight: '260px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '8px',
                          background: isOverPage ? '#eff6ff' : '#f8fafc',
                          padding: '2rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.75rem'
                          }}
                        >
                          <Layers size={20} />
                        </div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                          Page {page.pageNumber} is Empty
                        </h4>
                        <p style={{ fontSize: '0.74rem', color: '#64748b', maxWidth: '360px', margin: '0 0 1rem', lineHeight: 1.4 }}>
                          Click any graph above to place it here, or load the recommended template.
                        </p>
                        <button
                          type="button"
                          onClick={onLoadDefaultTemplate}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>Load Academic Template</span>
                        </button>
                      </div>
                    ) : (
                      comps.map((comp, idx) => (
                        <React.Fragment key={comp.instanceId || idx}>
                          {dragOverIndex === idx && activeDropPage === page.pageNumber && (
                            <div
                              style={{
                                width: '100%',
                                height: '4px',
                                background: '#2563eb',
                                borderRadius: '2px',
                                margin: '2px 0'
                              }}
                            />
                          )}

                          <ReportComponentItem
                            component={comp}
                            index={idx}
                            totalCount={comps.length}
                            currentPageNumber={page.pageNumber}
                            totalPages={pages.length}
                            isSelected={selectedCardId === comp.instanceId}
                            onSelectCard={onSelectCard}
                            onMoveUp={(itemIdx) => onMoveUp(page.pageNumber, itemIdx)}
                            onMoveDown={(itemIdx) => onMoveDown(page.pageNumber, itemIdx)}
                            onMoveToPage={onMoveToPage}
                            onRemove={onRemove}
                            onToggleWidth={onToggleWidth}
                            onDragStart={(e, itemIdx) => handleItemDragStart(e, page.pageNumber, itemIdx)}
                            onDragOver={(e, itemIdx) => handleItemDragOver(e, page.pageNumber, itemIdx)}
                            onDrop={(e, itemIdx) => handleItemDrop(e, page.pageNumber, itemIdx)}
                          />
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {/* ── Running Institutional Page Footer ── */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '10px',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.68rem',
                      color: '#94a3b8'
                    }}
                  >
                    <div>
                      CONFIDENTIAL & PROPRIETARY • BANNARI AMMAN INSTITUTE OF TECHNOLOGY
                    </div>
                    <div>
                      Official Institutional Dossier • Generated from verified database records
                    </div>
                    <div style={{ fontWeight: 700, color: '#475569' }}>
                      Page {page.pageNumber} of {pages.length}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportCanvas;
