export const theme = {
  colors: {
    primary: '#1D4ED8',
    primaryHover: '#1E40AF',
    primarySoft: '#DBEAFE',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    textMain: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    success: '#059669',
    successSoft: '#D1FAE5',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    info: '#0284C7',
    infoSoft: '#E0F2FE',
    violet: '#7C3AED',
    violetSoft: '#EDE9FE',
    sidebar: '#0F172A',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
    md: '0 4px 12px -2px rgba(15, 23, 42, 0.08)',
    lg: '0 20px 40px -12px rgba(15, 23, 42, 0.18)',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '960px',
  },
};

// TypeScript Styled Components үчүн тема тибин автоматтык түрдө таануусу үчүн:
export type ThemeType = typeof theme;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}
