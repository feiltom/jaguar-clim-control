export const colors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  border: '#3A3A3A',
  chrome: '#C0C0C0',
  chromeLight: '#E8E8E8',
  chromeDark: '#808080',

  tempHot: '#E53935',
  tempCold: '#1E88E5',
  tempNeutral: '#FFFFFF',

  fanActive: '#4FC3F7',
  fanInactive: '#3A3A3A',

  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textDim: '#666666',

  statusConnected: '#4CAF50',
  statusDisconnected: '#F44336',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  tempDisplay: { fontSize: 32, fontWeight: '700' as const, letterSpacing: 2 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5 },
  source: { fontSize: 14, fontWeight: '400' as const },
  track: { fontSize: 12, fontWeight: '400' as const },
} as const;
