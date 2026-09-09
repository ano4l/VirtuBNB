export const colors = {
  background: '#F8F8F6',
  surface: '#FFFFFF',
  surfaceSoft: '#F0F0ED',
  glass: 'rgba(255,255,255,0.88)',
  ink: '#0F0F0E',
  inkMuted: '#666663',
  inkFaint: '#989894',
  line: '#E6E5E1',
  green: '#7B6FD4',
  greenDark: '#5649B6',
  greenSoft: '#EFECFB',
  amber: '#A76312',
  amberSoft: '#FFF0D6',
  red: '#B33B32',
  redSoft: '#FCE8E6',
  neutral: '#68746E',
  neutralSoft: '#E8EDEA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
} as const;

export const radius = { sm: 8, md: 14, lg: 20, xl: 24 } as const;

export const shadow = {
  shadowColor: '#171426',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
};
