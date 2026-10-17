import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { getSemanticColor } from './colorSystem';
import { formatAxisTick } from './chartFormatters';

/**
 * High-Readability Vertical Bar Chart
 * Best for: Category comparisons, semester distributions, subject marks.
 */
export const BarChartComponent = ({
  data = [],
  xField = 'name',
  yField = 'value',
  height = 360,
  showGrid = true,
  showLegend = false,
  barRadius = [6, 6, 0, 0],
  domain = ['auto', 'auto'],
  barColor = null,
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, d) => acc + (parseFloat(d[yField]) || 0), 0);
  const shouldAngleLabels = data.length > 5;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 15, right: 25, left: 10, bottom: shouldAngleLabels ? 35 : 15 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
        
        <XAxis
          dataKey={xField}
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          interval={0}
          angle={shouldAngleLabels ? -25 : 0}
          textAnchor={shouldAngleLabels ? 'end' : 'middle'}
          tickFormatter={(val) => {
            const str = String(val ?? '');
            return str.length > 14 ? `${str.substring(0, 12)}...` : str;
          }}
        />

        <YAxis
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          domain={domain}
          width={45}
          tickFormatter={(val) => formatAxisTick(val) + (unit === '%' ? '%' : '')}
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
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }}
          />
        )}

        <Bar
          dataKey={yField}
          radius={barRadius}
          maxBarSize={48}
          animationDuration={600}
        >
          {data.map((entry, idx) => {
            const label = entry[xField];
            const color = entry.color || entry.fill || (barColor ? barColor : getSemanticColor(label, idx));
            return <Cell key={`cell-${idx}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
