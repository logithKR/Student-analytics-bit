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
            background: isTableView ? 'var(--theme-accent, #FFD43B)' : 'var(--theme-surface-elevated, #1C1C1C)',
            border: isTableView ? '1px solid var(--theme-accent, #FFD43B)' : '1px solid var(--theme-border, #292929)',
            borderRadius: '6px',
            color: isTableView ? 'var(--theme-accent-text, #080808)' : 'var(--theme-text-primary, #ffffff)',
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
            background: 'var(--theme-surface-elevated, #1C1C1C)',
            border: '1px solid var(--theme-border, #292929)',
            borderRadius: '6px',
            color: 'var(--theme-text-primary, #ffffff)',
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
            background: downloadSuccess ? 'var(--status-success-bg, rgba(16,185,129,0.1))' : 'var(--theme-surface-elevated, #1C1C1C)',
            border: downloadSuccess ? '1px solid var(--status-success, #10b981)' : '1px solid var(--theme-border, #292929)',
            borderRadius: '6px',
            color: downloadSuccess ? 'var(--status-success, #10b981)' : 'var(--theme-text-primary, #ffffff)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: downloading || disableExport ? 'not-allowed' : 'pointer',
            opacity: disableExport ? 0.6 : 1,
            transition: 'all 0.15s ease',
            boxShadow: 'var(--theme-shadow-sm)'
          }}
        >
          {downloading ? (
            <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : downloadSuccess ? (
            <Check size={13} color="var(--status-success, #10b981)" />
          ) : (
            <Download size={13} color="var(--theme-accent, #FFD43B)" />
          )}
          <span>{downloading ? 'Exporting...' : downloadSuccess ? 'Downloaded!' : 'PNG'}</span>
        </button>
      )}
    </div>
  );
};

export default ChartToolbar;
