import React from 'react';
import { BarChart3, Database } from 'lucide-react';

/**
 * Clean Empty State for Visualizations
 */
export const ChartEmptyState = ({
  height = 360,
  isInitial = false,
  title = null,
  description = null
}) => {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}
    >
      {isInitial ? (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#2563eb'
            }}
          >
            <BarChart3 size={28} />
          </div>
          <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.35rem' }}>
            {title || 'Visualization Workspace Ready'}
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 460, lineHeight: 1.5, margin: 0 }}>
            {description || 'Ask questions or choose prompts to dynamically construct charts with real grounded university data.'}
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              color: '#64748b'
            }}
          >
            <Database size={26} />
          </div>
          <h4 style={{ color: '#1e293b', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.25rem' }}>
            {title || 'No Records Found'}
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.825rem', maxWidth: 420, lineHeight: 1.5, margin: 0 }}>
            {description || 'No data points matched the active query filters. Try selecting a different cohort or broadening your prompt criteria.'}
          </p>
        </>
      )}
    </div>
  );
};

export default ChartEmptyState;
