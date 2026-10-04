/* eslint-disable react-refresh/only-export-components -- жалпы UI-кит: styled-компоненттер жана жардамчылар */
import type { ReactNode } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { AnimatedNumber } from './AnimatedNumber';
import { fadeUp, growX, popIn, slideDown, stagger } from '../styles/animations';

export type Tone = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'violet' | 'neutral';

export function toneColors(theme: DefaultTheme, tone: Tone): { fg: string; bg: string } {
  const c = theme.colors;
  switch (tone) {
    case 'primary': return { fg: c.primary, bg: c.primarySoft };
    case 'success': return { fg: c.success, bg: c.successSoft };
    case 'info': return { fg: c.info, bg: c.infoSoft };
    case 'warning': return { fg: c.warning, bg: c.warningSoft };
    case 'danger': return { fg: c.danger, bg: c.dangerSoft };
    case 'violet': return { fg: c.violet, bg: c.violetSoft };
    default: return { fg: c.textMuted, bg: c.background };
  }
}

/* ---------------- Макет ---------------- */

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  animation: ${slideDown} 0.4s ease both;

  h1 {
    font-size: 1.6rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  p {
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: 0.25rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    h1 { font-size: 1.3rem; }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <HeaderRow>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <Actions>{actions}</Actions>}
    </HeaderRow>
  );
}

