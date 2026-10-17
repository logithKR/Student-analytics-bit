import React, { useRef } from 'react';
import ChartHeader from './ChartHeader';
import ChartToolbar from './ChartToolbar';
import ChartLegend from './ChartLegend';
import ChartLoadingState from './ChartLoadingState';
import ChartEmptyState from './ChartEmptyState';
import ChartErrorState from './ChartErrorState';
import { exportChartAsPNG } from './chartExport';

/**
 * Universal Chart Card Container
 * Handles:
 * - Card styling (consistent border, padding, subtle elevation)
 * - Header & subtitle
 * - Toolbar with 1-click PNG image download
 * - Loading, Error, Empty states
 * - Legend rendering & positioning
 */
export const ChartContainer = ({
  title,
  subtitle = null,
  badge = null,
  adaptationNote = null,
  loading = false,
  error = null,
  isEmpty = false,
  emptyTitle = null,
  emptyDescription = null,
  isInitial = false,
  height = 380,
  minHeight = null,
  onRetry = null,
  onExportCSV = null,
  isTableView = false,
  onToggleTableView = null,
  legendData = null,
  legendCategoryKey = 'name',
  legendValueKey = 'value',
  showLegend = false,
  toolbarActions = null,
  style = {},
  className = '',
  children
}) => {
  const containerRef = useRef(null);

  const handleDownloadPNG = async () => {
    if (!containerRef.current) return;
    await exportChartAsPNG(containerRef.current, title || 'academic-chart', subtitle);
  };

  // 1. Loading State
  if (loading) {
    return <ChartLoadingState height={height} message="Retrieving data & rendering visualization..." />;
  }

  // 2. Error State
  if (error) {
    return <ChartErrorState error={error} height={height} onRetry={onRetry} />;
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <ChartEmptyState
        height={height}
        isInitial={isInitial}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const effectiveMinHeight = minHeight || height;

  return (
    <div
      ref={containerRef}
      className={`chart-card-container ${className}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: effectiveMinHeight,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* ── Header + Toolbar Row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem'
        }}
      >
        <div style={{ flex: 1, minWidth: '220px' }}>
          <ChartHeader
            title={title}
            description={subtitle}
            badge={badge}
            adaptationNote={adaptationNote}
          />
        </div>

        <ChartToolbar
          onDownloadPNG={handleDownloadPNG}
          onExportCSV={onExportCSV}
          isTableView={isTableView}
          onToggleTableView={onToggleTableView}
          customActions={toolbarActions}
        />
      </div>

      {/* ── Main Chart Area ── */}
      <div
        style={{
          flex: 1,
          width: '100%',
          minHeight: height - 120,
          position: 'relative'
        }}
      >
        {children}
      </div>

      {/* ── Optional External Legend ── */}
      {showLegend && legendData && (
        <ChartLegend
          data={legendData}
          categoryKey={legendCategoryKey}
          valueKey={legendValueKey}
        />
      )}
    </div>
  );
};

export default ChartContainer;
