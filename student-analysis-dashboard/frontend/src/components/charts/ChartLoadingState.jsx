import React from 'react';

/**
 * Modern Skeleton Loading State for Charts
 */
export const ChartLoadingState = ({ height = 360, message = 'Rendering visualization...' }) => {
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
        border: '1px solid #e2e8f0',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      <p style={{ marginTop: '1.25rem', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
        {message}
      </p>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
        Synthesizing metrics & drawing responsive elements
      </span>

      {/* Background Animated Bars Placeholder */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 60,
        opacity: 0.15,
        pointerEvents: 'none'
      }}>
        {[40, 75, 55, 90, 65, 80, 50, 85].map((h, i) => (
          <div
            key={i}
            style={{
              width: '8%',
              height: `${h}%`,
              background: '#2563eb',
              borderRadius: '4px 4px 0 0'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChartLoadingState;