export const Card = styled.section<{ $pad?: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ $pad }) => $pad ?? '1.25rem'};
  min-width: 0;
  animation: ${fadeUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
`;

export const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  h3 {
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  span.muted {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Grid = styled.div<{ $min?: string; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${({ $min }) => $min ?? '240px'}), 1fr));
  gap: ${({ $gap }) => $gap ?? '1rem'};
  margin-bottom: 1rem;

  > * {
    ${stagger(70, 12)}
  }
`;

export const Split = styled.div<{ $ratio?: string }>`
  display: grid;
  grid-template-columns: ${({ $ratio }) => $ratio ?? '2fr 1fr'};
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;

  > * {
    ${stagger(110, 4)}
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const Stack = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? '1rem'};
`;

export const Row = styled.div<{ $gap?: string; $wrap?: boolean; $justify?: string }>`
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap ?? '0.5rem'};
  flex-wrap: ${({ $wrap }) => ($wrap === false ? 'nowrap' : 'wrap')};
  justify-content: ${({ $justify }) => $justify ?? 'flex-start'};
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.875rem;
`;

/* ---------------- Статистика ---------------- */

const StatBox = styled(Card)`
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
  &:hover > div:first-child {
    transform: scale(1.08) rotate(-4deg);
  }
`;

const IconBubble = styled.div<{ $tone: Tone }>`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  ${({ theme, $tone }) => {
    const t = toneColors(theme, $tone);
    return css`color: ${t.fg}; background: ${t.bg};`;
  }}
`;

const StatText = styled.div`
  min-width: 0;
  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 500;
  }
  .value {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .hint {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: 0.15rem;
  }
`;

export function StatCard({ icon, label, value, hint, tone = 'primary' }: { icon: ReactNode; label: string; value: ReactNode; hint?: ReactNode; tone?: Tone }) {
  return (
    <StatBox>
      <IconBubble $tone={tone}>{icon}</IconBubble>
      <StatText>
        <div className="label">{label}</div>
        <div className="value"><AnimatedNumber value={value} /></div>
        {hint && <div className="hint">{hint}</div>}
      </StatText>
    </StatBox>
  );
}

/* ---------------- Badge / Chip ---------------- */

export const Badge = styled.span<{ $tone?: Tone }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.25s, color 0.25s;
  ${({ theme, $tone }) => {
    const t = toneColors(theme, $tone ?? 'neutral');
    return css`color: ${t.fg}; background: ${t.bg};`;
  }}
`;

export const GradeChip = styled.span<{ $value: number }>`
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  animation: ${popIn} 0.35s ease both;
  ${({ theme, $value }) => {
    const tone: Tone = $value >= 5 ? 'success' : $value === 4 ? 'info' : $value === 3 ? 'warning' : 'danger';
    const t = toneColors(theme, tone);
    return css`color: ${t.fg}; background: ${t.bg};`;
  }}
`;

/* ---------------- Баскычтар жана формалар ---------------- */

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'; $size?: 'sm' | 'md' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-weight: 600;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s, box-shadow 0.2s;
  white-space: nowrap;
  padding: ${({ $size }) => ($size === 'sm' ? '0.35rem 0.7rem' : '0.6rem 1.1rem')};
  font-size: ${({ $size }) => ($size === 'sm' ? '0.82rem' : '0.92rem')};

  ${({ theme, $variant = 'primary' }) => {
    const c = theme.colors;
    switch ($variant) {
      case 'secondary':
        return css`background: ${c.surface}; color: ${c.textMain}; border-color: ${c.borderStrong};
          &:hover:not(:disabled) { background: ${c.surfaceAlt}; border-color: ${c.textMuted}; }`;
      case 'ghost':
        return css`background: transparent; color: ${c.textMuted};
          &:hover:not(:disabled) { background: ${c.background}; color: ${c.textMain}; }`;
      case 'danger':
        return css`background: ${c.dangerSoft}; color: ${c.danger};
          &:hover:not(:disabled) { background: ${c.danger}; color: white; }`;
      case 'success':
        return css`background: ${c.success}; color: white;
          &:hover:not(:disabled) { filter: brightness(0.95); }`;
      default:
        return css`background: ${c.primary}; color: white;
          &:hover:not(:disabled) { background: ${c.primaryHover}; }`;
    }
  }}

  &:active:not(:disabled) {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const fieldBase = css`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

export const Input = styled.input`${fieldBase}`;
export const Select = styled.select`${fieldBase} cursor: pointer;`;
export const Textarea = styled.textarea`${fieldBase} resize: vertical; min-height: 90px;`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 0;
  flex: 1;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.9rem;

  > * {
    flex: 1 1 180px;
  }
`;

/* ---------------- Таблица ---------------- */

export const TableWrap = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -1.25rem;
  padding: 0 1.25rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 0.65rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }
  th {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 600;
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
  tbody tr {
    animation: ${fadeUp} 0.4s ease both;
    ${stagger(35, 16)}
  }
  td {
    transition: background 0.15s;
  }
  tbody tr:hover td {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
  td.center, th.center {
    text-align: center;
  }
  td.wrap {
    white-space: normal;
    min-width: 200px;
  }
`;

/* ---------------- Тилке диаграмма ---------------- */

const BarRow = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 140px) 1fr 52px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  padding: 0.35rem 0;

  animation: ${fadeUp} 0.4s ease both;
  ${stagger(80, 12)}

  .lbl {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .val {
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const Track = styled.div`
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const Fill = styled.div<{ $w: number; $tone: Tone }>`
  height: 100%;
  width: ${({ $w }) => Math.max(0, Math.min(100, $w))}%;
  border-radius: 999px;
  background: ${({ theme, $tone }) => toneColors(theme, $tone).fg};
  transform-origin: left center;
  animation: ${growX} 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: width 0.5s ease;
`;

export interface BarItem {
  label: string;
  value: number;
  max: number;
  display: string;
  tone?: Tone;
}

export function BarList({ items }: { items: BarItem[] }) {
  if (items.length === 0) return <EmptyState>Маалымат жок</EmptyState>;
  return (
    <div>
      {items.map((it, i) => (
        <BarRow key={it.label}>
          <span className="lbl" title={it.label}>{it.label}</span>
          <Track><Fill style={{ animationDelay: `${150 + i * 80}ms` }} $w={(it.value / it.max) * 100} $tone={it.tone ?? 'primary'} /></Track>
          <span className="val">{it.display}</span>
        </BarRow>
      ))}
    </div>
  );
}

/* ---------------- Ар кандай ---------------- */

export const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

const SegWrap = styled.div`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 3px;
  gap: 2px;
  flex-wrap: wrap;
`;

const SegBtn = styled.button<{ $active: boolean }>`
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.textMain : theme.colors.textMuted)};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadow.sm : 'none')};
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.textMain};
  }
`;

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <SegWrap role="tablist">
      {options.map((o) => (
        <SegBtn key={o.value} type="button" role="tab" aria-selected={o.value === value} $active={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </SegBtn>
      ))}
    </SegWrap>
  );
}

export const ListItem = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeUp} 0.4s ease both;
  ${stagger(45, 12)}

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  &:first-child {
    padding-top: 0;
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-weight: 600;
    font-size: 0.92rem;
  }
  .sub {
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Notice = styled.div<{ $tone?: Tone }>`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.88rem;
  margin-bottom: 1rem;
  animation: ${slideDown} 0.35s ease both;
  ${({ theme, $tone }) => {
    const t = toneColors(theme, $tone ?? 'info');
    return css`color: ${t.fg}; background: ${t.bg};`;
  }}
  svg { flex-shrink: 0; margin-top: 2px; }
`;

const MiniBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 0.6rem 0.75rem;
  div:first-child { font-size: 0.75rem; color: ${({ theme }) => theme.colors.textMuted}; }
  div:last-child { font-size: 1.15rem; font-weight: 700; }
`;

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <MiniBox>
      <div>{label}</div>
      <div>{value}</div>
    </MiniBox>
  );
}
