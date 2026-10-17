import React from 'react';
import { formatMetricValue, formatPercentage } from './chartFormatters';

/**
 * Universal High-Contrast Chart Tooltip
 * Works across Bar, Line, Area, Pie, Donut, Scatter, and Radar charts.
 */
export const ChartTooltip = ({
  active,
  payload,
  label,
  valueUnit = '',
  total = null,
  showPercentage = false
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: '#0f172a', // Sleek dark slate
      color: '#f8fafc',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '0.65rem 0.9rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      fontSize: '0.8rem',
      maxWidth: 320,
      zIndex: 1000,
      pointerEvents: 'none',
      lineHeight: 1.4
    }}>
      {label !== undefined && label !== null && String(label).trim() !== '' && (
        <div style={{
          fontWeight: 600,
          color: '#ffffff',
          marginBottom: '0.35rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.3rem',
          wordBreak: 'break-word'
        }}>
          {String(label)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {payload.map((item, idx) => {
          const rawVal = item.value;
          const formattedVal = formatMetricValue(rawVal);
          const color = item.color || item.payload?.fill || item.stroke || '#38bdf8';
          const name = item.name || item.dataKey || 'Value';

          // Compute percentage share if requested or available
          let pctString = null;
          if (showPercentage && total && typeof rawVal === 'number' && total > 0) {
            pctString = formatPercentage((rawVal / total) * 100);
          } else if (item.payload && typeof item.payload.percent === 'number') {
            pctString = formatPercentage(item.payload.percent * 100);
          } else if (item.payload && typeof item.payload.percentage === 'number') {
            pctString = formatPercentage(item.payload.percentage);
          }

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name.replace(/_/g, ' ')}:
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                  {formattedVal}{valueUnit ? ` ${valueUnit}` : ''}
                </span>
                {pctString && (
                  <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 500 }}>
                    ({pctString})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;
