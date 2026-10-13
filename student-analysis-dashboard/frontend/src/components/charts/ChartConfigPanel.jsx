import React from 'react';
import {
  BarChart2, LineChart, PieChart as PieIcon, Table2,
  RotateCcw, SlidersHorizontal, Check
} from 'lucide-react';

const CORE_CHART_OPTIONS = [
  { id: 'bar', label: 'Bar Chart', icon: BarChart2 },
  { id: 'line', label: 'Line Chart', icon: LineChart },
  { id: 'pie', label: 'Pie Chart', icon: PieIcon },
  { id: 'table', label: 'Data Table', icon: Table2 },
];

export const ChartConfigPanel = ({
  config = {},
  onChangeConfig = () => {},
  onResetConfig = () => {},
  columns = [],
  compatibleChartTypes = ['bar', 'line', 'pie', 'table'],
  fallbackNotice = null
}) => {
  const safeConfig = config || {};
  const currentType = safeConfig.type || 'bar';
  const columnNames = columns.map(c => c.name);
  const numericColumns = columns.filter(c => c.type === 'number').map(c => c.name);

  const handleTypeSelect = (typeId) => {
    onChangeConfig({
      ...safeConfig,
      type: typeId
    });
  };

  const handleFieldChange = (key, value) => {
    onChangeConfig({
      ...safeConfig,
      [key]: value
    });
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      marginBottom: '1rem'
    }}>
      {/* ── Top Bar: Segmented Chart Type Selector ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="#2563eb" />
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
            Chart Presentation
          </span>
        </div>

        {/* Intelligent Chart Type Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          gap: '2px'
        }}>
          {CORE_CHART_OPTIONS.map(opt => {
            const isSelected = currentType === opt.id;
            const isCompatible = compatibleChartTypes.includes(opt.id);
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={!isCompatible}
                onClick={() => handleTypeSelect(opt.id)}
                title={!isCompatible ? `${opt.label} is incompatible with this data structure` : opt.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#2563eb' : (isCompatible ? '#475569' : '#94a3b8'),
                  boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: isCompatible ? 'pointer' : 'not-allowed',
                  opacity: isCompatible ? 1 : 0.45,
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reset Action */}
        <button
          type="button"
          onClick={onResetConfig}
          title="Reset to AI Recommended settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Fallback Notice if schema was adjusted */}
      {fallbackNotice && (
        <div style={{
          marginTop: '0.6rem',
          fontSize: '0.75rem',
          color: '#d97706',
          background: '#fffbeb',
          padding: '0.35rem 0.65rem',
          borderRadius: '6px',
          border: '1px solid #fef3c7'
        }}>
          ℹ️ {fallbackNotice}
        </div>
      )}

      {/* ── Dimension & Axis Controls (Only shown for graphical charts) ── */}
      {currentType !== 'table' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.75rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              X-Axis (Dimension)
            </label>
            <select
              value={safeConfig.xField || ''}
              onChange={(e) => handleFieldChange('xField', e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                background: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {columnNames.map(col => (
                <option key={col} value={col}>{col.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
              Y-Axis (Metric)
            </label>
            <select
              value={safeConfig.yField || ''}
              onChange={(e) => handleFieldChange('yField', e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                background: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {columnNames.map(col => (
                <option key={col} value={col}>
                  {col.replace(/_/g, ' ')} {numericColumns.includes(col) ? '(Metric)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Grid & Legend Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                checked={safeConfig.showGrid !== false}
                onChange={(e) => handleFieldChange('showGrid', e.target.checked)}
              />
              <span>Grid</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                checked={safeConfig.legend !== false}
                onChange={(e) => handleFieldChange('legend', e.target.checked)}
              />
              <span>Legend</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartConfigPanel;
