import type { Config } from 'tailwindcss';

const config: Config = {
  // Tema único (escuro). A classe 'dark' fica fixa no <html> para que os
  // utilitários dark: do plugin typography continuem resolvendo.
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        surface2: 'rgb(var(--c-surface-2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        brand: 'rgb(var(--c-brand) / <alpha-value>)',
        brandInk: 'rgb(var(--c-brand-ink) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        err: 'rgb(var(--c-err) / <alpha-value>)',
        // O marfim — base de todo traço, véu e hairline do sistema
        ivory: 'rgb(var(--c-ivory) / <alpha-value>)',
        ivoryWarm: 'rgb(var(--c-ivory-warm) / <alpha-value>)',
        ivoryBright: 'rgb(var(--c-ivory-bright) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'Georgia', 'serif'],
      },
      // Cantos quase retos: a escala Classical é 2 / 4 / 7px. Os apelidos
      // maiores colapsam para 7px, então qualquer rounded-* remanescente
      // segue dentro do sistema em vez de virar uma pílula.
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '7px',
        xl: '7px',
        '2xl': '7px',
        '3xl': '7px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 18px 40px rgb(0 0 0 / 0.5)',
      },
      maxWidth: { content: '72ch' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
