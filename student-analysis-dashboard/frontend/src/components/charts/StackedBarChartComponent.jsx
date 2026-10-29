import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { getSemanticColor } from './colorSystem';
import { formatAxisTick, truncateLabel } from './chartFormatters';

export const StackedBarChartComponent = ({
  data = [],
  xField = 'x',
  series = [],
  layout = 'vertical', // 'vertical' (horizontal bars) or 'horizontal' (vertical bars)
  height = 340,
  showGrid = true,
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  const isVerticalLayout = layout === 'vertical'; // Recharts 'vertical' means horizontal bars

  return (
    <div style={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {isVerticalLayout ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 35, bottom: 10 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border, #292929)" horizontal={false} />}
            <XAxis
              type="number"
              stroke="var(--theme-text-secondary, #A3A3A3)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
              tickFormatter={(v) => formatAxisTick(v) + (unit === '%' ? '%' : '')}
            />
            <YAxis
              type="category"
              dataKey={xField}
              stroke="var(--theme-text-secondary, #A3A3A3)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
              width={75}
              tickFormatter={(val) => truncateLabel(val, 12)}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            {series.map((s, idx) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="stack"
                fill={getSemanticColor(s, idx)}
                name={s.replace(/_/g, ' ')}
                radius={idx === series.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: data.length > 5 ? 40 : 15 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border, #292929)" vertical={false} />}
            <XAxis
              dataKey={xField}
              stroke="var(--theme-text-secondary, #A3A3A3)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: data.length > 8 ? 9 : 11 }}
              interval={data.length > 8 ? 'preserveStartEnd' : 0}
              angle={data.length > 5 ? -35 : 0}
              textAnchor={data.length > 5 ? 'end' : 'middle'}
              tickFormatter={(val) => truncateLabel(val, 12)}
            />
            <YAxis
              stroke="var(--theme-text-secondary, #A3A3A3)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
              width={45}
              tickFormatter={(v) => formatAxisTick(v) + (unit === '%' ? '%' : '')}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            {series.map((s, idx) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="stack"
                fill={getSemanticColor(s, idx)}
                name={s.replace(/_/g, ' ')}
                radius={idx === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default StackedBarChartComponent;
