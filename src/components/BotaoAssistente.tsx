'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Chat from './Chat';

/** Assistente flutuante: acompanha o aluno em qualquer página e já sabe qual tema está aberto. */
export default function BotaoAssistente() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const temaSlug = pathname.startsWith('/temas/') ? pathname.split('/')[2] : undefined;
  const escondido = pathname.startsWith('/assistente');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((a) => !a);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (escondido) return null;

  return (
    <div className="no-print assistente-flutuante">
      <button
        onClick={() => setAberto((a) => !a)}
        className="btn btn-sm fixed bottom-7 right-7 z-50 bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
        aria-label="Abrir assistente"
        aria-expanded={aberto}
      >
        {aberto ? '✳ Fechar' : '✳ Assistente · Ctrl K'}
      </button>

      {aberto && (
        <div
          className="fixed bottom-24 right-7 z-50 w-[min(28rem,calc(100vw-3.5rem))] overflow-hidden rounded border bg-bg shadow-card"
          style={{ borderColor: 'rgb(var(--c-ivory) / 0.35)' }}
        >
          <Chat temaSlug={temaSlug} altura="h-[min(34rem,70vh)]" />
        </div>
      )}
    </div>
  );
}
