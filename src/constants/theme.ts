import { Platform } from 'react-native';

// ─── Deep Space Glass Palette ────────────────────────────────────────────────
export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f1f5f9',
    backgroundElement: '#e2e8f0',
    backgroundSelected: '#cbd5e1',
    textSecondary: '#64748b',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    border: 'rgba(15, 23, 42, 0.10)',
    card: 'rgba(255,255,255,0.72)',
    glass: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.85)',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    glowPrimary: 'rgba(99,102,241,0.25)',
    glowSecondary: 'rgba(168,85,247,0.20)',
  },
  dark: {
    text: '#f8fafc',
    background: '#04050c',
    backgroundElement: 'rgba(99,102,241,0.12)',
    backgroundSelected: 'rgba(99,102,241,0.25)',
    textSecondary: 'rgba(248,250,252,0.50)',
    primary: '#818cf8',
    secondary: '#c084fc',
    border: 'rgba(255,255,255,0.09)',
    card: 'rgba(255,255,255,0.05)',
    glass: 'rgba(255,255,255,0.06)',
    glassBorder: 'rgba(255,255,255,0.12)',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    glowPrimary: 'rgba(129,140,248,0.30)',
    glowSecondary: 'rgba(192,132,252,0.25)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;

// ─── Gradient Presets ─────────────────────────────────────────────────────────
export const Gradients = {
  background: ['#04050c', '#0d0f1e', '#11143a'] as const,
  backgroundLight: ['#f1f5f9', '#e8edf8', '#dde4f7'] as const,
  primary: ['#6366f1', '#8b5cf6', '#a855f7'] as const,
  instagram: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'] as const,
  success: ['#059669', '#10b981', '#34d399'] as const,
  danger: ['#dc2626', '#ef4444', '#f87171'] as const,
  card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as const,
  glow: ['rgba(99,102,241,0.0)', 'rgba(99,102,241,0.18)', 'rgba(99,102,241,0.0)'] as const,
  shimmer: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.0)'] as const,
} as const;

// ─── Status Colors ────────────────────────────────────────────────────────────
export const StatusColors: Record<string, { bg: string; text: string; glow: string }> = {
  Todo:        { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', glow: 'rgba(59,130,246,0.35)' },
  'In Progress':{ bg: 'rgba(234,179,8,0.15)',  text: '#facc15', glow: 'rgba(234,179,8,0.35)' },
  Done:        { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', glow: 'rgba(16,185,129,0.35)' },
  Failed:      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', glow: 'rgba(239,68,68,0.35)' },
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
