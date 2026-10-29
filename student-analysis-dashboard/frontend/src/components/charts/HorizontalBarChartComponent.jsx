import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { getSemanticColor } from './colorSystem';
import { formatAxisTick } from './chartFormatters';

/**
 * High-Readability Horizontal Bar Chart
 * Best for: Rankings, Top-N lists, many categories, long labels, and pie-chart fallbacks.
 */
export const HorizontalBarChartComponent = ({
  data = [],
  xField = 'name',
  yField = 'value',
  height = 360,
  showGrid = true,
  showLegend = false,
  barRadius = [0, 6, 6, 0],
  domain = ['auto', 'auto'],
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  // Dynamically calculate height if there are many categories to avoid squishing
  const dynamicHeight = Math.max(height, Math.min(data.length * 34 + 60, 650));

  // Compute total for tooltip percentage share
  const total = data.reduce((acc, d) => acc + (parseFloat(d[yField]) || 0), 0);

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 35, left: 20, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border, #292929)" horizontal={false} />}
        
        <XAxis
          type="number"
          stroke="var(--theme-text-secondary, #A3A3A3)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
          tickFormatter={(val) => formatAxisTick(val) + (unit === '%' ? '%' : '')}
          domain={domain}
        />

        <YAxis
          type="category"
          dataKey={xField}
          stroke="var(--theme-text-secondary, #A3A3A3)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--theme-text-primary, #FFFFFF)', fontWeight: 500 }}
          width={95}
          tickFormatter={(val) => {
            const str = String(val ?? '');
            return str.length > 13 ? `${str.substring(0, 11)}...` : str;
          }}
        />

        <Tooltip
          content={
            <ChartTooltip
              valueUnit={unit}
              total={total}
              showPercentage={total > 0}
            />
          }
        />

        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }}
          />
        )}

        <Bar
          dataKey={yField}
          radius={barRadius}
          barSize={data.length > 10 ? 16 : 22}
          animationDuration={600}
        >
          {data.map((entry, idx) => {
            const label = entry[xField];
            const color = entry.color || entry.fill || getSemanticColor(label, idx);
            return <Cell key={`cell-${idx}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChartComponent;
