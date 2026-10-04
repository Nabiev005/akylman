import styled from 'styled-components';

const Wrap = styled.div<{ $light?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  color: ${({ $light, theme }) => ($light ? '#fff' : theme.colors.textMain)};

  span.tld {
    color: ${({ $light }) => ($light ? '#93C5FD' : '#1D4ED8')};
  }
`;

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#1D4ED8" />
      <path d="M24 11 7 19.5l17 8.5 17-8.5L24 11Z" fill="#fff" />
      <path d="M13 23.5v7.2c0 2.6 4.9 5.8 11 5.8s11-3.2 11-5.8v-7.2L24 29l-11-5.5Z" fill="#93C5FD" />
      <path d="M39 20.5v9" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="39" cy="31.5" r="2.2" fill="#FBBF24" />
    </svg>
  );
}

export function Logo({ light, size }: { light?: boolean; size?: number }) {
  return (
    <Wrap $light={light}>
      <LogoMark size={size} />
      <span>
        Akylman<span className="tld">.kg</span>
      </span>
    </Wrap>
  );
}
