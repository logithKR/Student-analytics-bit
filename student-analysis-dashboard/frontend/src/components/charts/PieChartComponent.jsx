import React, { useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import ChartLegend from './ChartLegend';
import HorizontalBarChartComponent from './HorizontalBarChartComponent';
import { getSemanticColor } from './colorSystem';
import { formatMetricValue } from './chartFormatters';

/**
 * Intelligent & Resilient Pie / Doughnut Chart Component
 * 
 * Fixes all pie chart issues:
 * 1. Resilient field resolution (resolves string numbers, missing keys, custom schemas).
 * 2. Explicit pixel heights on ResponsiveContainer (prevents 0px collapse in flex containers).
 * 3. Never renders overlapping text on slices: uses external ChartLegend and styled ChartTooltip.
 * 4. High-contrast semantic colors (Pass -> green, Fail -> red, Grades -> standard palette).
 * 5. Doughnut center total counter when isDoughnut is true.
 * 6. Intelligent adaptation: If categories > 8, auto-switches to Horizontal Bar for readability,
 *    but allows 1-click override to view as Pie anyway.
 */
export const PieChartComponent = ({
  data = [],
  xField = 'name',
  yField = 'value',
  height = 360,
  isDoughnut = false,
  centerLabel = 'Total',
  unit = '',
  maxPieCategories = 8,
  onAdaptationNotice = null
}) => {
  const [forcePieView, setForcePieView] = useState(false);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        No data available for visualization
      </div>
    );
  }

  // 1. Resilient field detection
  const firstRow = data[0] || {};
  const resolvedX = (xField in firstRow)
    ? xField
    : (firstRow.name !== undefined ? 'name' : (firstRow.label !== undefined ? 'label' : (firstRow.department !== undefined ? 'department' : (firstRow.grade !== undefined ? 'grade' : (firstRow.code !== undefined ? 'code' : (firstRow.category !== undefined ? 'category' : Object.keys(firstRow)[0]))))));

  const resolvedY = (yField in firstRow && !isNaN(parseFloat(firstRow[yField])))
    ? yField
    : (firstRow.value !== undefined ? 'value' : (firstRow.percentage !== undefined ? 'percentage' : (firstRow.count !== undefined ? 'count' : (firstRow.student_count !== undefined ? 'student_count' : (firstRow.total !== undefined ? 'total' : (firstRow.total_students !== undefined ? 'total_students' : Object.keys(firstRow).find(k => k !== resolvedX && !isNaN(parseFloat(firstRow[k]))) || 'value'))))));

  // 2. Normalize and sanitize data points
  const normalizedData = data.map((d, idx) => {
    const rawVal = d[resolvedY];
    const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
    const safeVal = isNaN(numVal) || numVal < 0 ? 0 : numVal;
    const rawLabel = d[resolvedX];
    const safeLabel = rawLabel !== null && rawLabel !== undefined && String(rawLabel).trim() !== '' ? String(rawLabel) : `Category ${idx + 1}`;

    return {
      ...d,
      [resolvedX]: safeLabel,
      [resolvedY]: safeVal,
      _displayLabel: safeLabel,
      _displayValue: safeVal
    };
  }).filter(d => d[resolvedY] > 0); // Slices must be positive

  // Sort slices descending for clean presentation
  const validData = normalizedData.sort((a, b) => b[resolvedY] - a[resolvedY]);
  const total = validData.reduce((acc, d) => acc + d[resolvedY], 0);

  // If all values are 0
  if (validData.length === 0 || total === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
        No positive metric values to display in pie chart
      </div>
    );
  }

  // 3. Intelligent threshold check: > 8 categories -> suggest Horizontal Bar
  if (validData.length > maxPieCategories && !forcePieView) {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          marginBottom: '0.75rem',
          fontSize: '0.78rem',
          color: '#1e40af'
        }}>
          <span>
            Displaying as <strong>Horizontal Bar</strong> ({validData.length} categories exceeds pie readability threshold of {maxPieCategories}).
          </span>
          <button
            type="button"
            onClick={() => setForcePieView(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #93c5fd',
              color: '#2563eb',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.72rem'
            }}
          >
            Show as Pie anyway
          </button>
        </div>
        <HorizontalBarChartComponent
          data={validData}
          xField={resolvedX}
          yField={resolvedY}
          height={height - 40}
          unit={unit}
        />
      </div>
    );
  }

  // 4. Calculate dimensions ensuring ResponsiveContainer never collapses
  const chartHeight = Math.max(160, height - 40);
  const outerRadius = Math.min(chartHeight * 0.40, 95);
  const innerRadius = isDoughnut ? Math.max(30, outerRadius * 0.58) : 0;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: chartHeight, minHeight: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={validData}
              dataKey={resolvedY}
              nameKey={resolvedX}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={validData.length > 1 ? 2.5 : 0}
              stroke="var(--theme-card-bg, #141414)"
              strokeWidth={2}
              animationDuration={500}
              isAnimationActive={true}
            >
              {validData.map((entry, idx) => {
                const label = entry[resolvedX];
                const color = entry.color || entry.fill || getSemanticColor(label, idx);
                return <Cell key={`cell-${idx}`} fill={color} />;
              })}
            </Pie>

            <Tooltip
              content={
                <ChartTooltip
                  xField={resolvedX}
                  yField={resolvedY}
                  valueUnit={unit}
                  total={total}
                  showPercentage={true}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Counter for Doughnut */}
        {isDoughnut && total > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--theme-text-primary, #FFFFFF)', lineHeight: 1.1 }}>
              {formatMetricValue(total)}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--theme-text-secondary, #A3A3A3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '2px' }}>
              {centerLabel}
            </div>
          </div>
        )}
      </div>

      {/* External Legend - Prevents any overlapping text on pie slices */}
      <div style={{ marginTop: '0.5rem', width: '100%' }}>
        <ChartLegend
          data={validData}
          categoryKey={resolvedX}
          valueKey={resolvedY}
          showValues={true}
          total={total}
        />
      </div>
    </div>
  );
};

export default PieChartComponent;
