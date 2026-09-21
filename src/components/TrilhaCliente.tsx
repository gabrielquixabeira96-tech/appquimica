'use client';

import Link from 'next/link';
import { Check, Circle, FileText, ListChecks, Clock } from 'lucide-react';
import clsx from 'clsx';
import { useProgresso } from '@/lib/progresso';
import type { Eixo, Tema } from '@/lib/tipos';

type TemaExt = Tema & { questoes: number; temTeoria: boolean };
type EixoExt = Omit<Eixo, 'temas'> & { temas: TemaExt[] };

const ROTULO_PRIORIDADE: Record<string, { texto: string; classe: string }> = {
  critica: { texto: 'cai muito', classe: 'text-err border-err/40' },
  alta: { texto: 'alta', classe: 'text-accent border-accent/40' },
  media: { texto: 'média', classe: '' },
  baixa: { texto: 'baixa', classe: '' },
};

export default function TrilhaCliente({ eixos }: { eixos: EixoExt[] }) {
  const { progresso, alternarTema, desempenhoPorTema, pronto } = useProgresso();

  return (
    <div className="space-y-10">
      {eixos.map((eixo) => {
        const concluidos = eixo.temas.filter((t) => progresso.temasConcluidos.includes(t.slug)).length;
        const pct = Math.round((concluidos / eixo.temas.length) * 100);

        return (
          <section key={eixo.slug}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="label flex items-center gap-2">
                  <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: eixo.cor }} />
                  Eixo {eixo.id}
                </p>
                <h2 className="titulo-secao text-2xl">{eixo.titulo}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">{eixo.descricao}</p>
              </div>
              {pronto && (
                <span className="shrink-0 font-mono text-xs text-muted">
                  {concluidos}/{eixo.temas.length} · {pct}%
                </span>
              )}
            </div>

            <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso em ${eixo.titulo}`}>
              <span style={{ width: `${pct}%` }} />
            </div>

            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {eixo.temas.map((tema) => {
                const feito = progresso.temasConcluidos.includes(tema.slug);
                const d = desempenhoPorTema(tema.slug);
                const prio = ROTULO_PRIORIDADE[tema.prioridade];

                return (
                  <li key={tema.slug} className={clsx('card card-interativo p-4', feito && 'border-brand/50')}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => alternarTema(tema.slug)}
                        className={clsx(
                          'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors',
                          feito ? 'border-brand bg-brand text-brandInk' : 'border-line text-muted hover:border-brand',
                        )}
                        aria-label={feito ? 'Desmarcar tema' : 'Marcar tema como concluído'}
                      >
                        {feito ? <Check size={13} /> : <Circle size={9} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <Link href={`/temas/${tema.slug}`} className="block">
                          <p className="flex items-center gap-2 font-display text-[.95rem] uppercase tracking-[.05em] leading-tight transition-colors hover:text-brand">
                            <span className="font-mono text-xs normal-case tracking-normal text-brand/70">{tema.id}</span>
                            {tema.titulo}
                          </p>
                          <p className="mt-1 text-sm text-muted">{tema.resumo}</p>
                        </Link>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          {prio.texto !== 'média' && prio.texto !== 'baixa' && (
                            <span className={clsx('chip', prio.classe)}>{prio.texto}</span>
                          )}
                          <span className="chip chip-neutro">
                            <Clock size={11} /> {tema.horas}h
                          </span>
                          <span className={clsx('chip', tema.temTeoria ? 'border-ok/40 bg-ok/10 text-ok' : 'chip-neutro opacity-70')}>
                            <FileText size={11} /> {tema.temTeoria ? 'teoria pronta' : 'teoria pendente'}
                          </span>
                          {tema.questoes > 0 && (
                            <span className="chip chip-neutro">
                              <ListChecks size={11} /> {tema.questoes}q
                              {d.total > 0 && ` · ${Math.round((d.acertos / d.total) * 100)}%`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
