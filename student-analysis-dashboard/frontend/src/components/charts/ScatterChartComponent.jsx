import React from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { formatAxisTick } from './chartFormatters';

export const ScatterChartComponent = ({
  data = [],
  xField = 'x',
  yField = 'y',
  height = 340,
  showGrid = true,
  color = '#2563eb'
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 15, right: 25, left: 15, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
          <XAxis
            type="number"
            dataKey={xField}
            name={xField.replace(/_/g, ' ')}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={formatAxisTick}
          />
          <YAxis
            type="number"
            dataKey={yField}
            name={yField.replace(/_/g, ' ')}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={formatAxisTick}
          />
          <Tooltip content={<ChartTooltip xField={xField} yField={yField} />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name={`${xField.replace(/_/g, ' ')} vs ${yField.replace(/_/g, ' ')}`}
            data={data}
            fill={color}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;
