import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, PieChart as PieIcon, Activity,
  Table as TableIcon, Award, AlertCircle, HelpCircle, Database
} from 'lucide-react';

const PALETTE = [
  '#2563eb', '#10b981', '#f59e0b', '#7c3aed',
  '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#84cc16'
];

const SPECIAL_COLORS = {
  'PASS': '#10b981',
  'FAIL': '#ef4444',
  'S': '#059669',
  'A+': '#0d9488',
  'A': '#0891b2',
  'B+': '#2563eb',
  'B': '#7c3aed',
  'C': '#f59e0b',
  'U': '#ef4444'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontSize: '0.85rem'
    }}>
      {label && <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>{String(label)}</div>}
      {payload.map((item, idx) => {
        const val = typeof item.value === 'number'
          ? (Number.isInteger(item.value) ? item.value : item.value.toFixed(2))
          : item.value;
        const color = item.color || item.payload?.fill || '#2563eb';
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color: '#64748b' }}>{item.name || item.dataKey}:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
};

export const DynamicChartRenderer = ({
  data = [],
  config = {},
  columns = [],
  loading = false,
  error = null,
  height = 360
}) => {
  const safeConfig = config || {};
  const chartType = (safeConfig.type || 'bar').toLowerCase();
  const xField = safeConfig.xField || (columns[0]?.name) || 'x';
  const yField = safeConfig.yField || (columns.find(c => c.type === 'number')?.name) || columns[1]?.name || 'y';
  const series = Array.isArray(safeConfig.series) && safeConfig.series.length > 0 ? safeConfig.series : [yField];
  const showGrid = safeConfig.showGrid !== false;
  const showLegend = safeConfig.legend !== false;

  // Compute summary stats for KPI or callout
  const summaryStat = useMemo(() => {
    if (!data || data.length === 0) return { total: 0, avg: 0, max: 0 };
    const numericVals = data
      .map(d => parseFloat(d[yField]))
      .filter(v => !isNaN(v));
    if (numericVals.length === 0) return { total: 0, avg: 0, max: 0 };
    const total = numericVals.reduce((acc, v) => acc + v, 0);
    const avg = total / numericVals.length;
    const max = Math.max(...numericVals);
    return {
      total: Number.isInteger(total) ? total : total.toFixed(2),
      avg: avg.toFixed(2),
      max: Number.isInteger(max) ? max : max.toFixed(2)
    };
  }, [data, yField]);

  if (loading) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem'
      }}>
        <div style={{
          width: 42,
          height: 42,
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
          Querying database & generating visualization...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff1f2',
        borderRadius: '12px',
        border: '1px solid #fecdd3',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
        <h4 style={{ color: '#9f1239', fontWeight: 600, marginBottom: '0.25rem' }}>Visualization Error</h4>
        <p style={{ color: '#be123c', fontSize: '0.85rem', maxWidth: 450 }}>{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Database size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
        <h4 style={{ color: '#475569', fontWeight: 600, marginBottom: '0.25rem' }}>No Result Records</h4>
        <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 420 }}>
          No records in the database match this criteria. Try refining your filters or query parameters.
        </p>
      </div>
    );
  }

  // ── Render Chart by Type ──

  const renderContent = () => {
    switch (chartType) {
      // 1. Bar Chart
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
              <XAxis
                dataKey={xField}
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                interval={0}
                angle={data.length > 6 ? -25 : 0}
                textAnchor={data.length > 6 ? 'end' : 'middle'}
              />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              <Bar dataKey={yField} fill="#2563eb" radius={[6, 6, 0, 0]}>
                {data.map((entry, idx) => {
                  const val = String(entry[xField] || '').toUpperCase();
                  const color = SPECIAL_COLORS[val] || PALETTE[idx % PALETTE.length];
                  return <Cell key={`cell-${idx}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      // 2. Grouped Bar Chart
      case 'grouped_bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
              <XAxis
                dataKey={xField}
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              {series.map((s, idx) => (
                <Bar
                  key={s}
                  dataKey={s}
                  fill={PALETTE[idx % PALETTE.length]}
                  radius={[4, 4, 0, 0]}
                  name={s.replace(/_/g, ' ')}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      // 3. Stacked Bar Chart
      case 'stacked_bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
              <XAxis dataKey={xField} stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              {series.map((s, idx) => (
                <Bar
                  key={s}
                  dataKey={s}
                  stackId="stack"
                  fill={PALETTE[idx % PALETTE.length]}
                  name={s.replace(/_/g, ' ')}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      // 4. Line Chart
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
              <XAxis dataKey={xField} stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              {series.map((s, idx) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={PALETTE[idx % PALETTE.length]}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                  name={s.replace(/_/g, ' ')}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      // 5. Area Chart
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
              <XAxis dataKey={xField} stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              <Area
                type="monotone"
                dataKey={yField}
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#areaGradient)"
                name={yField.replace(/_/g, ' ')}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      // 6. Pie Chart
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yField}
                nameKey={xField}
                cx="50%"
                cy="50%"
                outerRadius={height * 0.35}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, idx) => {
                  const val = String(entry[xField] || '').toUpperCase();
                  const color = SPECIAL_COLORS[val] || PALETTE[idx % PALETTE.length];
                  return <Cell key={`cell-${idx}`} fill={color} />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem' }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      // 7. Donut Chart
      case 'donut':
        return (
          <div style={{ position: 'relative', width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey={yField}
                  nameKey={xField}
                  cx="50%"
                  cy="50%"
                  innerRadius={height * 0.22}
                  outerRadius={height * 0.35}
                  paddingAngle={3}
                >
                  {data.map((entry, idx) => {
                    const val = String(entry[xField] || '').toUpperCase();
                    const color = SPECIAL_COLORS[val] || PALETTE[idx % PALETTE.length];
                    return <Cell key={`cell-${idx}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem' }} />}
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute',
              top: '46%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{summaryStat.total}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                Total {yField.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        );

      // 8. Scatter Plot
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
              <XAxis dataKey={xField} stroke="#64748b" tickLine={false} axisLine={false} name={xField} tick={{ fontSize: 12 }} />
              <YAxis dataKey={yField} stroke="#64748b" tickLine={false} axisLine={false} name={yField} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
              <Scatter name={`${xField} vs ${yField}`} data={data} fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      // 9. Radar Chart
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey={xField} tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar
                name={yField.replace(/_/g, ' ')}
                dataKey={yField}
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend wrapperStyle={{ fontSize: '0.8rem' }} />}
            </RadarChart>
          </ResponsiveContainer>
        );

      // 10. KPI Cards
      case 'kpi_card':
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            padding: '1.5rem 0'
          }}>
            <div className="kpi-card">
              <span className="kpi-title">Total Records</span>
              <span className="kpi-value">{data.length}</span>
              <span className="kpi-trend up">Validated rows</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">{yField.replace(/_/g, ' ').toUpperCase()} (AVG)</span>
              <span className="kpi-value green">{summaryStat.avg}</span>
              <span className="kpi-trend up">Cohort Mean</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Peak Value</span>
              <span className="kpi-value">{summaryStat.max}</span>
              <span className="kpi-trend up">Cohort High</span>
            </div>
          </div>
        );

      // 11. Data Table View
      case 'table':
      default:
        const tableColumns = columns.length > 0 ? columns.map(c => c.name) : Object.keys(data[0] || {});
        return (
          <div style={{ maxHeight: height, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                  {tableColumns.map(col => (
                    <th key={col} style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rIdx) => (
                  <tr key={rIdx} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}>
                    {tableColumns.map(col => {
                      const val = row[col];
                      const isStatus = col.toLowerCase() === 'result' || col.toLowerCase() === 'status';
                      return (
                        <td key={col} style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>
                          {isStatus ? (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: val === 'PASS' ? '#dcfce7' : '#fee2e2',
                              color: val === 'PASS' ? '#15803d' : '#b91c1c'
                            }}>
                              {val}
                            </span>
                          ) : (
                            typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : String(val ?? '-')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="chart-card" style={{ height: 'auto', minHeight: height + 60, display: 'flex', flexDirection: 'column' }}>
      <div className="chart-card-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 className="chart-header" style={{ marginBottom: '0.25rem', fontSize: '1.05rem', fontWeight: 600 }}>
            {safeConfig.title || 'Data Visualization'}
          </h3>
          {safeConfig.description && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              {safeConfig.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '3px 8px',
            background: '#eff6ff',
            color: '#2563eb',
            borderRadius: '6px',
            fontWeight: 500,
            textTransform: 'uppercase'
          }}>
            {chartType.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {data.length} records
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: height }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default DynamicChartRenderer;
