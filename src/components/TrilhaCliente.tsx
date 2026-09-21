'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useProgresso } from '@/lib/progresso';
import type { Prioridade } from '@/lib/tipos';

export interface TemaDaAla {
  slug: string;
  titulo: string;
  prioridade: Prioridade;
  questoes: number;
  temTeoria: boolean;
}

export interface AlaCompleta {
  slug: string;
  titulo: string;
  descricao: string;
  roman: string;
  num: string;
  temas: TemaDaAla[];
}

/** Só as duas prioridades altas ganham etiqueta — o resto seria ruído. */
const ETIQUETA: Partial<Record<Prioridade, string>> = {
  critica: 'cai muito',
  alta: 'prioridade alta',
};

export default function TrilhaCliente({ alas }: { alas: AlaCompleta[] }) {
  const { progresso, alternarTema, desempenhoPorTema, pronto } = useProgresso();

  return (
    <>
      {alas.map((ala) => {
        const feitos = ala.temas.filter((t) => progresso.temasConcluidos.includes(t.slug)).length;
        const pct = ala.temas.length ? Math.round((feitos / ala.temas.length) * 100) : 0;

        return (
          <section key={ala.slug} id={ala.slug} className="relative mt-14 scroll-mt-24">
            <div className="ghost -top-8 right-0 text-[150px]">{ala.num}</div>

            <div className="relative flex flex-wrap items-baseline gap-3">
              <span className="font-display text-[34px] font-medium text-ivoryWarm">Ala {ala.roman}</span>
              <h2 className="m-0 font-display text-[27px] font-semibold text-ivory">{ala.titulo}</h2>
              <span className="ml-auto text-[13px] text-[rgb(var(--c-n400))] tnum">
                {pronto ? feitos : 0} de {ala.temas.length} concluídos
              </span>
            </div>

            <p className="relative mt-1 max-w-[62ch] text-sm text-[rgb(var(--c-n400))]">{ala.descricao}</p>

            <div className="trk mt-3">
              <span className="barra" style={{ width: `${pronto ? pct : 0}%` }} />
            </div>

            {ala.temas.map((tema) => {
              const feito = progresso.temasConcluidos.includes(tema.slug);
              const d = desempenhoPorTema(tema.slug);
              const etiqueta = ETIQUETA[tema.prioridade];

              return (
                <div
                  key={tema.slug}
                  className="relative flex flex-wrap items-center gap-4 border-b py-3.5"
                  style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.12)' }}
                >
                  <button
                    onClick={() => alternarTema(tema.slug)}
                    className={clsx('chk', feito && 'chk-on')}
                    title={feito ? 'Desmarcar tema' : 'Marcar como concluído'}
                    aria-pressed={feito}
                    aria-label={feito ? `Desmarcar ${tema.titulo}` : `Marcar ${tema.titulo} como concluído`}
                  >
                    {pronto && feito ? '✓' : ''}
                  </button>

                  <Link
                    href={`/temas/${tema.slug}`}
                    className="border-b border-transparent text-[17px] text-ivory no-underline hover:border-[rgb(var(--c-n300))]"
                  >
                    {tema.titulo}
                  </Link>

                  {etiqueta && <span className="chip chip-forte">{etiqueta}</span>}
                  {!tema.temTeoria && <span className="chip opacity-70">teoria pendente</span>}

                  <span className="ml-auto whitespace-nowrap text-[13px] text-[rgb(var(--c-n400))] tnum">
                    {tema.questoes} {tema.questoes === 1 ? 'questão' : 'questões'}
                    {pronto && d.total > 0 && ` · ${Math.round((d.acertos / d.total) * 100)}%`}
                  </span>
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
