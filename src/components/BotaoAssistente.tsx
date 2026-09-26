'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X } from 'lucide-react';
import Chat from './Chat';

/** Assistente flutuante: acompanha o aluno em qualquer página e já sabe qual tema está aberto. */
export default function BotaoAssistente() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const temaSlug = pathname.startsWith('/temas/') ? pathname.split('/')[2] : undefined;
  const escondido = pathname.startsWith('/assistente');

  const contextoPagina = pathname.startsWith('/forja')
    ? 'O aluno está na Forja: as questões de Química do ENEM de 2020 a 2025, cada uma virada máquina de decisão. ' +
      'Ele toca num dado sublinhado do enunciado e a questão inteira se reescreve — vinheta, gabarito e comentário. ' +
      'A página tem tabela periódica, ponte do mol, simulador de equilíbrio, escala de pH, balanceador e modo grifo. ' +
      'Provavelmente a dúvida nasce de uma questão que ele acabou de responder ou de uma variação que ele forjou, ' +
      'então pergunte de qual questão ou variação se trata antes de assumir.'
    : undefined;

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
    <div className="no-print">
      <button
        onClick={() => setAberto((a) => !a)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-brandInk shadow-card transition-transform hover:scale-105"
        aria-label="Abrir assistente"
      >
        {aberto ? <X size={18} /> : <Bot size={18} />}
        <span className="hidden sm:inline">{aberto ? 'Fechar' : 'Tirar dúvida'}</span>
      </button>

      {aberto && (
        <div className="fixed bottom-20 right-5 z-50 w-[min(28rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <Chat temaSlug={temaSlug} contextoPagina={contextoPagina} altura="h-[min(34rem,70vh)]" />
        </div>
      )}
    </div>
  );
}
