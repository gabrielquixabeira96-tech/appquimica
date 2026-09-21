'use client';

import Link from 'next/link';
import { useProgresso } from '@/lib/progresso';

export interface AlaResumo {
  slug: string;
  titulo: string;
  num: string;
  simbolo: string;
  imagem: string;
  temas: string[];
}

/**
 * As cinco alas como azulejos de tabela periódica: símbolo gravado grande,
 * a fotografia de mármore acendendo por trás no hover e o trilho de progresso
 * do aluno no pé.
 */
export default function AlasGrade({ alas }: { alas: AlaResumo[] }) {
  const { progresso, pronto } = useProgresso();

  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {alas.map((ala) => {
        const feitos = ala.temas.filter((s) => progresso.temasConcluidos.includes(s)).length;
        const pct = ala.temas.length ? Math.round((feitos / ala.temas.length) * 100) : 0;

        return (
          <Link key={ala.slug} href={`/trilha#${ala.slug}`} className="tile group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tili" src={ala.imagem} alt="" aria-hidden />

            <div className="relative flex justify-between text-xs text-[rgb(var(--c-n300))] tnum">
              <span>{ala.num}</span>
              <span>
                {pronto ? feitos : 0}/{ala.temas.length}
              </span>
            </div>

            <div className="relative mb-1 mt-5 font-display text-[54px] font-medium leading-[1.15] text-ivoryWarm">
              {ala.simbolo}
            </div>

            <div className="relative min-h-[38px] text-sm leading-[1.35] text-ivory">{ala.titulo}</div>

            <div className="trk mt-4">
              <span className="barra" style={{ width: `${pronto ? pct : 0}%` }} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
