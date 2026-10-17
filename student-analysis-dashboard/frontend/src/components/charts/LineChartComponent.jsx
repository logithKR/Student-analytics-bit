import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { PALETTE, getSemanticColor } from './colorSystem';
import { formatAxisTick } from './chartFormatters';

/**
 * High-Readability Line Chart Component
 * Best for: Progression, trends, semester tracking, historical changes.
 */
export const LineChartComponent = ({
  data = [],
  xField = 'name',
  series = [],
  height = 360,
  showGrid = true,
  showLegend = true,
  domain = ['auto', 'auto'],
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  const activeSeries = Array.isArray(series) && series.length > 0 ? series : ['value'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 15, right: 25, left: 10, bottom: 15 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
        
        <XAxis
          dataKey={xField}
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
        />

        <YAxis
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          domain={domain}
          tickFormatter={(val) => formatAxisTick(val) + (unit ? ` ${unit}` : '')}
        />

        <Tooltip content={<ChartTooltip valueUnit={unit} />} />

        {showLegend && activeSeries.length > 1 && (
          <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
        )}

        {activeSeries.map((s, idx) => {
          const color = getSemanticColor(s, idx);
          return (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: color }}
              activeDot={{ r: 7, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
              name={s.replace(/_/g, ' ')}
              animationDuration={600}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
