/**
 * Centralized Semantic Visualization Color System
 * 
 * Consistent semantic colors for academic analytics:
 * - High/Excellent -> positive (emerald/teal)
 * - Good/Optimal -> secondary positive (green/blue)
 * - Average -> neutral (slate/blue)
 * - Low/Below Average -> warning (amber/orange)
 * - Critical/Fail/Arrear -> danger (rose/red)
 * 
 * Accessible, high-contrast categorical palette for general entities (Departments, Subjects, etc.)
 */

export const PALETTE = [
  '#2563eb', // Blue 600
  '#0d9488', // Teal 600
  '#7c3aed', // Violet 600
  '#f59e0b', // Amber 500
  '#06b6d4', // Cyan 500
  '#ec4899', // Pink 500
  '#10b981', // Emerald 500
  '#f97316', // Orange 500
  '#6366f1', // Indigo 500
  '#84cc16', // Lime 500
  '#0284c7', // Sky 600
  '#9333ea', // Purple 600
  '#e11d48', // Rose 600
  '#14b8a6', // Teal 500
  '#475569'  // Slate 600
];

export const SEMANTIC_PALETTE = {
  // Pass / Fail status
  PASS: '#10b981',
  PASSED: '#10b981',
  PASS_COUNT: '#10b981',
  PASS_PERCENTAGE: '#10b981',
  PASS_RATE: '#10b981',
  FAIL: '#ef4444',
  FAILED: '#ef4444',
  FAIL_COUNT: '#ef4444',
  FAIL_PERCENTAGE: '#ef4444',
  FAIL_RATE: '#ef4444',
  ARREAR: '#ef4444',
  ARREARS: '#ef4444',

  // Grades
  S: '#059669',
  'A+': '#0d9488',
  A: '#0891b2',
  'B+': '#2563eb',
  B: '#7c3aed',
  C: '#f59e0b',
  U: '#ef4444',
  RA: '#ef4444',

  // Class Divisions
  DISTINCTION: '#059669',
  'FIRST CLASS WITH DISTINCTION': '#059669',
  'FIRST CLASS': '#2563eb',
  FIRST: '#2563eb',
  'SECOND CLASS': '#f59e0b',
  SECOND: '#f59e0b',
  'THIRD CLASS': '#f97316',
  THIRD: '#f97316',

  // Academic Performance Bands
  EXCELLENT: '#059669',
  GOOD: '#10b981',
  AVERAGE: '#3b82f6',
  'BELOW AVERAGE': '#f59e0b',
  POOR: '#ef4444',

  // Attendance
  'HIGH ATTENDANCE': '#10b981',
  'MODERATE ATTENDANCE': '#3b82f6',
  'LOW ATTENDANCE': '#f59e0b',
  'CRITICAL ATTENDANCE': '#ef4444',

  // Risk Levels
  OPTIMAL: '#10b981',
  LOW_RISK: '#10b981',
  WARNING: '#f59e0b',
  MODERATE_RISK: '#f59e0b',
  HIGH_RISK: '#ef4444',
  CRITICAL: '#ef4444',

  // Statuses
  COMPLETED: '#10b981',
  IN_PROGRESS: '#3b82f6',
  PENDING: '#f59e0b',

  // Metrics
  GPA: '#2563eb',
  SGPA: '#2563eb',
  CGPA: '#1d4ed8',
  AVERAGE_GPA: '#2563eb',
  STUDENT_COUNT: '#3b82f6',
  STUDENTS: '#3b82f6'
};

/**
 * Returns a stable, deterministic semantic color for a given key.
 * If the key matches known semantic vocabulary, returns the corresponding semantic color.
 * Otherwise, assigns a distinct harmonious color from PALETTE based on index or hash.
 */
export const getSemanticColor = (key, fallbackIndex = 0) => {
  if (key === null || key === undefined) return PALETTE[fallbackIndex % PALETTE.length];
  
  const str = String(key).trim();
  const normalized = str.toUpperCase().replace(/[\s\-_]+/g, '_');
  
  // Exact match
  if (SEMANTIC_PALETTE[normalized]) {
    return SEMANTIC_PALETTE[normalized];
  }
  
  // Grade check
  if (SEMANTIC_PALETTE[str.toUpperCase()]) {
    return SEMANTIC_PALETTE[str.toUpperCase()];
  }

  // Substring semantic matching
  if (normalized.includes('PASS') && !normalized.includes('FAIL')) return SEMANTIC_PALETTE.PASS;
  if (normalized.includes('FAIL') || normalized.includes('ARREAR')) return SEMANTIC_PALETTE.FAIL;
  if (normalized.includes('CRITICAL') || normalized.includes('HIGH_RISK')) return SEMANTIC_PALETTE.CRITICAL;
  if (normalized.includes('WARN') || normalized.includes('MODERATE')) return SEMANTIC_PALETTE.WARNING;
  if (normalized.includes('EXCELLENT') || normalized.includes('DISTINCTION')) return SEMANTIC_PALETTE.DISTINCTION;
  if (normalized.includes('FIRST')) return SEMANTIC_PALETTE['FIRST CLASS'];
  if (normalized.includes('SECOND')) return SEMANTIC_PALETTE['SECOND CLASS'];

  // Categorical fallback: consistent indexing
  return PALETTE[fallbackIndex % PALETTE.length];
};

/**
 * Returns an array of colors corresponding to a dataset.
 */
export const getDatasetColors = (data = [], categoryField = 'name') => {
  return data.map((item, idx) => {
    const key = item[categoryField] ?? item.category ?? item.grade ?? item.department ?? idx;
    return getSemanticColor(key, idx);
  });
};

export default {
  PALETTE,
  SEMANTIC_PALETTE,
  getSemanticColor,
  getDatasetColors
};
