'use client';

import Link from 'next/link';
import { useProgresso } from '@/lib/progresso';

export interface TemaRetomavel {
  slug: string;
  titulo: string;
  resumo: string;
  /** Quantas questões o banco tem para este tema. */
  questoes: number;
  /** Ala a que o tema pertence — vira a migalha "Trilha / Ala II · …". */
  ala: string;
}

/** O primeiro tema ainda não concluído, na ordem do currículo. */
function useProximoTema(temas: TemaRetomavel[]) {
  const { progresso, pronto, desempenhoPorTema } = useProgresso();
  const tema = temas.find((t) => !progresso.temasConcluidos.includes(t.slug)) ?? temas[temas.length - 1];
  const respondidas = tema ? desempenhoPorTema(tema.slug).total : 0;
  const pct = tema && tema.questoes ? Math.min(100, Math.round((respondidas / tema.questoes) * 100)) : 0;
  return { tema, pct, pronto };
}

/** Botão do herói — "Continuar: <tema>". */
export function BotaoRetomar({ temas }: { temas: TemaRetomavel[] }) {
  const { tema, pronto } = useProximoTema(temas);
  if (!tema) return null;

  return (
    <Link href={`/temas/${tema.slug}`} className="btn btn-primary">
      {pronto ? `Continuar: ${tema.titulo}` : 'Continuar os estudos'}
    </Link>
  );
}

/** A seção "Continue de onde parou": a estampa do portal ao lado do tema em aberto. */
export function SecaoRetomar({ temas }: { temas: TemaRetomavel[] }) {
  const { tema, pct, pronto } = useProximoTema(temas);
  if (!tema) return null;

  return (
    <section
      className="grid items-center gap-10"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
    >
      <figure className="plated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/templo/portal.jpg" alt="Portal aberto para o jardim clássico" />
      </figure>

      <div>
        <div className="kick">Continue de onde parou</div>
        <h2 className="mb-3 mt-2 font-display text-[clamp(32px,4vw,46px)] font-normal text-ivory">
          {tema.titulo}
        </h2>
        <p className="mb-5 text-justify leading-[1.65] text-[rgb(var(--c-n200))]">{tema.resumo}</p>

        <div className="mb-7 flex items-center gap-3">
          <span className="trk flex-1">
            <span className="barra" style={{ width: `${pronto ? pct : 0}%` }} />
          </span>
          <span className="text-[13px] text-[rgb(var(--c-n400))] tnum">
            {pronto ? `${pct}%` : '—'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/temas/${tema.slug}`} className="btn btn-primary">
            Retomar a teoria
          </Link>
          <Link href="/questoes" className="btn">
            Ir às questões
          </Link>
        </div>
      </div>
    </section>
  );
}
