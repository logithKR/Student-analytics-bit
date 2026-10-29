import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Check,
  GripVertical,
  BarChart2,
  LineChart,
  PieChart,
  Table,
  Sparkles,
  ShieldCheck,
  FileSignature,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  FileText
} from 'lucide-react';

export const ComponentLibrarySidebar = ({
  availableComponents = [],
  pages = [],
  onAddComponentToPage,
  scope = 'student',
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Collapsible section state for the 3 blocks
  const [openSections, setOpenSections] = useState({
    block1: true,
    block2: true,
    block3: true
  });

  const toggleSection = (blockKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [blockKey]: !prev[blockKey]
    }));
  };

  // Helper to check where a component is placed
  const getPlacedPages = (compId) => {
    const placed = [];
    (pages || []).forEach((p) => {
      const exists = (p.components || []).some(
        (c) => c.id === compId || c.originalId === compId
      );
      if (exists) {
        placed.push(p.pageNumber);
      }
    });
    return placed;
  };

  const getComponentIcon = (comp) => {
    if (comp.type === 'kpi_group') return <Layers size={14} color="#2563eb" />;
    if (comp.type === 'signature_block') return <FileSignature size={14} color="#2563eb" />;
    if (comp.type === 'ai_insight' || comp.type === 'narrative_card') return <Sparkles size={14} color="#8b5cf6" />;
    if (comp.type === 'table') return <Table size={14} color="#059669" />;
    if (comp.type === 'highlight_card') return <ShieldCheck size={14} color="#d97706" />;

    const viz = comp.visualization || comp.config?.type || 'bar';
    if (viz === 'area' || viz === 'line') return <LineChart size={14} color="#4f46e5" />;
    if (viz === 'donut' || viz === 'pie') return <PieChart size={14} color="#4f46e5" />;
    if (viz === 'radar') return <ShieldCheck size={14} color="#4f46e5" />;
    return <BarChart2 size={14} color="#4f46e5" />;
  };

  const handleDragStart = (e, comp) => {
    e.dataTransfer.setData('application/json', JSON.stringify(comp));
    e.dataTransfer.setData('text/plain', comp.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Group components into the 3 clean blocks
  const block1Components = availableComponents.filter(
    (c) => c.type === 'kpi_group' || c.type === 'signature_block' || c.category === 'metrics' || c.category === 'structure'
  );

  const block2Components = availableComponents.filter(
    (c) => c.type === 'chart' || c.category === 'charts'
  );

  const block3Components = availableComponents.filter(
    (c) =>
      c.type === 'table' ||
      c.type === 'ai_insight' ||
      c.type === 'highlight_card' ||
      c.type === 'narrative_card' ||
      c.category === 'insights' ||
      c.category === 'tables' ||
      c.category === 'ai'
  );

  const blocks = [
    {
      key: 'block1',
      num: '01',
      title: 'Student & Institutional Information',
      desc: 'Academic identity, key credentials & official signatures',
      icon: <UserCheck size={15} color="#2563eb" />,
      color: '#2563eb',
      bg: '#eff6ff',
      components: block1Components
    },
    {
      key: 'block2',
      num: '02',
      title: 'Academic Performance & Visualizations',
      desc: 'High-resolution charts, SGPA curve & grade breakdown',
      icon: <BarChart2 size={15} color="#4f46e5" />,
      color: '#4f46e5',
      bg: '#eef2ff',
      components: block2Components
    },
    {
      key: 'block3',
      num: '03',
      title: 'Analysis, Ledgers & Insights',
      desc: 'Examination ledgers, AI diagnostic findings & remedial roadmaps',
      icon: <Sparkles size={15} color="#8b5cf6" />,
      color: '#8b5cf6',
      bg: '#faf5ff',
      components: block3Components
    }
  ];

  if (isCollapsed) {
    return (
      <div
        style={{
          width: '42px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem 0',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand Report Components"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
        >
          <ChevronLeft size={18} />
        </button>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={13} color="#2563eb" style={{ transform: 'rotate(90deg)' }} />
          <span>Report Sections ({availableComponents.length})</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{
        width: '320px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '820px',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      {/* ── Sidebar Header ── */}
      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="#2563eb" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Report Component Library
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid #bfdbfe'
              }}
            >
              {availableComponents.length} Verified
            </span>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse Library"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
          Drag cards to A4 sheets or click <strong style={{ color: '#2563eb' }}>+ Page 1</strong> / <strong style={{ color: '#7c3aed' }}>+ Page 2</strong>.
        </p>
      </div>

      {/* ── 3 Uniform Section Blocks ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {blocks.map((block) => {
          const isOpen = openSections[block.key];
          return (
            <div
              key={block.key}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#ffffff',
                overflow: 'hidden'
              }}
            >
              {/* Block Header (Uniform dimensions and clean styling) */}
              <button
                type="button"
                onClick={() => toggleSection(block.key)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: block.bg,
                  border: 'none',
                  borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: block.color,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {block.num}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      {block.title}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {block.components.length} components
                    </div>
                  </div>
                </div>

                <div style={{ color: '#64748b' }}>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>
              </button>

              {/* Block Cards List */}
              {isOpen && (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {block.components.length === 0 ? (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>
                      No available components in this category.
                    </div>
                  ) : (
                    block.components.map((comp) => {
                      const placedPages = getPlacedPages(comp.id);
                      const isPlacedOnP1 = placedPages.includes(1);
                      const isPlacedOnP2 = placedPages.includes(2);

                      return (
                        <div
                          key={comp.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, comp)}
                          style={{
                            background: '#ffffff',
                            border: placedPages.length > 0 ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            cursor: 'grab',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = block.color)}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = placedPages.length > 0 ? '#cbd5e1' : '#e2e8f0')
                          }
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <div style={{ padding: '3px', background: '#f8fafc', borderRadius: '4px', marginTop: '1px' }}>
                                {getComponentIcon(comp)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0f172a', lineHeight: 1.2 }}>
                                  {comp.title}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                                  {comp.subtitle}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Placed Status & Dual Action Buttons */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: '8px',
                              paddingTop: '6px',
                              borderTop: '1px solid #f1f5f9'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {isPlacedOnP1 && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    border: '1px solid #bfdbfe'
                                  }}
                                >
                                  Page 1
                                </span>
                              )}
                              {isPlacedOnP2 && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    background: '#faf5ff',
                                    color: '#7c3aed',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    border: '1px solid #e9d5ff'
                                  }}
                                >
                                  Page 2
                                </span>
                              )}
                              {placedPages.length === 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.62rem', color: '#94a3b8' }}>
                                  <GripVertical size={10} /> Drag to sheet
                                </span>
                              )}
                            </div>

                            {/* Dual Add Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => onAddComponentToPage(comp, 1)}
                                title="Add directly to A4 Page 1"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  background: isPlacedOnP1 ? '#f0fdf4' : '#eff6ff',
                                  color: isPlacedOnP1 ? '#16a34a' : '#2563eb',
                                  cursor: 'pointer'
                                }}
                              >
                                {isPlacedOnP1 ? <Check size={10} /> : <Plus size={10} />}
                                <span>Page 1</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onAddComponentToPage(comp, 2)}
                                title="Add directly to A4 Page 2"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #e9d5ff',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  background: isPlacedOnP2 ? '#f0fdf4' : '#faf5ff',
                                  color: isPlacedOnP2 ? '#16a34a' : '#7c3aed',
                                  cursor: 'pointer'
                                }}
                              >
                                {isPlacedOnP2 ? <Check size={10} /> : <Plus size={10} />}
                                <span>Page 2</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sidebar Footer ── */}
      <div style={{ padding: '0.6rem 0.85rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={12} color="#7c3aed" />
        <span>Strictly grounded in verified database records.</span>
      </div>
    </aside>
  );
};

export default ComponentLibrarySidebar;
