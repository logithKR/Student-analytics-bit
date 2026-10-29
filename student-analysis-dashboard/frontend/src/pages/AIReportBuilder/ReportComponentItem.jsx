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
import BarChartComponent from '../../components/charts/BarChartComponent';
import PieChartComponent from '../../components/charts/PieChartComponent';
import RadarChartComponent from '../../components/charts/RadarChartComponent';
import StackedBarChartComponent from '../../components/charts/StackedBarChartComponent';
import AreaChartComponent from '../../components/charts/AreaChartComponent';

/**
 * Universal Card Header for Report Canvas Items
 * Guarantees unified title layout, clean badge alignment, subtitle formatting,
 * and top-right docked management toolbar that NEVER breaks onto new lines.
 */
const CardHeader = ({ title, subtitle, badge, toolbar }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '0.65rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--theme-border, #292929)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
          <h3
            style={{
              fontSize: '0.84rem',
              fontWeight: 800,
              color: 'var(--theme-text-primary, #FFFFFF)',
              margin: 0,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={title}
          >
            {title}
          </h3>
          {badge && (
            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'var(--theme-accent, #FFD43B)',
                color: 'var(--theme-accent-text, #080808)',
                border: '1px solid var(--theme-accent, #FFD43B)',
                letterSpacing: '0.04em',
                flexShrink: 0,
                lineHeight: 1.2
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '0.66rem',
              color: 'var(--theme-text-secondary, #A3A3A3)',
              margin: '2px 0 0 0',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={subtitle}
          >
            {subtitle}
          </p>
        )}
      </div>

      {toolbar && (
        <div style={{ flexShrink: 0 }}>
          {toolbar}
        </div>
      )}
    </div>
  );
};

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

  // Compact docked card toolbar
  const renderCardToolbar = () => {
    if (isPreview) return null;

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          background: 'var(--theme-surface-elevated, #1C1C1C)',
          border: '1px solid var(--theme-border, #292929)',
          borderRadius: '20px',
          padding: '2px 6px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
              padding: '2px 5px',
              fontSize: '0.62rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid var(--theme-accent, #FFD43B)',
              background: 'var(--theme-accent, #FFD43B)',
              color: 'var(--theme-accent-text, #080808)',
              cursor: 'pointer'
            }}
          >
            <Check size={10} strokeWidth={3} />
            <span>Active</span>
          </button>
        )}

        {/* Page Switcher Buttons P1 / P2 */}
        {onMoveToPage && (
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--theme-card-bg, #141414)', borderRadius: '4px', padding: '1px', border: '1px solid var(--theme-border, #292929)' }}>
            <button
              type="button"
              onClick={() => onMoveToPage(component.instanceId, 1)}
              title="Move to Page 1"
              style={{
                padding: '2px 5px',
                fontSize: '0.64rem',
                fontWeight: 700,
                borderRadius: '3px',
                border: 'none',
                background: currentPageNumber === 1 ? 'var(--theme-accent, #FFD43B)' : 'transparent',
                color: currentPageNumber === 1 ? 'var(--theme-accent-text, #080808)' : 'var(--theme-text-secondary, #A3A3A3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
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
                fontSize: '0.64rem',
                fontWeight: 700,
                borderRadius: '3px',
                border: 'none',
                background: currentPageNumber === 2 ? 'var(--theme-accent, #FFD43B)' : 'transparent',
                color: currentPageNumber === 2 ? 'var(--theme-accent-text, #080808)' : 'var(--theme-text-secondary, #A3A3A3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
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
              color: 'var(--theme-text-secondary, #A3A3A3)',
              padding: '2px 3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '3px'
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
              color: index === 0 ? 'var(--theme-border, #292929)' : 'var(--theme-text-secondary, #A3A3A3)',
              padding: '2px 3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '3px'
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
              color: index === totalCount - 1 ? 'var(--theme-border, #292929)' : 'var(--theme-text-secondary, #A3A3A3)',
              padding: '2px 3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '3px'
            }}
          >
            <ChevronDown size={13} />
          </button>
        )}

        {/* Remove */}
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
              padding: '2px 3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '3px'
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
    background: 'var(--theme-card-bg, #141414)',
    border: isPreview ? '1px solid var(--theme-border, #292929)' : (isSelected ? '2px solid var(--theme-accent, #FFD43B)' : '1px solid var(--theme-border, #292929)'),
    borderRadius: '10px',
    padding: '12px 14px',
    boxShadow: isPreview ? 'none' : (isSelected ? '0 0 0 3px rgba(255, 212, 59, 0.25)' : '0 2px 6px rgba(0,0,0,0.06)'),
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
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge="KPI"
          toolbar={renderCardToolbar()}
        />

        <div style={{ display: 'grid', gridTemplateColumns: isHalfWidth ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '8px' }}>
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                background: 'var(--theme-surface-elevated, #1C1C1C)',
                border: '1px solid var(--theme-border, #292929)',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--theme-text-secondary, #A3A3A3)', textTransform: 'uppercase' }}>{c.title}</span>
                <div style={{ color: c.color === 'green' ? '#10b981' : c.color === 'red' ? '#ef4444' : 'var(--theme-accent, #FFD43B)' }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.color === 'green' ? '#10b981' : c.color === 'red' ? '#ef4444' : 'var(--theme-text-primary, #FFFFFF)', margin: '4px 0' }}>
                {c.value}
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--theme-text-secondary, #A3A3A3)' }}>{c.sub}</span>
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
    const chartHeight = isThird ? 190 : (isHalfWidth ? 200 : 220);

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
          xField={config.xField || 'grade' || 'name'}
          yField={config.yField || 'count' || 'value'}
          height={chartHeight}
          isDoughnut={true}
        />
      );
    } else if (viz === 'radar') {
      chartNode = (
        <RadarChartComponent
          data={chartData}
          xField={config.xField || 'subject'}
          yField={config.yField || 'average'}
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
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge={component.category ? component.category.toUpperCase() : 'CHARTS'}
          toolbar={renderCardToolbar()}
        />
        <div style={{ flex: 1, width: '100%', minHeight: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {chartNode}
        </div>
      </div>
    );
  }

  // 3. Special Progress Bar List for Top At-Risk Courses
  if (component.id === 'cohort_vulnerable_courses_table' || component.id === 'cohort_vulnerable_courses_card') {
    const list = component.data || [];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

    return (
      <div {...getContainerProps()}>
        <CardHeader
          title="Top At-Risk Courses"
          subtitle="Curricular modules with highest failure concentration"
          badge="AT-RISK"
          toolbar={renderCardToolbar()}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center', padding: '4px 0' }}>
          {list.slice(0, 5).map((item, idx) => {
            const failVal = item.failPct !== undefined
              ? item.failPct
              : (item.failCount && (item.passCount + item.failCount) > 0
                  ? Math.round((item.failCount / (item.passCount + item.failCount)) * 100)
                  : item.failCount || 0);

            const color = colors[idx % colors.length];

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem' }}>
                <span style={{ width: '70px', fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.subject}
                </span>
                <div style={{ flex: 1, height: '6px', background: 'var(--theme-surface-elevated, #1C1C1C)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(5, failVal))}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px'
                    }}
                  />
                </div>
                <span style={{ width: '36px', textAlign: 'right', fontWeight: 700, color: 'var(--theme-text-secondary, #A3A3A3)', fontSize: '0.72rem' }}>
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
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge="LEDGER"
          toolbar={renderCardToolbar()}
        />

        {rows.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--theme-text-secondary, #A3A3A3)', fontSize: '0.78rem' }}>
            No records available for this ledger.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--theme-border, #292929)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ background: 'var(--theme-surface-elevated, #1C1C1C)', borderBottom: '1px solid var(--theme-border, #292929)', color: 'var(--theme-text-secondary, #A3A3A3)', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {cols.map((col, cIdx) => {
                    const isNumericCol = ['im', 'em', 'tot', 'total', 'credits', 'marks', 'count', 'sgpa', 'gpa', 'arrears'].includes(col.name);
                    const isBadgeCol = ['res', 'result', 'grd', 'grade', 'status'].includes(col.name);
                    const align = col.align || ((isNumericCol || isBadgeCol) ? 'center' : 'left');

                    return (
                      <th key={cIdx} style={{ padding: '6px 10px', textAlign: align }}>
                        {col.label || col.header || col.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--theme-border, #292929)', background: rIdx % 2 === 0 ? 'var(--theme-card-bg, #141414)' : 'var(--theme-surface-elevated, #1C1C1C)' }}>
                    {cols.map((col, cIdx) => {
                      const val = row[col.name];
                      const isResult = col.name === 'res' || col.name === 'result';
                      const isGrade = col.name === 'grd' || col.name === 'grade';
                      const isNumericCol = ['im', 'em', 'tot', 'total', 'credits', 'marks', 'count', 'sgpa', 'gpa', 'arrears'].includes(col.name);
                      const isBadgeCol = ['res', 'result', 'grd', 'grade', 'status'].includes(col.name);
                      const align = col.align || ((isNumericCol || isBadgeCol) ? 'center' : 'left');

                      return (
                        <td key={cIdx} style={{ padding: '6px 10px', textAlign: align, color: 'var(--theme-text-primary, #FFFFFF)' }}>
                          {isResult ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                background: String(val).toLowerCase().includes('pass') ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                                color: String(val).toLowerCase().includes('pass') ? '#10b981' : '#ef4444',
                                border: `1px solid ${String(val).toLowerCase().includes('pass') ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                letterSpacing: '0.02em'
                              }}
                            >
                              {val}
                            </span>
                          ) : isGrade ? (
                            <span style={{ fontWeight: 800, fontSize: '0.74rem', color: ['U', 'RA'].includes(val) ? '#ef4444' : ['O', 'A+', 'A'].includes(val) ? '#10b981' : 'var(--theme-text-primary, #FFFFFF)' }}>
                              {val}
                            </span>
                          ) : isNumericCol ? (
                            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge="ANALYSIS"
          toolbar={renderCardToolbar()}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', flex: 1, alignItems: 'stretch' }}>
          {/* Strongest */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.74rem', marginBottom: '8px' }}>
              <Award size={14} />
              <span>Top Academic Mastery</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {strongest.slice(0, 3).map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', padding: '2px 0' }}>
                  <span style={{ fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>{s.code}</span>
                  <span style={{ fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '10px', minWidth: '55px', textAlign: 'center' }}>
                    {s.tot} / 100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weakest */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 800, fontSize: '0.74rem', marginBottom: '8px' }}>
              <AlertTriangle size={14} />
              <span>Remedial Attention Focus</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {weakest.slice(0, 3).map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', padding: '2px 0' }}>
                  <span style={{ fontWeight: 700, color: 'var(--theme-text-primary, #FFFFFF)' }}>{w.code}</span>
                  <span style={{ fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.14)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '10px', minWidth: '55px', textAlign: 'center' }}>
                    {w.tot} / 100
                  </span>
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
      <div {...getContainerProps()}>
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge="AI SUMMARY"
          toolbar={renderCardToolbar()}
        />

        <div style={{ fontSize: '0.74rem', color: 'var(--theme-text-primary, #FFFFFF)', lineHeight: 1.55, background: 'var(--theme-surface-elevated, #1C1C1C)', border: '1px solid var(--theme-border, #292929)', borderRadius: '6px', padding: '8px 10px' }}>
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
        <CardHeader
          title={component.title}
          subtitle={component.subtitle}
          badge="ENDORSEMENT"
          toolbar={renderCardToolbar()}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '16px', paddingBottom: '4px' }}>
          {signatories.map((sig, sIdx) => (
            <div key={sIdx} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--theme-text-secondary, #A3A3A3)', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.6 }}>
                  [ Official Seal / Signature ]
                </span>
              </div>
              <div style={{ width: '85%', borderTop: '1px dashed var(--theme-border, #292929)', paddingTop: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)' }}>{sig.role}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--theme-text-secondary, #A3A3A3)', marginTop: '2px' }}>{sig.dept}</div>
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
      <CardHeader
        title={component.title}
        subtitle={component.subtitle}
        badge="ITEM"
        toolbar={renderCardToolbar()}
      />
    </div>
  );
};

export default ReportComponentItem;
