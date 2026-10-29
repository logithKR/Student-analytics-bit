import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Layers,
  RotateCcw
} from 'lucide-react';

import ReportDataSelector from './ReportDataSelector';
import ReportCanvas from './ReportCanvas';
import AIConversationSidebar from './AIConversationSidebar';
import ReportPreviewModal from './ReportPreviewModal';

import {
  getReportBuilderStudent,
  getReportBuilderDepartment
} from '../../services/api';
import { exportCustomReportPDF } from '../../services/pdfReportService';

export const AIReportBuilder = () => {
  const canvasRef = useRef(null);

  // Scope & Mode
  const [mode, setMode] = useState('student'); // 'student' | 'department'
  const [selectedStudent, setSelectedStudent] = useState('7376252AD101');
  const [selectedDepartment, setSelectedDepartment] = useState('CS');
  const [selectedSemester, setSelectedSemester] = useState('V');

  // Loaded Dataset & Available Components
  const [dataset, setDataset] = useState(null);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Card for direct inspection
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Multi-Page A4 Document Model
  const [pages, setPages] = useState([
    {
      id: 'page-1',
      pageNumber: 1,
      title: 'Identity & Academic Standing',
      components: []
    },
    {
      id: 'page-2',
      pageNumber: 2,
      title: 'Academic Performance & Detailed Ledger',
      components: []
    }
  ]);

  // Zoom system (default 85% for balanced desktop workspace view)
  const [zoom, setZoom] = useState(85);

  // UI Modals & Export State
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAiCollapsed, setIsAiCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build default page distribution for loaded dataset
  const buildInitialPages = (comps, dataMode) => {
    if (dataMode === 'student') {
      const p1Ids = [
        'student_kpi_overview',
        'student_sgpa_progression',
        'student_latest_subjects_bar',
        'student_grade_distribution_donut',
        'student_strengths_weaknesses_card'
      ];
      const p2Ids = [
        'student_internal_external_stacked',
        'student_ai_narrative_summary',
        'student_semester_ledger_table',
        'student_official_endorsement'
      ];

      const p1Items = p1Ids
        .map((id) => comps.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          ...c,
          instanceId: `${c.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalId: c.id,
          pageNumber: 1
        }));

      const p2Items = p2Ids
        .map((id) => comps.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          ...c,
          instanceId: `${c.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalId: c.id,
          pageNumber: 2
        }));

      return [
        { id: 'page-1', pageNumber: 1, title: 'Identity & Academic Standing', components: p1Items },
        { id: 'page-2', pageNumber: 2, title: 'Academic Performance & Detailed Ledger', components: p2Items }
      ];
    } else {
      const p1Ids = [
        'cohort_kpi_overview',
        'cohort_grade_distribution_bar',
        'cohort_class_division_donut',
        'cohort_subject_difficulty_radar',
        'cohort_batch_comparison_stacked',
        'cohort_vulnerable_courses_table'
      ];
      const p2Ids = [
        'cohort_sgpa_trend_chart',
        'cohort_ai_analytical_summary',
        'cohort_top_performers_table',
        'cohort_at_risk_registry_table',
        'cohort_official_endorsement'
      ];

      const p1Items = p1Ids
        .map((id) => comps.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          ...c,
          instanceId: `${c.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalId: c.id,
          pageNumber: 1
        }));

      const p2Items = p2Ids
        .map((id) => comps.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          ...c,
          instanceId: `${c.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalId: c.id,
          pageNumber: 2
        }));

      return [
        { id: 'page-1', pageNumber: 1, title: 'Cohort Overview & Performance Trajectory', components: p1Items },
        { id: 'page-2', pageNumber: 2, title: 'Diagnostic Ledgers & Quality Indicators', components: p2Items }
      ];
    }
  };

  // Fetch dataset based on active mode
  const fetchDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;
      if (mode === 'student') {
        data = await getReportBuilderStudent(selectedStudent);
      } else {
        data = await getReportBuilderDepartment(selectedDepartment, selectedSemester);
      }

      setDataset(data);
      const comps = data.availableComponents || [];
      setAvailableComponents(comps);

      // Populate pages with recommended academic distribution
      const initialPages = buildInitialPages(comps, mode);
      setPages(initialPages);
    } catch (err) {
      console.error('Failed to load report builder dataset:', err);
      const msg = err.response?.data?.detail || err.message || 'Unable to fetch academic dataset records.';
      setError(msg);
      setDataset(null);
      setAvailableComponents([]);
      setPages([
        { id: 'page-1', pageNumber: 1, title: 'Identity & Academic Standing', components: [] },
        { id: 'page-2', pageNumber: 2, title: 'Academic Performance & Detailed Ledger', components: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, [mode, selectedStudent, selectedDepartment, selectedSemester]);

  // Toggle a component on/off the canvas directly by clicking it
  const handleToggleComponent = (comp) => {
    const isCurrentlyPlaced = pages.some((p) =>
      p.components.some((c) => c.id === comp.id || c.originalId === comp.id)
    );

    if (isCurrentlyPlaced) {
      // Remove it
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          components: p.components.filter((c) => c.id !== comp.id && c.originalId !== comp.id)
        }))
      );
      triggerToast(`Removed "${comp.title}" from canvas.`);
    } else {
      // Add it to Page 1 if Page 1 has <= 3 items, otherwise Page 2
      const targetPageNum = (pages[0]?.components?.length || 0) <= 3 ? 1 : (pages[1]?.pageNumber || 2);
      const newInstance = {
        ...comp,
        instanceId: `${comp.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        originalId: comp.id,
        pageNumber: targetPageNum
      };

      setPages((prev) =>
        prev.map((p) => {
          if (p.pageNumber !== targetPageNum) return p;
          return { ...p, components: [...p.components, newInstance] };
        })
      );
      setSelectedCardId(newInstance.instanceId);
      triggerToast(`Added "${comp.title}" to A4 Page ${targetPageNum}.`);
    }
  };

  // Drop component from library at specific index on target page
  const handleDropFromLibrary = (comp, targetPageNumber = 1, dropIndex = null) => {
    const newInstance = {
      ...comp,
      instanceId: `${comp.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      originalId: comp.id,
      pageNumber: targetPageNumber
    };

    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== targetPageNumber) return p;
        const nextComps = [...p.components];
        if (dropIndex !== null && dropIndex >= 0 && dropIndex <= nextComps.length) {
          nextComps.splice(dropIndex, 0, newInstance);
        } else {
          nextComps.push(newInstance);
        }
        return { ...p, components: nextComps };
      })
    );
    setSelectedCardId(newInstance.instanceId);
    triggerToast(`Added "${comp.title}" to A4 Page ${targetPageNumber}.`);
  };

  // Reorder within a specific page
  const handleReorderWithinPage = (pageNumber, fromIndex, toIndex) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        const nextComps = [...p.components];
        const [moved] = nextComps.splice(fromIndex, 1);
        nextComps.splice(toIndex, 0, moved);
        return { ...p, components: nextComps };
      })
    );
  };

  const handleMoveUp = (pageNumber, index) => {
    if (index <= 0) return;
    handleReorderWithinPage(pageNumber, index, index - 1);
  };

  const handleMoveDown = (pageNumber, index) => {
    const targetPage = pages.find((p) => p.pageNumber === pageNumber);
    if (!targetPage || index >= targetPage.components.length - 1) return;
    handleReorderWithinPage(pageNumber, index, index + 1);
  };

  // Move component from one page to another
  const handleMoveToPage = (instanceId, targetPageNumber, targetIndex = null) => {
    setPages((prev) => {
      let movedComp = null;

      // Find and remove from current page
      const cleaned = prev.map((p) => {
        const filtered = p.components.filter((c) => {
          if (c.instanceId === instanceId) {
            movedComp = { ...c, pageNumber: targetPageNumber };
            return false;
          }
          return true;
        });
        return { ...p, components: filtered };
      });

      if (!movedComp) return prev;

      // Ensure target page exists
      let pageExists = cleaned.some((p) => p.pageNumber === targetPageNumber);
      if (!pageExists) {
        cleaned.push({
          id: `page-${targetPageNumber}`,
          pageNumber: targetPageNumber,
          title: `Report Page ${targetPageNumber}`,
          components: [movedComp]
        });
        return cleaned.sort((a, b) => a.pageNumber - b.pageNumber);
      }

      // Insert into target page
      return cleaned.map((p) => {
        if (p.pageNumber !== targetPageNumber) return p;
        const next = [...p.components];
        if (targetIndex !== null && targetIndex >= 0 && targetIndex <= next.length) {
          next.splice(targetIndex, 0, movedComp);
        } else {
          next.push(movedComp);
        }
        return { ...p, components: next };
      });
    });

    triggerToast(`Moved graph to A4 Page ${targetPageNumber}.`);
  };

  // Remove component from whichever page it's on
  const handleRemoveComponent = (instanceId) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        components: p.components.filter((c) => c.instanceId !== instanceId)
      }))
    );
  };

  // Toggle component width between full width (100%) and half width (50%)
  const handleToggleWidth = (instanceId) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        components: p.components.map((c) => {
          if (c.instanceId !== instanceId) return c;
          const currentW = String(c.width || '100%').trim();
          let nextW = '100%';
          if (currentW === '100%' || currentW === '100') {
            nextW = '50%';
          } else if (currentW === '50%' || currentW === '50') {
            nextW = '100%';
          } else if (currentW === '33%' || currentW === '33.3%' || currentW === '1/3') {
            nextW = '50%';
          } else {
            nextW = '100%';
          }
          return { ...c, width: nextW };
        })
      }))
    );
  };

  // Add a new blank A4 page
  const handleAddPage = () => {
    const nextNumber = pages.length + 1;
    const newPage = {
      id: `page-${nextNumber}`,
      pageNumber: nextNumber,
      title: `Additional Analysis (Page ${nextNumber})`,
      components: []
    };
    setPages((prev) => [...prev, newPage]);
    triggerToast(`Added A4 Page ${nextNumber} to document canvas.`);
  };

  // Remove empty page
  const handleRemovePage = (pageId) => {
    if (pages.length <= 2) {
      triggerToast('Minimum 2 pages recommended for academic dossier.');
      return;
    }
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      return filtered.map((p, idx) => ({
        ...p,
        pageNumber: idx + 1
      }));
    });
    triggerToast('Removed empty page from document.');
  };

  // Reset all pages to blank
  const handleResetCanvas = () => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        components: []
      }))
    );
    triggerToast('Report document canvas cleared.');
  };

  // Reload recommended template
  const handleLoadDefaultTemplate = () => {
    if (!availableComponents || availableComponents.length === 0) return;
    const initialPages = buildInitialPages(availableComponents, mode);
    setPages(initialPages);
    triggerToast('Loaded recommended academic dossier layout.');
  };

  // Export Structured Vector PDF
  const handleExportPDF = async () => {
    const totalComponents = pages.reduce((sum, p) => sum + (p.components?.length || 0), 0);
    if (totalComponents === 0) {
      triggerToast('Add at least one visualization card to export.');
      return;
    }

    setIsExporting(true);
    try {
      const entityInfo = mode === 'student' ? dataset?.studentInfo : dataset?.cohortInfo;
      const reportTitle = mode === 'student'
        ? `Academic Dossier - ${dataset?.studentInfo?.name || 'Student'}`
        : `Cohort Review - ${dataset?.cohortInfo?.departmentLabel || 'Department'}`;

      const savedFilename = await exportCustomReportPDF({
        title: 'BANNARI AMMAN INSTITUTE OF TECHNOLOGY',
        subtitle: reportTitle,
        scope: mode,
        entityInfo: entityInfo || {},
        dataset: dataset,
        pages: pages
      });

      triggerToast(`Report downloaded: ${savedFilename}`);
      setIsPreviewOpen(false);
    } catch (err) {
      console.error('Failed to export report PDF:', err);
      alert(`PDF Export Error: ${err.message || 'Could not generate structured vector PDF'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const allCanvasComponents = pages.flatMap((p) => p.components || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 500,
            border: '1px solid #334155'
          }}
        >
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scope / Target Dataset Selector Bar */}
      <ReportDataSelector
        mode={mode}
        onModeChange={(newMode) => setMode(newMode)}
        selectedStudent={selectedStudent}
        onSelectStudent={(reg) => setSelectedStudent(reg)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(dept) => setSelectedDepartment(dept)}
        selectedSemester={selectedSemester}
        onSemesterChange={(sem) => setSelectedSemester(sem)}
        dataset={dataset}
        loading={loading}
        onRefresh={fetchDataset}
      />

      {/* Real Error State (No fake fallback data) */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#dc2626" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b' }}>
                Academic Data Extraction Error
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '2px' }}>
                {error}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDataset}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Spacious 2-Column Document Workspace (Third column removed!) ── */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', minWidth: 0, width: '100%' }}>
        {/* Column 1 (Left): AI Assistant Copilot with Pinned Input */}
        <AIConversationSidebar
          scope={mode}
          dataset={dataset}
          availableComponents={availableComponents}
          onToggleComponent={handleToggleComponent}
          onSelectStudent={(reg) => setSelectedStudent(reg)}
          isCollapsed={isAiCollapsed}
          onToggleCollapse={() => setIsAiCollapsed(!isAiCollapsed)}
        />

        {/* Column 2 (Right/Main): Full-Width Report Canvas & Direct Graph Selector */}
        <ReportCanvas
          scope={mode}
          dataset={dataset}
          availableComponents={availableComponents}
          pages={pages}
          selectedCardId={selectedCardId}
          onSelectCard={(id) => setSelectedCardId((prev) => (prev === id ? null : id))}
          onToggleComponent={handleToggleComponent}
          zoom={zoom}
          onZoomChange={setZoom}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveToPage={handleMoveToPage}
          onRemove={handleRemoveComponent}
          onToggleWidth={handleToggleWidth}
          onReorderWithinPage={handleReorderWithinPage}
          onDropFromLibrary={handleDropFromLibrary}
          onLoadDefaultTemplate={handleLoadDefaultTemplate}
          onResetCanvas={handleResetCanvas}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          onPreview={() => setIsPreviewOpen(true)}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
          canvasRef={canvasRef}
        />
      </div>

      {/* Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        reportTitle={mode === 'student' ? 'Individual Student Report' : 'Department Cohort Report'}
        pages={pages}
        canvasComponents={allCanvasComponents}
        scope={mode}
        dataset={dataset}
      />
    </div>
  );
};

export default AIReportBuilder;
