import React from 'react';
import {
  BarChart2, AlignLeft, LineChart, PieChart as PieIcon,
  Table2, Activity, RotateCcw, Sparkles, Download, Code,
  CheckCircle, Layers
} from 'lucide-react';

const PRESENTATION_OPTIONS = [
  { id: 'bar', label: 'Bar', icon: BarChart2 },
  { id: 'horizontal_bar', label: 'Horiz Bar', icon: AlignLeft },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'pie', label: 'Pie', icon: PieIcon },
  { id: 'donut', label: 'Donut', icon: PieIcon },
  { id: 'table', label: 'Table', icon: Table2 },
];

export const ChartConfigPanel = ({
  config = {},
  onChangeConfig = () => {},
  onResetConfig = () => {},
  onExportCSV = null,
  onToggleSpec = null,
  showSpec = false,
  compatibleChartTypes = ['bar', 'horizontal_bar', 'line', 'pie', 'donut', 'table'],
  fallbackNotice = null
}) => {
  const safeConfig = config || {};
  const currentType = safeConfig.type || safeConfig.visualization || 'bar';
  const xLabel = safeConfig.xAxisLabel || safeConfig.xAxis?.label || safeConfig.xField || 'Dimension';
  const yLabel = safeConfig.yAxisLabel || safeConfig.yAxis?.label || safeConfig.yField || 'Metric';
  const unit = safeConfig.yAxis?.unit ? ` (${safeConfig.yAxis.unit})` : '';

  const handleTypeSelect = (typeId) => {
    onChangeConfig({
      ...safeConfig,
      type: typeId,
      visualization: typeId,
      layout: typeId === 'horizontal_bar' ? 'horizontal' : 'vertical'
    });
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '0.85rem 1.25rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem'
    }}>
      {/* ── Top Bar: Title & Inferred Intelligence Meta ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Inferred Dimensions Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <Sparkles size={13} color="#2563eb" />
            <span>AI Detected</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: '#475569'
          }}>
            <span style={{ color: '#94a3b8' }}>X-Axis:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{xLabel}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#94a3b8' }}>Y-Axis:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{yLabel}{unit}</span>
          </div>
        </div>

        {/* Quick Presentation Switcher & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Chart Type Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px'
          }}>
            {PRESENTATION_OPTIONS.map(opt => {
              const isSelected = currentType === opt.id || (currentType === 'pie' && opt.id === 'donut');
              const isCompatible = compatibleChartTypes.includes(opt.id) ||
                (opt.id === 'donut' && compatibleChartTypes.includes('pie')) ||
                (opt.id === 'horizontal_bar' && compatibleChartTypes.includes('bar'));
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!isCompatible}
                  onClick={() => handleTypeSelect(opt.id)}
                  title={!isCompatible ? `${opt.label} is incompatible with this data structure` : `Switch view to ${opt.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.6rem',
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
                  <Icon size={13} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Spec, Reset, Export */}
          {onToggleSpec && (
            <button
              type="button"
              onClick={onToggleSpec}
              title="Inspect AI Graph Specification JSON"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: '1px solid #e2e8f0',
                background: showSpec ? '#f1f5f9' : '#ffffff',
                color: showSpec ? '#2563eb' : '#64748b',
                cursor: 'pointer'
              }}
            >
              <Code size={13} />
              <span>Spec</span>
            </button>
          )}

          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              title="Export visualization dataset as CSV"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
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
              <Download size={13} />
              <span>CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetConfig}
            title="Reset to AI Recommended specification"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
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
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Fallback Notice if schema was adjusted */}
      {fallbackNotice && (
        <div style={{
          fontSize: '0.75rem',
          color: '#d97706',
          background: '#fffbeb',
          padding: '0.3rem 0.6rem',
          borderRadius: '6px',
          border: '1px solid #fef3c7'
        }}>
          ℹ️ {fallbackNotice}
        </div>
      )}
    </div>
  );
};

export default ChartConfigPanel;
