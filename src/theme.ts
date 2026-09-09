export const colors = {
  background: '#F5F6F5',
  surface: '#FFFFFF',
  surfaceSoft: '#ECF2EF',
  ink: '#151A17',
  inkMuted: '#5C6963',
  inkFaint: '#839089',
  line: '#DCE5E0',
  green: '#176B45',
  greenDark: '#105438',
  greenSoft: '#DCEFE5',
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
  shadowColor: '#10281D',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
};
