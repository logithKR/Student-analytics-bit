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
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
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
            <FileText size={18} color="var(--theme-accent, #FFD43B)" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--theme-text-primary, #FFFFFF)' }}>
              Report Document Canvas
            </span>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'var(--theme-accent, #FFD43B)',
              color: 'var(--theme-accent-text, #080808)',
              border: '1px solid var(--theme-accent, #FFD43B)'
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
            background: 'var(--theme-surface-elevated, #1C1C1C)',
            border: '1px solid var(--theme-border, #292929)',
            borderRadius: '8px',
            padding: '3px 8px'
          }}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (-10%)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text-secondary, #A3A3A3)', padding: '3px', display: 'flex', alignItems: 'center' }}
          >
            <ZoomOut size={14} />
          </button>

          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)', minWidth: '38px', textAlign: 'center' }}>
            {zoom}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (+10%)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text-secondary, #A3A3A3)', padding: '3px', display: 'flex', alignItems: 'center' }}
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
              color: 'var(--theme-accent, #FFD43B)',
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
              background: 'var(--theme-surface-elevated, #1C1C1C)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--theme-text-primary, #FFFFFF)',
              cursor: 'pointer'
            }}
          >
            <Plus size={13} color="var(--theme-accent, #FFD43B)" />
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
              background: 'var(--theme-surface-elevated, #1C1C1C)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--theme-text-primary, #FFFFFF)',
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
              background: 'var(--theme-card-bg, #141414)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: 'var(--theme-text-primary, #FFFFFF)',
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
              background: 'var(--theme-card-bg, #141414)',
              border: '1px solid var(--theme-border, #292929)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--theme-text-primary, #FFFFFF)',
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
              background: isExporting ? 'var(--theme-surface-elevated, #1C1C1C)' : 'var(--theme-accent, #FFD43B)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: isExporting ? 'var(--theme-text-secondary, #A3A3A3)' : 'var(--theme-accent-text, #080808)',
              cursor: isExporting || totalComponents === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)',
              opacity: totalComponents === 0 ? 0.4 : 1,
              transition: 'all 0.15s ease'
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
          background: 'var(--theme-card-bg, #141414)',
          border: '1px solid var(--theme-border, #292929)',
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
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
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
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: isPlaced ? '1px solid var(--theme-accent, #FFD43B)' : '1px solid var(--theme-border, #292929)',
                background: isPlaced
                  ? 'var(--theme-accent, #FFD43B)'
                  : 'var(--theme-surface-elevated, #1C1C1C)',
                color: isPlaced
                  ? 'var(--theme-accent-text, #080808)'
                  : 'var(--theme-text-primary, #FFFFFF)',
                fontSize: '0.72rem',
                fontWeight: isPlaced ? 800 : 600,
                cursor: 'pointer',
                boxShadow: isPlaced ? '0 1px 4px rgba(255, 212, 59, 0.25)' : 'none',
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
                      background: 'rgba(0, 0, 0, 0.15)',
                      color: 'var(--theme-accent-text, #080808)',
                      padding: '1px 5px',
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
                    background: 'var(--theme-card-bg, #141414)',
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
                              background: 'rgba(255, 212, 59, 0.12)',
                              color: 'var(--theme-accent, #FFD43B)',
                              border: '1px solid rgba(255, 212, 59, 0.35)',
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
                                  color: 'var(--theme-accent, #FFD43B)',
                                  background: 'rgba(255, 212, 59, 0.12)',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(255, 212, 59, 0.35)',
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
                        <span style={{ fontWeight: 600, color: 'var(--theme-accent, #FFD43B)' }}>{scope === 'student' ? studentInfo?.name : cohortInfo?.departmentLabel}</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>Page {page.pageNumber} of {pages.length}</span>
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
                          minHeight: '280px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed var(--theme-border, #292929)',
                          borderRadius: '10px',
                          background: isOverPage ? 'rgba(255, 212, 59, 0.08)' : 'var(--theme-surface-elevated, #1C1C1C)',
                          padding: '2.5rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(255, 212, 59, 0.12)',
                            color: 'var(--theme-accent, #FFD43B)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.85rem',
                            border: '1px solid rgba(255, 212, 59, 0.25)'
                          }}
                        >
                          <Layers size={22} />
                        </div>
                        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)', margin: '0 0 5px' }}>
                          Page {page.pageNumber} is Empty
                        </h4>
                        <p style={{ fontSize: '0.74rem', color: 'var(--theme-text-secondary, #A3A3A3)', maxWidth: '380px', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                          Select any component above to place it here, or load the recommended official academic template.
                        </p>
                        <button
                          type="button"
                          onClick={onLoadDefaultTemplate}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'var(--theme-accent, #FFD43B)',
                            color: 'var(--theme-accent-text, #080808)',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(255, 212, 59, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Sparkles size={14} />
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
                      borderTop: '1px solid var(--theme-border, #292929)',
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
                    <div style={{ fontWeight: 700, color: 'var(--theme-text-secondary, #A3A3A3)' }}>
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
