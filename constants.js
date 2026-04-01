// VeriCheck Constants

export const VERDICTS = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  MISLEADING: 'MISLEADING',
  UNVERIFIABLE: 'UNVERIFIABLE',
};

export const VERDICT_CONFIG = {
  TRUE: {
    label: 'TRUE',
    color: 'emerald',
    icon: '✓',
    bgClass: 'from-emerald-500 to-emerald-600',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    glowClass: 'shadow-emerald-500/20',
  },
  FALSE: {
    label: 'WRONG',
    color: 'red',
    icon: '✗',
    bgClass: 'from-red-500 to-red-600',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    glowClass: 'shadow-red-500/20',
  },
  MISLEADING: {
    label: 'Misleading',
    color: 'amber',
    icon: '⚠',
    bgClass: 'from-amber-500 to-amber-600',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-amber-500/20',
  },
  UNVERIFIABLE: {
    label: 'Unverifiable',
    color: 'slate',
    icon: '?',
    bgClass: 'from-slate-500 to-slate-600',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/30',
    glowClass: 'shadow-slate-500/20',
  },
};

export const CREDIBILITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const CATEGORIES = [
  'Politics',
  'Science',
  'Health',
  'Technology',
  'Business',
  'Environment',
  'Society',
  'Other',
];

// Cache TTL: 48 hours in milliseconds
export const CACHE_TTL = 48 * 60 * 60 * 1000;

// Rate limit: 10 requests per hour
export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
