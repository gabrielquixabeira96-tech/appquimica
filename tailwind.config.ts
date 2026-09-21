import type { Config } from 'tailwindcss';
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        bg: rgb('--c-bg'), surface: rgb('--c-surface'), surface2: rgb('--c-surface-2'), surface3: rgb('--c-surface-3'), line: rgb('--c-line'), ink: rgb('--c-ink'), muted: rgb('--c-muted'),
        brand: rgb('--c-brand'), brandInk: rgb('--c-brand-ink'), brandSoft: rgb('--c-brand-soft'), brandGlow: rgb('--c-brand-glow'), brandEdge: rgb('--c-brand-edge'),
        accent: rgb('--c-accent'), gold: rgb('--c-gold'), flame: rgb('--c-flame'), ok: rgb('--c-ok'), okSoft: rgb('--c-ok-soft'), okEdge: rgb('--c-ok-edge'), warn: rgb('--c-warn'), err: rgb('--c-err'), errSoft: rgb('--c-err-soft'), errEdge: rgb('--c-err-edge'),
        eixo1: rgb('--c-eixo-1'), eixo2: rgb('--c-eixo-2'), eixo3: rgb('--c-eixo-3'), eixo4: rgb('--c-eixo-4'), eixo5: rgb('--c-eixo-5'), tema: rgb('--c-tema'), temaEdge: rgb('--c-tema-edge'),
      },
      fontFamily: { sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'], display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'], mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'] },
      borderRadius: { xl: '14px', '2xl': '18px', '3xl': '24px', '4xl': '32px' },
      boxShadow: { card: '0 1px 2px rgb(0 0 0 / .04), 0 10px 28px -16px rgb(0 0 0 / .22)', cardHover: '0 2px 4px rgb(0 0 0 / .05), 0 22px 46px -20px rgb(0 0 0 / .30)', pop: '0 18px 40px -18px rgb(var(--c-brand) / .55)' },
      transitionTimingFunction: { spring: 'cubic-bezier(.34,1.56,.64,1)', quint: 'cubic-bezier(.22,1,.36,1)', snap: 'cubic-bezier(.2,.8,.3,1)' },
      keyframes: { riseIn: { '0%': { transform: 'translateY(18px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }, bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } }, drift: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '33%': { transform: 'translate3d(3%,-4%,0) scale(1.06)' }, '66%': { transform: 'translate3d(-3%,3%,0) scale(.96)' } }, spinSlow: { to: { transform: 'rotate(360deg)' } }, kenburns: { '0%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1.12)' } } },
      animation: { riseIn: 'riseIn .6s cubic-bezier(.22,1,.36,1) both', bob: 'bob 2.4s ease-in-out infinite', drift: 'drift 22s ease-in-out infinite', spinSlow: 'spinSlow 26s linear infinite', kenburns: 'kenburns 24s ease-in-out infinite alternate' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
