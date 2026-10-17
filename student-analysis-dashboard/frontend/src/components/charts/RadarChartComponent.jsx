import React from 'react';
import {
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { truncateLabel } from './chartFormatters';

export const RadarChartComponent = ({
  data = [],
  xField = 'subject',
  yField = 'average',
  height = 340,
  fillColor = '#2563eb',
  maxDomain = 100
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey={xField}
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
            tickFormatter={(val) => truncateLabel(val, 14)}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, maxDomain]}
            stroke="#94a3b8"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip content={<ChartTooltip yField={yField} />} />
          <Radar
            name={yField.replace(/_/g, ' ')}
            dataKey={yField}
            stroke={fillColor}
            fill={fillColor}
            fillOpacity={0.35}
            strokeWidth={2.5}
            dot={{ r: 3, fill: fillColor, stroke: '#ffffff', strokeWidth: 1.5 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;
