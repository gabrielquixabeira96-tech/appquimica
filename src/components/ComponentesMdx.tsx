'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, Info, FlaskConical, Target, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

/**
 * Blocos didáticos disponíveis dentro dos arquivos .mdx de content/temas/.
 * Use-os para que a teoria não vire um muro de texto.
 */

const ESTILOS = {
  dica: { Icone: Lightbulb, classe: 'border-brand/40 bg-brand/5', titulo: 'Dica de prova' },
  atencao: { Icone: AlertTriangle, classe: 'border-warn/40 bg-warn/10', titulo: 'Atenção' },
  info: { Icone: Info, classe: 'border-line bg-surface2', titulo: 'Para saber mais' },
  erro: { Icone: AlertTriangle, classe: 'border-err/40 bg-err/10', titulo: 'Erro clássico' },
} as const;

export function Alerta({
  tipo = 'info',
  titulo,
  children,
}: {
  tipo?: keyof typeof ESTILOS;
  titulo?: string;
  children: React.ReactNode;
}) {
  const { Icone, classe, titulo: padrao } = ESTILOS[tipo];
  return (
    <div className={clsx('my-5 rounded-2xl border p-4', classe)}>
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icone size={16} /> {titulo ?? padrao}
      </p>
      <div className="text-sm [&>p:last-child]:mb-0 [&>p]:mb-2">{children}</div>
    </div>
  );
}

export function Formula({ nome, children, quando }: { nome?: string; children: React.ReactNode; quando?: string }) {
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-line">
      {nome && <p className="label border-b border-line bg-surface2 px-4 py-2">{nome}</p>}
      <div className="px-4 py-3 text-center">{children}</div>
      {quando && <p className="border-t border-line bg-surface2 px-4 py-2 text-xs text-muted">Use quando: {quando}</p>}
    </div>
  );
}

export function Exemplo({ titulo = 'Exemplo resolvido', children }: { titulo?: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p className="mb-3 flex items-center gap-2 font-display text-base font-bold">
        <FlaskConical size={16} className="text-brand" /> {titulo}
      </p>
      <div className="text-sm [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function PassoAPasso({ children }: { children: React.ReactNode }) {
  return <ol className="my-5 space-y-3 border-l-2 border-brand/30 pl-5 [counter-reset:passo]">{children}</ol>;
}

export function Passo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <li className="relative list-none [counter-increment:passo]">
      <span className="absolute -left-[1.85rem] grid h-6 w-6 place-items-center rounded-full bg-brand font-mono text-xs text-brandInk before:content-[counter(passo)]" />
      <p className="font-semibold">{titulo}</p>
      <div className="text-sm text-muted [&>p:last-child]:mb-0">{children}</div>
    </li>
  );
}

export function Objetivos({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 rounded-2xl border border-line bg-surface2/60 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Target size={15} className="text-brand" /> Ao final deste tema você consegue
      </p>
      <div className="text-sm [&_ul]:my-0">{children}</div>
    </div>
  );
}

export function Flashcard({ frente, verso }: { frente: string; verso: string }) {
  const [virado, setVirado] = useState(false);
  return (
    <button
      onClick={() => setVirado((v) => !v)}
      className="my-3 w-full rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-brand"
    >
      <p className="label mb-1">{virado ? 'resposta' : 'pergunta — clique para virar'}</p>
      <p className="text-sm">{virado ? verso : frente}</p>
    </button>
  );
}

export function Detalhe({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-line">
      <button onClick={() => setAberto((a) => !a)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-surface2">
        {titulo}
        <ChevronDown size={16} className={clsx('transition-transform', aberto && 'rotate-180')} />
      </button>
      {aberto && <div className="border-t border-line px-4 py-3 text-sm">{children}</div>}
    </div>
  );
}

export function Video({ url, titulo }: { url: string; titulo?: string }) {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
  if (!id) return <a href={url}>{titulo ?? url}</a>;
  return (
    <figure className="my-5">
      <div className="aspect-video overflow-hidden rounded-2xl border border-line">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={titulo ?? 'Vídeo'}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {titulo && <figcaption className="mt-2 text-xs text-muted">{titulo}</figcaption>}
    </figure>
  );
}

export function Colunas({ children }: { children: React.ReactNode }) {
  return <div className="my-5 grid gap-4 sm:grid-cols-2">{children}</div>;
}

