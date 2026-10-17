import React from 'react';
import { getSemanticColor } from './colorSystem';

/**
 * Universal External Responsive Legend
 * Prevents legend collisions by rendering cleanly beneath or alongside the chart surface.
 */
export const ChartLegend = ({
  items = [],
  data = [],
  categoryKey = 'name',
  valueKey = 'value',
  showValues = false,
  total = null,
  alignment = 'center',
  maxItems = 12
}) => {
  // If items array provided directly [{ label, color, value }]
  let legendItems = [];

  if (items && items.length > 0) {
    legendItems = items;
  } else if (data && data.length > 0) {
    legendItems = data.slice(0, maxItems).map((entry, idx) => {
      const label = entry[categoryKey] ?? entry.name ?? entry.label ?? `Item ${idx + 1}`;
      const color = entry.color || entry.fill || getSemanticColor(label, idx);
      const val = entry[valueKey] ?? entry.value ?? null;
      return { label: String(label), color, value: val };
    });
  }

  if (legendItems.length === 0) return null;

  const overflowCount = data.length > maxItems ? data.length - maxItems : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center'),
        gap: '0.5rem 1rem',
        marginTop: '0.85rem',
        padding: '0.5rem 0.25rem'
      }}
    >
      {legendItems.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: '#334155',
            fontWeight: 500
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0
            }}
          />
          <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
          {showValues && item.value !== null && item.value !== undefined && (
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              ({item.value})
            </span>
          )}
        </div>
      ))}

      {overflowCount > 0 && (
        <span style={{ fontSize: '0.725rem', color: '#64748b', fontStyle: 'italic' }}>
          +{overflowCount} more
        </span>
      )}
    </div>
  );
};

export default ChartLegend;
