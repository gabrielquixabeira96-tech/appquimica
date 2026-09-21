'use client';

import Link from 'next/link';
import { Flame, Target, TrendingUp } from 'lucide-react';
import { useProgresso } from '@/lib/progresso';
import type { Curriculo } from '@/lib/tipos';

export default function PainelProgresso({ curriculo, totalQuestoes }: { curriculo: Curriculo; totalQuestoes: number }) {
  const { progresso, total, acertos, aproveitamento, pronto } = useProgresso();
  const totalTemas = curriculo.eixos.reduce((s, e) => s + e.temas.length, 0);
  const concluidos = progresso.temasConcluidos.length;
  const pctTemas = totalTemas ? Math.round((concluidos / totalTemas) * 100) : 0;

  const fracos = curriculo.eixos
    .flatMap((e) => e.temas)
    .map((t) => {
      const rs = progresso.respostas.filter((r) => r.tema === t.slug);
      return { t, total: rs.length, acertos: rs.filter((r) => r.correta).length };
    })
    .filter((x) => x.total >= 2)
    .map((x) => ({ ...x, pct: Math.round((x.acertos / x.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  return (
    <div className="card p-6">
      <p className="label mb-4">Seu painel</p>

      {!pronto ? (
        <div className="h-40 animate-pulse rounded-xl bg-surface2" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Metrica Icone={Target} valor={`${pctTemas}%`} rotulo={`${concluidos}/${totalTemas} temas`} />
            <Metrica Icone={TrendingUp} valor={total ? `${aproveitamento}%` : '—'} rotulo={`${acertos}/${total} questões`} />
            <Metrica Icone={Flame} valor={String(progresso.ofensiva.dias)} rotulo="dias seguidos" />
          </div>

          <div className="mt-5">
            <div className="barra" role="progressbar" aria-valuenow={pctTemas} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso de temas concluídos">
              <span style={{ width: `${pctTemas}%` }} />
            </div>
          </div>

          {fracos.length > 0 ? (
            <div className="mt-5 space-y-2">
              <p className="label">Onde focar agora</p>
              {fracos.map(({ t, pct, acertos: a, total: tt }) => (
                <Link key={t.slug} href={`/temas/${t.slug}`} className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm transition-colors hover:border-brand/35 hover:bg-brand/5 hover:text-brand">
                  <span>{t.titulo}</span>
                  <span className="font-mono text-xs text-muted">
                    {a}/{tt} · {pct}%
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Responda algumas questões e este painel passa a mostrar seus pontos fracos por tema.{' '}
              {totalQuestoes > 0 && (
                <Link href="/questoes" className="text-brand underline">
                  Começar agora
                </Link>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Metrica({ Icone, valor, rotulo }: { Icone: React.ElementType; valor: string; rotulo: string }) {
  return (
    <div>
      <Icone size={16} className="mb-1.5 text-brand" />
      <p className="font-display text-2xl font-semibold tracking-[.02em] leading-none">{valor}</p>
      <p className="mt-1 text-xs text-muted">{rotulo}</p>
    </div>
  );
}
