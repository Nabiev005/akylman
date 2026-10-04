import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textMain};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  input, button, select, textarea {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
  }

  html {
    scroll-behavior: smooth;
  }

  /* Лендингдеги секциялар экранга киргенде пайда болот (useReveal) */
  /* fill-mode: backwards — анимация бүткөндөн кийин hover transform'го тоскоол болбойт */
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: none; }
  }
  [data-reveal] {
    opacity: 0;
  }
  [data-reveal].is-visible {
    opacity: 1;
    animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms) backwards;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    [data-reveal] {
      opacity: 1;
      transform: none;
    }
  }
`;
