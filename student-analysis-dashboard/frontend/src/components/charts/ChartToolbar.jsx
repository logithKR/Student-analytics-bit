import React, { useState } from 'react';
import { Download, FileSpreadsheet, RefreshCw, Check, Table2, BarChart2 } from 'lucide-react';

/**
 * Universal Chart Toolbar
 * Houses PNG Download action, CSV export, and view mode toggle.
 */
export const ChartToolbar = ({
  onDownloadPNG,
  onExportCSV = null,
  isTableView = false,
  onToggleTableView = null,
  disableExport = false,
  customActions = null
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadClick = async () => {
    if (!onDownloadPNG || downloading || disableExport) return;
    try {
      setDownloading(true);
      await onDownloadPNG();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('[ChartToolbar] PNG export failed:', err);
      alert('Failed to download chart image: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      flexWrap: 'wrap'
    }}>
      {customActions}

      {/* Toggle View (Chart vs Table) */}
      {onToggleTableView && (
        <button
          type="button"
          onClick={onToggleTableView}
          title={isTableView ? 'Switch to graphical chart' : 'Switch to tabular data'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.65rem',
            background: isTableView ? '#eff6ff' : '#ffffff',
            border: isTableView ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
            borderRadius: '6px',
            color: isTableView ? '#2563eb' : '#475569',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isTableView ? <BarChart2 size={13} /> : <Table2 size={13} />}
          <span>{isTableView ? 'Chart' : 'Table'}</span>
        </button>
      )}

      {/* CSV Export Button (if handler provided) */}
      {onExportCSV && (
        <button
          type="button"
          onClick={onExportCSV}
          disabled={disableExport}
          title="Export underlying dataset to CSV"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.65rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: disableExport ? 'not-allowed' : 'pointer',
            opacity: disableExport ? 0.6 : 1,
            transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={13} />
          <span>CSV</span>
        </button>
      )}

      {/* PNG Download Button */}
      {onDownloadPNG && (
        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={downloading || disableExport}
          title="Download chart as high-resolution PNG image"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            background: downloadSuccess ? '#ecfdf5' : '#ffffff',
            border: downloadSuccess ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
            borderRadius: '6px',
            color: downloadSuccess ? '#059669' : '#0f172a',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: downloading || disableExport ? 'not-allowed' : 'pointer',
            opacity: disableExport ? 0.6 : 1,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          {downloading ? (
            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : downloadSuccess ? (
            <Check size={13} color="#059669" />
          ) : (
            <Download size={13} color="#2563eb" />
          )}
          <span>{downloading ? 'Exporting...' : downloadSuccess ? 'Downloaded!' : 'PNG'}</span>
        </button>
      )}
    </div>
  );
};

export default ChartToolbar;
