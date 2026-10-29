import React from 'react';
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Layers,
  FileSignature,
  Check,
  X
} from 'lucide-react';
import ChartContainer from '../../components/charts/ChartContainer';
import BarChartComponent from '../../components/charts/BarChartComponent';
import PieChartComponent from '../../components/charts/PieChartComponent';
import RadarChartComponent from '../../components/charts/RadarChartComponent';
import StackedBarChartComponent from '../../components/charts/StackedBarChartComponent';
import AreaChartComponent from '../../components/charts/AreaChartComponent';

export const ReportComponentItem = ({
  component,
  index,
  totalCount,
  currentPageNumber = 1,
  totalPages = 2,
  isSelected = false,
  isPreview = false,
  onSelectCard,
  onMoveUp,
  onMoveDown,
  onMoveToPage,
  onRemove,
  onToggleWidth,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const getCardWidth = () => {
    const w = String(component.width || '100%').trim();
    if (w === '33%' || w === '33.3%' || w === '33' || w === '1/3') {
      return 'calc(33.333% - 8px)';
    }
    if (w === '50%' || w === '50' || w === 'half') {
      return 'calc(50% - 6px)';
    }
    if (w === '60%' || w === '60') {
      return 'calc(60% - 6px)';
    }
    if (w === '40%' || w === '40') {
      return 'calc(40% - 6px)';
    }
    return '100%';
  };

  const isHalfWidth = component.width === '50' || component.width === '50%' || component.width === '33%' || component.width === '33.3%' || component.width === '40%';
  const isThird = component.width === '33%' || component.width === '33.3%' || component.width === '33' || component.width === '1/3';

  // Render top right action controls on each card (Hidden in preview mode)
  const renderCardToolbar = () => {
    if (isPreview) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '2px 6px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toggle Selected / Deselected Indicator */}
        {isSelected && onSelectCard && (
          <button
            type="button"
            onClick={() => onSelectCard(component.instanceId)}
            title="Click to deselect"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              fontSize: '0.64rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#2563eb',
              cursor: 'pointer'
            }}
          >
            <Check size={10} strokeWidth={3} />
            <span>Selected</span>
            <X size={10} style={{ marginLeft: '2px', opacity: 0.7 }} />
          </button>
        )}

        {/* Page Switcher Buttons */}
        {onMoveToPage && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#e2e8f0', borderRadius: '4px', padding: '1px' }}>
            <button
              type="button"
              onClick={() => onMoveToPage(component.instanceId, 1)}
              title="Move to Page 1"
              style={{
                padding: '2px 5px',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '3px',
                border: 'none',
                background: currentPageNumber === 1 ? '#2563eb' : 'transparent',
                color: currentPageNumber === 1 ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              P1
            </button>
            <button
              type="button"
              onClick={() => onMoveToPage(component.instanceId, 2)}
              title="Move to Page 2"
              style={{
                padding: '2px 5px',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '3px',
                border: 'none',
                background: currentPageNumber === 2 ? '#2563eb' : 'transparent',
                color: currentPageNumber === 2 ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              P2
            </button>
          </div>
        )}

        {/* Width Toggle */}
        {onToggleWidth && (
          <button
            type="button"
            onClick={() => onToggleWidth(component.instanceId)}
            title={component.width === '100%' ? 'Set to Half Width (50%)' : 'Expand to Full Width (100%)'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {component.width === '100%' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        )}

        {/* Move Up */}
        {onMoveUp && (
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Move up"
            style={{
              background: 'none',
              border: 'none',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              color: index === 0 ? '#cbd5e1' : '#64748b',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronUp size={13} />
          </button>
        )}

        {/* Move Down */}
        {onMoveDown && (
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            title="Move down"
            style={{
              background: 'none',
              border: 'none',
              cursor: index === totalCount - 1 ? 'not-allowed' : 'pointer',
              color: index === totalCount - 1 ? '#cbd5e1' : '#64748b',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronDown size={13} />
          </button>
        )}

        {/* Remove / Deselect from Canvas */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(component.instanceId)}
            title="Remove from canvas"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  // Proportional card style sized strictly for A4 physical sheets
  const cardContainerStyle = {
    width: getCardWidth(),
    boxSizing: 'border-box',
    background: '#ffffff',
    border: isPreview ? '1px solid #e2e8f0' : (isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0'),
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    boxShadow: isPreview ? 'none' : (isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)'),
    cursor: isPreview ? 'default' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column'
  };

  const getContainerProps = () => ({
    onClick: !isPreview && onSelectCard ? () => onSelectCard(component.instanceId) : undefined,
    draggable: !isPreview,
    onDragStart: !isPreview && onDragStart ? (e) => onDragStart(e, index) : undefined,
    onDragOver: !isPreview && onDragOver ? (e) => onDragOver(e, index) : undefined,
    onDrop: !isPreview && onDrop ? (e) => onDrop(e, index) : undefined,
    'data-component-id': component.instanceId || component.id,
    className: 'report-canvas-card',
    style: cardContainerStyle
  });

  // 1. KPI Cards View
  if (component.type === 'kpi_group') {
    const data = component.data || {};
    const isStudent = 'cgpa' in data;

    const cards = isStudent
      ? [
          {
            title: 'Cumulative CGPA',
            value: `${data.cgpa || 0.0} / 10.0`,
            icon: <GraduationCap size={16} />,
            color: 'blue',
            sub: `Term: Sem ${data.currentSemester || ''}`
          },
          {
            title: 'Latest SGPA',
            value: data.latestSgpa || 0.0,
            icon: <TrendingUp size={16} />,
            color: 'green',
            sub: 'Latest Semester GPA'
          },
          {
            title: 'Standing Arrears',
            value: data.totalArrears || 0,
            icon: <AlertTriangle size={16} />,
            color: data.totalArrears > 0 ? 'red' : 'green',
            sub: data.totalArrears > 0 ? 'Remedial coaching required' : 'Clear academic record'
          },
          {
            title: 'Academic Standing',
            value: data.standing?.split(' ')[0] || 'Optimal',
            icon: <Award size={16} />,
            color: data.totalArrears === 0 ? 'blue' : 'red',
            sub: `${data.evaluatedCourses || 0} evaluated courses`
          }
        ]
      : [
          {
            title: 'Total Enrolled Students',
            value: data.totalStudents || 0,
            icon: <Users size={16} />,
            color: 'blue',
            sub: 'Cohort Registered Size'
          },
          {
            title: 'Overall Pass Percentage',
            value: `${data.passPercentage || 0}%`,
            icon: <TrendingUp size={16} />,
            color: 'green',
            sub: 'Aggregate examination pass rate'
          },
          {
            title: 'Cohort Average SGPA',
            value: data.averageGpa || 0.0,
            icon: <GraduationCap size={16} />,
            color: 'blue',
            sub: `High: ${data.highestGpa || 0} · Low: ${data.lowestGpa || 0}`
          },
          {
            title: 'At-Risk Intervention Count',
            value: data.totalAtRisk || 0,
            icon: <AlertTriangle size={16} />,
            color: data.totalAtRisk > 0 ? 'red' : 'green',
            sub: `${data.criticalRisk || 0} Critical · ${data.warningRisk || 0} Warning`
          }
        ];

    return (
      <div {...getContainerProps()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#2563eb'
              }}
            />
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {component.title}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
            </div>
          </div>
          {renderCardToolbar()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isHalfWidth ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px' }}>
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{c.title}</span>
                <div style={{ color: c.color === 'green' ? '#10b981' : c.color === 'red' ? '#ef4444' : '#2563eb' }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: c.color === 'green' ? '#059669' : c.color === 'red' ? '#dc2626' : '#0f172a', margin: '2px 0' }}>
                {c.value}
              </div>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{c.sub}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Charts
  if (component.type === 'chart') {
    const viz = component.visualization || component.config?.type || 'bar';
    const chartData = component.data || [];
    const config = component.config || {};
    const chartHeight = isThird ? 200 : (isHalfWidth ? 220 : 240);

    let chartNode = null;

    if (viz === 'area' || viz === 'line') {
      chartNode = (
        <AreaChartComponent
          data={chartData}
          xField={config.xField || 'semester'}
          yField={config.yField || 'sgpa' || 'averageGpa'}
          height={chartHeight}
          unit={config.unit || 'GPA'}
          domain={config.domain || [0, 10]}
        />
      );
    } else if (viz === 'donut' || viz === 'pie') {
      chartNode = (
        <PieChartComponent
          data={chartData}
          nameField={config.xField || 'grade' || 'name'}
          valueField={config.yField || 'count' || 'value'}
          height={chartHeight}
          donut={true}
        />
      );
    } else if (viz === 'radar') {
      chartNode = (
        <RadarChartComponent
          data={chartData}
          subjectField={config.xField || 'subject'}
          valueField={config.yField || 'average'}
          height={chartHeight}
        />
      );
    } else if (viz === 'stacked_bar') {
      chartNode = (
        <StackedBarChartComponent
          data={chartData}
          xField={config.xField || 'code' || 'batch' || 'semester'}
          series={config.series || ['internalMarks', 'externalMarks']}
          height={chartHeight}
          unit={config.unit || ''}
        />
      );
    } else {
      chartNode = (
        <BarChartComponent
          data={chartData}
          xField={config.xField || 'code' || 'grade' || 'subject'}
          yField={config.yField || 'tot' || 'percentage' || 'average'}
          height={chartHeight}
          unit={config.unit || ''}
          domain={config.domain || ['auto', 'auto']}
        />
      );
    }

    return (
      <div {...getContainerProps()}>
        <ChartContainer
          title={component.title}
          subtitle={component.subtitle}
          badge={component.category?.toUpperCase()}
          height={chartHeight + 45}
          toolbarActions={renderCardToolbar()}
          style={{ border: 'none', padding: 0, boxShadow: 'none', background: 'transparent' }}
        >
          {chartNode}
        </ChartContainer>
      </div>
    );
  }

  // 3. Special Progress Bar List for Top At-Risk Courses (Matches reference screenshot!)
  if (component.id === 'cohort_vulnerable_courses_table' || component.id === 'cohort_vulnerable_courses_card') {
    const list = component.data || [];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

    return (
      <div {...getContainerProps()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Top At-Risk Courses
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>Curricular modules with highest failure concentration</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Fail %</span>
            {renderCardToolbar()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
          {list.slice(0, 5).map((item, idx) => {
            const failVal = item.failPct !== undefined
              ? item.failPct
              : (item.failCount && (item.passCount + item.failCount) > 0
                  ? Math.round((item.failCount / (item.passCount + item.failCount)) * 100)
                  : item.failCount || 0);

            const color = colors[idx % colors.length];

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
                <span style={{ width: '65px', fontWeight: 700, color: '#1e293b', fontSize: '0.72rem' }}>
                  {item.subject}
                </span>
                <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(5, failVal))}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px'
                    }}
                  />
                </div>
                <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '0.72rem' }}>
                  {failVal}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. Tabular Ledgers
  if (component.type === 'table') {
    const rows = component.data || [];
    const cols = component.columns || [];

    return (
      <div {...getContainerProps()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {component.title}
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
          </div>
          {renderCardToolbar()}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
            No records available for this ledger.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {cols.map((col, cIdx) => (
                    <th key={cIdx} style={{ padding: '5px 8px', textAlign: col.align || 'left' }}>
                      {col.label || col.header || col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    {cols.map((col, cIdx) => {
                      const val = row[col.name];
                      const isResult = col.name === 'res' || col.name === 'result';
                      const isGrade = col.name === 'grd' || col.name === 'grade';

                      return (
                        <td key={cIdx} style={{ padding: '5px 8px', textAlign: col.align || 'left', color: '#1e293b' }}>
                          {isResult ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                background: String(val).toLowerCase().includes('pass') ? '#ecfdf5' : '#fef2f2',
                                color: String(val).toLowerCase().includes('pass') ? '#059669' : '#dc2626',
                                border: `1px solid ${String(val).toLowerCase().includes('pass') ? '#a7f3d0' : '#fecaca'}`
                              }}
                            >
                              {val}
                            </span>
                          ) : isGrade ? (
                            <span style={{ fontWeight: 700, color: ['U', 'RA'].includes(val) ? '#dc2626' : ['O', 'A+', 'A'].includes(val) ? '#059669' : '#2563eb' }}>
                              {val}
                            </span>
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 5. Curricular Strengths & Weaknesses
  if (component.type === 'highlight_card') {
    const data = component.data || {};
    const strongest = data.strongest || [];
    const weakest = data.weakest || [];

    return (
      <div {...getContainerProps()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {component.title}
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
          </div>
          {renderCardToolbar()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {/* Strongest */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: 700, fontSize: '0.72rem', marginBottom: '4px' }}>
              <Award size={13} />
              <span>Top Mastery</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {strongest.slice(0, 3).map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#0f172a' }}>
                  <span style={{ fontWeight: 600 }}>{s.code}</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{s.tot} / 100</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weakest */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991b1b', fontWeight: 700, fontSize: '0.72rem', marginBottom: '4px' }}>
              <AlertTriangle size={13} />
              <span>Remedial Focus</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {weakest.slice(0, 3).map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#0f172a' }}>
                  <span style={{ fontWeight: 600 }}>{w.code}</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{w.tot} / 100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. AI Diagnostic Insight Card
  if (component.type === 'ai_insight' || component.type === 'narrative_card') {
    const rawData = component.data || component.insightText || '';
    const textToRender = typeof rawData === 'string'
      ? rawData
      : (typeof rawData === 'object' && rawData !== null
          ? (rawData.text || rawData.summary || JSON.stringify(rawData))
          : String(rawData));

    return (
      <div
        {...getContainerProps()}
        style={{
          ...cardContainerStyle,
          background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
          borderColor: isPreview ? '#e2e8f0' : (isSelected ? '#2563eb' : '#d8b4fe')
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ padding: '3px', background: '#f3e8ff', borderRadius: '5px', color: '#7c3aed' }}>
              <Sparkles size={13} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {component.title}
              </h3>
              <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
            </div>
          </div>
          {renderCardToolbar()}
        </div>

        <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.55, background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '8px 10px' }}>
          {textToRender}
        </div>
      </div>
    );
  }

  // 7. Signatures Endorsement Block
  if (component.type === 'signature_block') {
    const signatories = component.data?.signatories || [
      { role: 'Class Advisor / Faculty Mentor', dept: 'Department of Computer Science' },
      { role: 'Head of the Department', dept: 'Department of Computer Science' },
      { role: 'Dean (Academic Quality)', dept: 'Bannari Amman Institute of Technology' }
    ];

    return (
      <div {...getContainerProps()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSignature size={15} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {component.title}
              </h3>
              <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
            </div>
          </div>
          {renderCardToolbar()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '12px' }}>
          {signatories.map((sig, sIdx) => (
            <div key={sIdx} style={{ textAlign: 'center' }}>
              <div style={{ height: '28px' }} />
              <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: '5px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>{sig.role}</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '1px' }}>{sig.dept}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback view
  return (
    <div {...getContainerProps()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {component.title}
          </h3>
          <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>{component.subtitle}</p>
        </div>
        {renderCardToolbar()}
      </div>
    </div>
  );
};

export default ReportComponentItem;
