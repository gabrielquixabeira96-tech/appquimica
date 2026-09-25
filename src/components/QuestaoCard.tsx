'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const DIFICULDADE: Record<string, string> = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };

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
  const acertou = escolha === questao.gabarito;

  function escolher(letra: Letra) {
    if (modo === 'estudo' && respondida) return;
    setEscolha(letra);
    onResponder?.(letra, letra === questao.gabarito);
  }

  return (
    <article className="card mt-6 p-5">
      <div className="flex flex-wrap items-center gap-2">
        {numero !== undefined && (
          <span className="text-[13px] text-[rgb(var(--c-n400))] tnum">{String(numero).padStart(2, '0')}</span>
        )}
        {(questao.banca || questao.ano) && (
          <span className="chip">{[questao.banca, questao.ano].filter(Boolean).join(' · ')}</span>
        )}
        {linkTema ? (
          <Link href={`/temas/${linkTema.slug}`} className="chip chip-forte no-underline">
            {linkTema.titulo}
          </Link>
        ) : null}
        {questao.dificuldade && (
          <span className="text-[13px] text-[rgb(var(--c-n400))]">
            {DIFICULDADE[questao.dificuldade] ?? questao.dificuldade}
          </span>
        )}
        {onFavoritar && (
          <button
            onClick={onFavoritar}
            title="Guardar para revisão"
            aria-pressed={favorita}
            aria-label={favorita ? 'Remover da revisão' : 'Guardar para revisão'}
            className={clsx('fav', favorita && 'fav-on')}
          >
            ★
          </button>
        )}
      </div>

      <div
        className="prosa my-5 text-[15px] leading-[1.6] [&_p:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: renderizarMarkdown(questao.enunciado) }}
      />

      {questao.imagem && (
        <figure className="plated mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={questao.imagem} alt="Figura da questão" className="max-h-96 object-contain" />
        </figure>
      )}

      <div className="flex flex-col gap-2">
        {questao.alternativas.map((alt) => {
          const isCorreta = alt.letra === questao.gabarito;
          const isEscolhida = alt.letra === escolha;

          // Correção monocromática: a marca ✓ / ✕ e a opacidade carregam o
          // significado, nunca a cor sozinha.
          const cls = !exibirCorrecao
            ? isEscolhida && 'alt-sel'
            : isCorreta
              ? 'alt-certa'
              : isEscolhida
                ? 'alt-errada'
                : 'alt-fora';

          const marca = exibirCorrecao && isCorreta ? '✓' : exibirCorrecao && isEscolhida ? '✕' : alt.letra;

          return (
            <div key={alt.letra}>
              <button
                onClick={() => escolher(alt.letra)}
                disabled={exibirCorrecao && modo === 'estudo'}
                className={clsx('alt', cls)}
              >
                <span className="min-w-[18px] font-display text-[17px] font-semibold text-ivoryWarm">{marca}</span>
                <span
                  className="[&_p]:my-0"
                  dangerouslySetInnerHTML={{ __html: renderizarMarkdown(alt.texto) }}
                />
              </button>

              {exibirCorrecao && questao.comentarioAlternativas?.[alt.letra] && (
                <p className="mt-1 pl-4 text-xs text-[rgb(var(--c-n400))]">
                  {questao.comentarioAlternativas[alt.letra]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {modo === 'estudo' && !exibirCorrecao && (
        <button onClick={() => setMostrar(true)} className="btn btn-sm mt-4">
          Ver gabarito sem responder
        </button>
      )}

      {exibirCorrecao && (
        <div className="mt-5 border-t pt-3.5" style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.15)' }}>
          <div className="text-[13px] uppercase tracking-[0.1em] text-ivoryWarm">
            ✳{' '}
            {escolha
              ? acertou
                ? 'Você acertou.'
                : `Você marcou ${escolha} — gabarito: ${questao.gabarito}.`
              : `Gabarito: ${questao.gabarito}.`}
          </div>
          {questao.comentario ? (
            <div
              className="prosa mt-2 text-[15px] leading-[1.6]"
              dangerouslySetInnerHTML={{ __html: renderizarMarkdown(questao.comentario) }}
            />
          ) : (
            <p className="mt-2 text-[15px] leading-[1.6] text-[rgb(var(--c-n400))]">
              Sem comentário cadastrado ainda. Pergunte ao assistente: ele explica a partir da teoria do tema.
            </p>
          )}
          {linkTema && (
            <Link
              href={`/temas/${linkTema.slug}`}
              className="mt-3 inline-block border-b border-[rgb(var(--c-n300))] text-[13px] uppercase tracking-[0.12em] text-ivory no-underline hover:text-ivoryBright"
            >
              Revisar a teoria de {linkTema.titulo}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
