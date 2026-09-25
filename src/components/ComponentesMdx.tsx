'use client';

import { useState } from 'react';
import clsx from 'clsx';

/**
 * Blocos didáticos disponíveis dentro dos arquivos .mdx de content/temas/.
 * Todos desenham com traço e régua — nenhum deles preenche a página de cor.
 */

const ALERTAS = {
  dica: { titulo: 'Dica de prova', borda: 'rgb(var(--c-n300))', rotulo: 'text-ivoryWarm' },
  atencao: { titulo: 'Atenção', borda: 'rgb(var(--c-warn))', rotulo: 'text-warn' },
  info: { titulo: 'Para saber mais', borda: 'rgb(var(--c-ivory) / 0.26)', rotulo: 'text-ivoryWarm' },
  erro: { titulo: 'Erro clássico', borda: 'rgb(var(--c-err))', rotulo: 'text-err' },
} as const;

export function Alerta({
  tipo = 'info',
  titulo,
  children,
}: {
  tipo?: keyof typeof ALERTAS;
  titulo?: string;
  children: React.ReactNode;
}) {
  const { titulo: padrao, borda, rotulo } = ALERTAS[tipo];
  return (
    <div className="card my-6 p-5" style={{ borderColor: borda }}>
      <p className={clsx('kick mb-2', rotulo)}>{titulo ?? padrao}</p>
      <div className="text-[15px] leading-[1.6] [&>p:last-child]:mb-0 [&>p]:mb-2">{children}</div>
    </div>
  );
}

/** A fórmula gravada numa placa escura, com moldura dupla e o § fantasma. */
export function Formula({ nome, children, quando }: { nome?: string; children: React.ReactNode; quando?: string }) {
  return (
    <div
      className="relative my-7 overflow-hidden rounded-sm bg-surface px-6 py-7 text-center"
      style={{
        border: '1px solid rgb(var(--c-ivory) / 0.45)',
        outline: '1px solid rgb(var(--c-ivory) / 0.22)',
        outlineOffset: '6px',
      }}
    >
      <div className="ghost left-3 top-2 text-[56px]">§</div>
      <div className="relative font-display text-[34px] italic text-ivoryWarm">{children}</div>
      {nome && <div className="kick relative mt-3">{nome}</div>}
      {quando && (
        <div className="relative mt-2 text-xs uppercase tracking-[0.18em] text-[rgb(var(--c-n300))]">
          Use quando: {quando}
        </div>
      )}
    </div>
  );
}

export function Exemplo({ titulo = 'Exemplo resolvido', children }: { titulo?: string; children: React.ReactNode }) {
  return (
    <div className="my-8">
      <h3 className="mb-3 font-display text-[28px] font-semibold text-ivory">{titulo}</h3>
      <div className="text-[15px] leading-[1.6] [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

/** Passos numerados: numeral em Cormorant, cada degrau separado por hairline. */
export function PassoAPasso({ children }: { children: React.ReactNode }) {
  return <ol className="my-5 list-none p-0 [counter-reset:passo]">{children}</ol>;
}

export function Passo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <li
      className="flex list-none gap-4 border-b py-3.5 [counter-increment:passo] last:border-b-0"
      style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.12)' }}
    >
      <span className="font-display text-[22px] text-ivoryWarm tnum before:content-[counter(passo)]" />
      <div className="min-w-0 text-[15px] leading-[1.6]">
        <strong className="font-semibold text-ivory">{titulo}</strong>{' '}
        <span className="[&>p:first-child]:inline [&>p:last-child]:mb-0">{children}</span>
      </div>
    </li>
  );
}

export function Objetivos({ children }: { children: React.ReactNode }) {
  return (
    <div className="card my-6 p-5">
      <p className="kick mb-2">Ao final deste tema você consegue</p>
      <div className="text-[15px] leading-[1.7] [&_ul]:my-0">{children}</div>
    </div>
  );
}

/** Flashcard com virada 3D de verdade — frente e verso em faces opostas. */
export function Flashcard({ frente, verso }: { frente: string; verso: string }) {
  const [virado, setVirado] = useState(false);

  return (
    <div className="flipw my-4">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={virado}
        onClick={() => setVirado((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setVirado((v) => !v);
          }
        }}
        className={clsx('flip', virado && 'flip-on')}
      >
        <div className="fface">
          <div className="kick flex justify-between">
            <span>Flashcard</span>
            <span>frente</span>
          </div>
          <p className="mt-3 font-display text-[22px] leading-[1.35] text-ivory">{frente}</p>
          <div className="mt-auto text-xs text-[rgb(var(--c-n500))]">Clique para virar</div>
        </div>

        <div className="fface fback">
          <div className="kick flex justify-between">
            <span>Flashcard</span>
            <span>verso</span>
          </div>
          <p className="mt-3 text-[15px] leading-[1.55] text-[rgb(var(--c-n200))]">{verso}</p>
          <div className="mt-auto text-xs text-[rgb(var(--c-n500))]">Clique para voltar</div>
        </div>
      </div>
    </div>
  );
}

export function Detalhe({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <details
      className="my-6 border-t pt-3.5"
      style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.15)' }}
    >
      <summary className="cursor-pointer font-display text-[19px] text-ivory marker:text-[rgb(var(--c-n500))]">
        {titulo}
      </summary>
      <div className="mt-3 text-[15px] leading-[1.65]">{children}</div>
    </details>
  );
}

export function Video({ url, titulo }: { url: string; titulo?: string }) {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
  if (!id) return <a href={url}>{titulo ?? url}</a>;
  return (
    <figure className="plated my-6">
      <div className="aspect-video overflow-hidden">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={titulo ?? 'Vídeo'}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {titulo && (
        <figcaption className="mt-2.5 text-xs text-[rgb(var(--c-n400))]">{titulo}</figcaption>
      )}
    </figure>
  );
}

export function Colunas({ children }: { children: React.ReactNode }) {
  return <div className="my-6 grid gap-6 sm:grid-cols-2">{children}</div>;
}
