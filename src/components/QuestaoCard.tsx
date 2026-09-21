'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Star, Eye, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { renderizarMarkdown } from '@/lib/markdown';
import type { Letra, Questao } from '@/lib/tipos';

interface Props {
  questao: Questao;
  numero?: number;
  modo?: 'estudo' | 'simulado';
  marcada?: Letra | null;
  revelada?: boolean;
  favorita?: boolean;
  onResponder?: (letra: Letra, correta: boolean) => void;
  onFavoritar?: () => void;
  linkTema?: { titulo: string; slug: string } | null;
}

export default function QuestaoCard({
  questao,
  numero,
  modo = 'estudo',
  marcada = null,
  revelada = false,
  favorita = false,
  onResponder,
  onFavoritar,
  linkTema,
}: Props) {
  const [escolha, setEscolha] = useState<Letra | null>(marcada);
  const [mostrar, setMostrar] = useState(revelada);

  const respondida = escolha !== null;
  const exibirCorrecao = modo === 'estudo' ? respondida || mostrar : mostrar;

  function escolher(letra: Letra) {
    if (modo === 'estudo' && respondida) return;
    setEscolha(letra);
    onResponder?.(letra, letra === questao.gabarito);
  }

  return (
    <article className="card overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface2/60 px-4 py-2.5 text-xs">
        {numero !== undefined && <span className="font-mono font-semibold text-brand">Q{numero}</span>}
        {questao.ano && <span className="chip">{questao.ano}</span>}
        {questao.banca && <span className="chip">{questao.banca}</span>}
        {questao.dificuldade && (
          <span
            className={clsx(
              'chip',
              questao.dificuldade === 'facil' && 'text-ok',
              questao.dificuldade === 'media' && 'text-warn',
              questao.dificuldade === 'dificil' && 'text-err',
            )}
          >
            {questao.dificuldade}
          </span>
        )}
        {linkTema && (
          <Link href={`/temas/${linkTema.slug}`} className="chip hover:border-brand hover:text-brand">
            {linkTema.titulo}
          </Link>
        )}
        <button
          onClick={onFavoritar}
          className={clsx('ml-auto rounded-lg p-1.5 hover:bg-surface2', favorita ? 'text-accent' : 'text-muted')}
          aria-label="Favoritar questão"
        >
          <Star size={15} fill={favorita ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="prosa text-[15px]" dangerouslySetInnerHTML={{ __html: renderizarMarkdown(questao.enunciado) }} />

        {questao.imagem && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={questao.imagem} alt="Figura da questão" className="max-h-96 rounded-xl border border-line" />
        )}

        <ul className="space-y-2">
          {questao.alternativas.map((alt) => {
            const isCorreta = alt.letra === questao.gabarito;
            const isEscolhida = alt.letra === escolha;
            return (
              <li key={alt.letra}>
                <button
                  onClick={() => escolher(alt.letra)}
                  className={clsx(
                    'flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors',
                    !exibirCorrecao && (isEscolhida ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/60 hover:bg-surface2'),
                    exibirCorrecao && isCorreta && 'border-ok bg-ok/10',
                    exibirCorrecao && isEscolhida && !isCorreta && 'border-err bg-err/10',
                    exibirCorrecao && !isCorreta && !isEscolhida && 'border-line opacity-60',
                  )}
                >
                  <span
                    className={clsx(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-lg border font-mono text-xs font-semibold',
                      exibirCorrecao && isCorreta && 'border-ok bg-ok text-white',
                      exibirCorrecao && isEscolhida && !isCorreta && 'border-err bg-err text-white',
                    )}
                  >
                    {exibirCorrecao && isCorreta ? <Check size={13} /> : exibirCorrecao && isEscolhida ? <X size={13} /> : alt.letra}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: renderizarMarkdown(alt.texto) }} className="[&_p]:my-0" />
                </button>

                {exibirCorrecao && questao.comentarioAlternativas?.[alt.letra] && (
                  <p className="mt-1 pl-9 text-xs text-muted">{questao.comentarioAlternativas[alt.letra]}</p>
                )}
              </li>
            );
          })}
        </ul>

        {modo === 'estudo' && !exibirCorrecao && (
          <button onClick={() => setMostrar(true)} className="btn text-xs">
            <Eye size={14} /> ver gabarito sem responder
          </button>
        )}

        {exibirCorrecao && (
          <div className="rounded-xl border border-line bg-surface2/60 p-4">
            <p className="label mb-2">
              Gabarito: {questao.gabarito}
              {escolha && (escolha === questao.gabarito ? ' · você acertou' : ' · você marcou ' + escolha)}
            </p>
            {questao.comentario ? (
              <div className="prosa text-sm" dangerouslySetInnerHTML={{ __html: renderizarMarkdown(questao.comentario) }} />
            ) : (
              <p className="text-sm text-muted">
                Sem comentário cadastrado ainda. Pergunte ao assistente: ele explica a partir da teoria do tema.
              </p>
            )}
            {linkTema && (
              <Link href={`/temas/${linkTema.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm text-brand hover:underline">
                Revisar a teoria de {linkTema.titulo} <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
