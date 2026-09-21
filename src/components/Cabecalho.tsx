'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { href: '/', rotulo: 'Início' },
  { href: '/trilha', rotulo: 'Trilha' },
  { href: '/questoes', rotulo: 'Questões' },
  { href: '/simulado', rotulo: 'Simulado' },
  { href: '/assistente', rotulo: 'Assistente' },
  { href: '/config', rotulo: 'Config' },
];

export default function Cabecalho() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [pathname]);

  // '/' só acende na home; as demais acendem em qualquer rota-filha.
  const ativo = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className="no-print sticky top-0 z-40 border-b backdrop-blur-[10px]"
      style={{
        background: 'color-mix(in srgb, rgb(var(--c-surface)) 88%, transparent)',
        borderBottomColor: 'rgb(var(--c-ivory) / 0.35)',
      }}
    >
      <div className="mx-auto flex max-w-[1160px] items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 font-display text-xl font-medium tracking-[0.06em] text-ivory">
          Q<span className="text-[rgb(var(--c-n300))]">v</span>ímica{' '}
          <span className="ml-1.5 hidden text-xs tracking-[0.2em] text-[rgb(var(--c-n400))] sm:inline">
            ENEM &amp; VESTIBVLARES
          </span>
        </Link>

        <nav className="ml-auto hidden flex-wrap items-center gap-4 md:flex">
          {LINKS.map(({ href, rotulo }) => (
            <Link key={href} href={href} className={clsx('nv', ativo(href) && 'nv-on')}>
              {rotulo}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setAberto((a) => !a)}
          className="btn btn-sm ml-auto px-3 md:hidden"
          aria-label="Menu"
          aria-expanded={aberto}
        >
          {aberto ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {aberto && (
        <nav
          className="grid gap-1 border-t px-4 py-3 md:hidden"
          style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.2)' }}
        >
          {LINKS.map(({ href, rotulo }) => (
            <Link key={href} href={href} className={clsx('nv py-2.5', ativo(href) && 'nv-on')}>
              {rotulo}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
