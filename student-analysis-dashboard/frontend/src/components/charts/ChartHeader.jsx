import React from 'react';

/**
 * Universal Chart Header
 */
export const ChartHeader = ({
  title,
  description = null,
  badge = null,
  adaptationNote = null
}) => {
  if (!title && !description) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--theme-text-primary, #ffffff)',
          margin: 0,
          lineHeight: 1.3
        }}>
          {title}
        </h4>

        {badge && (
          <span style={{
            background: 'var(--theme-surface-elevated, #1C1C1C)',
            color: 'var(--theme-accent, #FFD43B)',
            fontSize: '0.725rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--theme-border, #292929)'
          }}>
            {badge}
          </span>
        )}
      </div>

      {description && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--theme-text-secondary, #A3A3A3)',
          margin: '0.25rem 0 0',
          lineHeight: 1.45
        }}>
          {description}
        </p>
      )}

      {adaptationNote && (
        <div style={{
          marginTop: '0.45rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '0.35rem 0.65rem',
          fontSize: '0.75rem',
          color: '#1d4ed8',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span>💡</span>
          <span>{adaptationNote}</span>
        </div>
      )}
    </div>
  );
};

export default ChartHeader;
