/**
 * Chart Axis, Tooltip & Data Value Formatting Utilities
 */

/**
 * Formats a metric value cleanly for tooltips and cards.
 * E.g. 1500000 -> "1.5M", 12500 -> "12.5K", 8.214 -> "8.21", 42 -> "42"
 */
export const formatMetricValue = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return String(val);

  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (Math.abs(num) >= 10_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }
  return num.toFixed(2);
};

/**
 * Compact formatter specifically for chart axis ticks.
 */
export const formatAxisTick = (val) => {
  if (val === null || val === undefined) return '';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!isNaN(num)) {
    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(1);
  }

  const str = String(val);
  return str.length > 15 ? `${str.substring(0, 13)}...` : str;
};

/**
 * Formats a percentage value.
 * Handles both 0-1 range (0.85 -> "85.0%") and 0-100 range (85.4 -> "85.4%").
 */
export const formatPercentage = (val) => {
  if (val === null || val === undefined) return '0%';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0%';

  // If between 0 and 1 (exclusive of 0 and 1 edge case, unless explicitly a fraction)
  const pct = (num > 0 && num <= 1) ? num * 100 : num;
  return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
};

/**
 * Truncates long category names safely.
 */
export const truncateLabel = (label, maxLength = 16) => {
  if (!label) return '';
  const str = String(label);
  return str.length > maxLength ? `${str.substring(0, maxLength - 2)}...` : str;
};

/**
 * Converts a chart title into a clean filename for image downloads.
 */
export const slugifyTitle = (title, defaultName = 'academic-chart') => {
  if (!title || typeof title !== 'string') return defaultName;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return slug || defaultName;
};

export default {
  formatMetricValue,
  formatAxisTick,
  formatPercentage,
  truncateLabel,
  slugifyTitle
};
