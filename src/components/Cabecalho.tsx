'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Atom, BookOpen, ListChecks, Hammer, Timer, Bot, Settings, Moon, Sun, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { href: '/trilha', rotulo: 'Trilha', Icone: BookOpen },
  { href: '/questoes', rotulo: 'Questões', Icone: ListChecks },
  { href: '/forja', rotulo: 'Forja', Icone: Hammer },
  { href: '/simulado', rotulo: 'Simulado', Icone: Timer },
  { href: '/assistente', rotulo: 'Assistente', Icone: Bot },
  { href: '/config', rotulo: 'Config', Icone: Settings },
];

export default function Cabecalho() {
  const pathname = usePathname();
  const [escuro, setEscuro] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => setEscuro(document.documentElement.classList.contains('dark')), []);
  useEffect(() => setAberto(false), [pathname]);

  function alternarTema() {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle('dark', novo);
    try {
      localStorage.setItem('qp:tema', novo ? 'dark' : 'light');
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur no-print">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brandInk">
            <Atom size={19} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold">Química</span>
            <span className="label">ENEM &amp; Vestibulares</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, rotulo, Icone }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(href) ? 'bg-surface2 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink',
              )}
            >
              <Icone size={16} />
              {rotulo}
            </Link>
          ))}
        </nav>

        <button onClick={alternarTema} className="btn ml-auto px-2.5 md:ml-0" aria-label="Alternar tema">
          {escuro ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button onClick={() => setAberto((a) => !a)} className="btn px-2.5 md:hidden" aria-label="Menu">
          {aberto ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {aberto && (
        <nav className="grid gap-1 border-t border-line px-4 py-3 md:hidden">
          {LINKS.map(({ href, rotulo, Icone }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface2">
              <Icone size={16} /> {rotulo}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
