import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatAxisTick } from './chartFormatters';

/**
 * Premium Gradient Area Chart Component
 * Best for: SGPA progression, cumulative progress, volume over time.
 */
export const AreaChartComponent = ({
  data = [],
  xField = 'name',
  yField = 'value',
  height = 360,
  showGrid = true,
  domain = ['auto', 'auto'],
  color = '#2563eb',
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  const gradientId = `areaGrad_${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div style={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
        data={data}
        margin={{ top: 15, right: 25, left: 10, bottom: 15 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}

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
          width={40}
          tickFormatter={(val) => formatAxisTick(val) + (unit === '%' ? '%' : '')}
        />

        <Tooltip content={<ChartTooltip valueUnit={unit} />} />

        <Area
          type="monotone"
          dataKey={yField}
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
          activeDot={{ r: 7, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
          name={yField.replace(/_/g, ' ')}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
