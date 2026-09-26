'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

/**
 * A Forja é um documento completo e autossuficiente: traz o próprio design system
 * (Cormorant/Lora, variáveis :root, data-theme), o próprio JS e atalhos de teclado
 * em letras soltas — T, G, X, H, D, R, C, F, /. Embutir isso na árvore React
 * colidiria com o Tailwind, com a pilha de fontes do app e com o Cmd/Ctrl+K do
 * assistente. Servido como documento próprio, cada um mantém sua cascata de CSS e
 * seu escopo de teclado, e nenhuma função se perde.
 *
 * Mesma origem, então o progresso (forja-quimica-v1, fq-*) persiste normalmente e
 * não esbarra nas chaves qp:* do app.
 */
export default function ForjaEmbed() {
  const caixaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [carregando, setCarregando] = useState(true);

  // A altura vem do espaço que sobra abaixo do cabeçalho, medido de verdade —
  // assim o embed acompanha o header em qualquer breakpoint, inclusive com o
  // menu mobile aberto, sem número mágico.
  const medir = useCallback(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const topo = caixa.getBoundingClientRect().top + window.scrollY;
    caixa.style.setProperty('--forja-topo', `${Math.max(0, Math.round(topo))}px`);
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener('resize', medir);
    const observer = new ResizeObserver(medir);
    if (document.body) observer.observe(document.body);
    return () => {
      window.removeEventListener('resize', medir);
      observer.disconnect();
    };
  }, [medir]);

  // Espelha o tema do app no documento da Forja. O atalho T dela continua
  // valendo e sobrepõe isto — é o comportamento esperado de quem está lá dentro.
  const sincronizarTema = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    const escuro = document.documentElement.classList.contains('dark');
    doc.documentElement.setAttribute('data-theme', escuro ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(sincronizarTema);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [sincronizarTema]);

  return (
    <div
      ref={caixaRef}
      className="relative w-full"
      style={{ height: 'calc(100dvh - var(--forja-topo, 3.8rem))' }}
    >
      {carregando && (
        <div className="absolute inset-0 grid place-items-center gap-3 bg-bg">
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="animate-spin" size={22} />
            <p className="text-sm">Carregando a Forja…</p>
          </div>
        </div>
      )}

      <iframe
        ref={frameRef}
        src="/forja/index.html"
        title="Forja Química ENEM"
        className="h-full w-full border-0"
        // Sem sandbox de propósito: o documento é nosso e está na mesma origem,
        // e "allow-scripts allow-same-origin" não isola nada nesse caso — só
        // arriscaria quebrar alguma função da página em troca de nenhuma garantia.
        onLoad={() => {
          setCarregando(false);
          medir();
          sincronizarTema();
        }}
      />

      <a
        href="/forja/index.html"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-line bg-bg/90 px-3 py-1.5 text-xs text-muted backdrop-blur transition-colors hover:text-ink no-print"
      >
        <ExternalLink size={13} />
        Abrir em tela cheia
      </a>
    </div>
  );
}
