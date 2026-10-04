import { css, keyframes } from 'styled-components';

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

export const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: none; }
`;

export const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.6); }
  70%  { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
`;

export const growX = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
`;

export const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

export const shimmer = keyframes`
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
`;

/** Тизмедеги элементтерге кезек менен (stagger) пайда болуу */
export function stagger(step = 60, max = 10) {
  return Array.from({ length: max }, (_, i) => `&:nth-child(${i + 1}) { animation-delay: ${i * step}ms; }`).join('\n');
}

export const enter = (delay = 0) => css`
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both;
`;
