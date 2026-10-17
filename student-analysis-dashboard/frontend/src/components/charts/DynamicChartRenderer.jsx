import React, { useState, useMemo } from 'react';
import ChartContainer from './ChartContainer';
import BarChartComponent from './BarChartComponent';
import HorizontalBarChartComponent from './HorizontalBarChartComponent';
import PieChartComponent from './PieChartComponent';
import LineChartComponent from './LineChartComponent';
import AreaChartComponent from './AreaChartComponent';
import RadarChartComponent from './RadarChartComponent';
import StackedBarChartComponent from './StackedBarChartComponent';
import ScatterChartComponent from './ScatterChartComponent';
import { formatMetricValue, slugifyTitle } from './chartFormatters';

/**
 * Universal Dynamic Chart Renderer
 * 
 * Bridges AI-generated visualization configurations to the centralized chart system.
 * Handles:
 * - Intelligent type validation & auto-adaptation (e.g. 6+ categories on Pie -> Horizontal Bar)
 * - Safe numeric normalization & missing value handling
 * - View switching (Visual Chart <-> Tabular Data)
 * - 1-Click High-Res PNG & CSV exports via ChartContainer
 * - Real Groq error passthrough (strictly NO mock or fake fallback data)
 */
export const DynamicChartRenderer = ({
  data = [],
  config = {},
  columns = [],
  loading = false,
  error = null,
  height = 400,
  onRetry = null,
  onExportCSV = null
}) => {
  const [isTableView, setIsTableView] = useState(false);
  const [adaptationMessage, setAdaptationMessage] = useState(null);

  const safeConfig = config || {};
  const rawChartType = (safeConfig.visualization || safeConfig.type || 'bar').toLowerCase();

  // Resilient field detection
  const firstRow = (data && data[0]) || {};
  const xField = safeConfig.xAxis?.field || safeConfig.xField || 
    (firstRow.name !== undefined ? 'name' : (firstRow.department !== undefined ? 'department' : (firstRow.grade !== undefined ? 'grade' : (firstRow.code !== undefined ? 'code' : (firstRow.category !== undefined ? 'category' : (columns[0]?.name || Object.keys(firstRow)[0] || 'x'))))));

  const yField = safeConfig.yAxis?.field || safeConfig.yField ||
    (firstRow.value !== undefined ? 'value' : (firstRow.percentage !== undefined ? 'percentage' : (firstRow.count !== undefined ? 'count' : (firstRow.student_count !== undefined ? 'student_count' : (firstRow.total !== undefined ? 'total' : (firstRow.total_students !== undefined ? 'total_students' : (columns.find(c => c.type === 'number')?.name || Object.keys(firstRow).find(k => k !== xField && !isNaN(parseFloat(firstRow[k]))) || 'y')))))));

  const series = Array.isArray(safeConfig.series) && safeConfig.series.length > 0 ? safeConfig.series : [yField];
  const unit = safeConfig.yAxis?.unit || safeConfig.unit || '';
  const showGrid = safeConfig.showGrid !== false;
  const title = safeConfig.title || 'Academic Analytics Chart';
  const subtitle = safeConfig.description || null;

  // Sanitize and format data: parse numeric strings so Recharts can graph them!
  const cleanData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(row => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach(k => {
        const val = cleaned[k];
        if (val === null || val === undefined) {
          cleaned[k] = 0;
        } else if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
          const num = parseFloat(val);
          if (!isNaN(num)) cleaned[k] = num;
        }
      });
      return cleaned;
    });
  }, [data]);

  // Summary statistics for KPI cards / Donut centers
  const summaryStat = useMemo(() => {
    if (!cleanData || cleanData.length === 0) return { total: 0, avg: 0, max: 0, count: 0 };
    const numericVals = cleanData
      .map(d => parseFloat(d[yField]))
      .filter(v => !isNaN(v));
    if (numericVals.length === 0) return { total: cleanData.length, avg: 0, max: 0, count: cleanData.length };
    const total = numericVals.reduce((acc, v) => acc + v, 0);
    const avg = total / numericVals.length;
    const max = Math.max(...numericVals);
    return {
      total: Number.isInteger(total) ? total : total.toFixed(2),
      avg: avg.toFixed(2),
      max: Number.isInteger(max) ? max : max.toFixed(2),
      count: cleanData.length
    };
  }, [cleanData, yField]);

  // Pass raw chart type directly to dedicated components so Pie/Donut can render
  const effectiveChartType = rawChartType;

  // Built-in CSV exporter if none passed in
  const handleCSVExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (!cleanData || cleanData.length === 0) return;
    try {
      const headers = Object.keys(cleanData[0] || {});
      const csvRows = [
        headers.join(','),
        ...cleanData.map(row => headers.map(h => {
          const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${slugifyTitle(title)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[DynamicChartRenderer] CSV export error:', e);
    }
  };

  // Determine if empty
  const isEmpty = !loading && !error && (!cleanData || cleanData.length === 0);
  const isInitialState = isEmpty && (!config || !config.title || config.title === 'Academic Analytics Chart');

  // Render Tabular Data View
  const renderTableView = () => {
    const tableColumns = columns.length > 0 ? columns.map(c => c.name) : Object.keys(cleanData[0] || {});
    return (
      <div style={{ maxHeight: height, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
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
            {cleanData.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                {tableColumns.map(col => (
                  <td key={col} style={{ padding: '0.65rem 1rem', color: '#1e293b' }}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Visual Chart Content
  const renderChartContent = () => {
    if (isTableView) {
      return renderTableView();
    }

    switch (effectiveChartType) {
      // 1. Horizontal Bar Chart (Rankings, Top performers, 6+ category fallbacks)
      case 'horizontal_bar':
        return (
          <HorizontalBarChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 2. Vertical Bar Chart
      case 'bar':
        return (
          <BarChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 3. Grouped Bar Chart
      case 'grouped_bar':
        return (
          <StackedBarChartComponent
            data={cleanData}
            xField={xField}
            series={series}
            layout="horizontal"
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 4. Stacked Bar Chart
      case 'stacked_bar':
        return (
          <StackedBarChartComponent
            data={cleanData}
            xField={xField}
            series={series}
            layout="horizontal"
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 5. Line Chart (Trends, Progression)
      case 'line':
        return (
          <LineChartComponent
            data={cleanData}
            xField={xField}
            series={series}
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 6. Area Chart (Gradients, Cumulative Progression)
      case 'area':
        return (
          <AreaChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            showGrid={showGrid}
            unit={unit}
          />
        );

      // 7. Donut Chart (1–5 categories with center counter)
      case 'donut':
        return (
          <PieChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            isDoughnut={true}
            centerLabel={`Total ${yField.replace(/_/g, ' ')}`}
            unit={unit}
            onAdaptationNotice={setAdaptationMessage}
          />
        );

      // 8. Pie Chart (1–5 categories with external legend)
      case 'pie':
        return (
          <PieChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            isDoughnut={false}
            unit={unit}
            onAdaptationNotice={setAdaptationMessage}
          />
        );

      // 9. Radar Chart (Subject difficulty, multi-attribute profiles)
      case 'radar':
        return (
          <RadarChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
          />
        );

      // 10. Scatter Plot (Two-variable correlations, e.g. Attendance vs Marks)
      case 'scatter':
        return (
          <ScatterChartComponent
            data={cleanData}
            xField={xField}
            yField={yField}
            height={height}
            showGrid={showGrid}
          />
        );

      // 11. KPI Cards View
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
              <span className="kpi-value">{cleanData.length}</span>
              <span className="kpi-trend up">Verified Entries</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">{yField.replace(/_/g, ' ').toUpperCase()} (AVG)</span>
              <span className="kpi-value green">{summaryStat.avg}</span>
              <span className="kpi-trend up">Cohort Mean</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title">Peak Value</span>
              <span className="kpi-value">{summaryStat.max}</span>
              <span className="kpi-trend up">Highest Metric</span>
            </div>
          </div>
        );

      // 12. Tabular Fallback
      case 'table':
      default:
        return renderTableView();
    }
  };

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      badge={safeConfig.yAxis?.unit ? safeConfig.yAxis.unit : null}
      adaptationNote={adaptationMessage}
      loading={loading}
      error={error}
      isEmpty={isEmpty}
      isInitial={isInitialState}
      height={height}
      onRetry={onRetry}
      onExportCSV={handleCSVExport}
      isTableView={isTableView}
      onToggleTableView={() => setIsTableView(prev => !prev)}
    >
      {renderChartContent()}
    </ChartContainer>
  );
};

export default DynamicChartRenderer;
