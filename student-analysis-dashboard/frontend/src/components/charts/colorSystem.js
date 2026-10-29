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
  '#FFD43B', // Golden Yellow (Primary Accent)
  '#F0C419', // Amber Gold
  '#A3A3A3', // Soft Neutral Gray
  '#10B981', // Emerald Pass/Success
  '#EF4444', // Red Danger/Critical
  '#F59E0B', // Warning Amber
  '#525252', // Deep Slate Gray
  '#0D9488', // Teal Accent
  '#EAB308', // Warm Yellow
  '#737373', // Muted Gray
  '#14B8A6', // Secondary Teal
  '#D97706'  // Deep Amber
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
  GPA: '#FFD43B',
  SGPA: '#FFD43B',
  CGPA: '#F0C419',
  AVERAGE_GPA: '#FFD43B',
  STUDENT_COUNT: '#FFD43B',
  STUDENTS: '#FFD43B'
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
