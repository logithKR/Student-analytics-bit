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
  const count = data.length;
  const isCramped = count > 6;
  const isExtreme = count > 10;

  // Collision-free responsive typography & layout
  const tickFontSize = isExtreme ? 9 : (isCramped ? 10 : 11);
  const angle = isCramped ? -45 : (count > 4 ? -25 : 0);
  const bottomMargin = isCramped ? 46 : (count > 4 ? 30 : 15);
  // Recharts 'preserveStartEnd' algorithm mathematically drops collisions when count > 10
  const interval = isExtreme ? 'preserveStartEnd' : 0;
  const maxBarSize = isExtreme ? 18 : (isCramped ? 24 : 38);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 15, left: -10, bottom: bottomMargin }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border, #292929)" vertical={false} />}
        
        <XAxis
          dataKey={xField}
          stroke="var(--theme-border, #292929)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: tickFontSize, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
          interval={interval}
          angle={angle}
          textAnchor={isCramped || count > 4 ? 'end' : 'middle'}
          tickFormatter={(val) => {
            const str = String(val ?? '');
            return str.length > 9 ? `${str.substring(0, 8)}.` : str;
          }}
        />

        <YAxis
          stroke="var(--theme-border, #292929)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: 'var(--theme-text-secondary, #A3A3A3)' }}
          domain={domain}
          width={38}
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
            wrapperStyle={{ fontSize: '0.72rem', paddingTop: '6px' }}
          />
        )}

        <Bar
          dataKey={yField}
          radius={barRadius}
          maxBarSize={maxBarSize}
          animationDuration={500}
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
