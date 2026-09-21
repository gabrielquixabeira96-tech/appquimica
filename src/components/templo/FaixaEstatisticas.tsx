'use client';

import { useProgresso } from '@/lib/progresso';

/**
 * A faixa de vidro no pé do herói: ofensiva, temas concluídos e aproveitamento.
 * Antes da hidratação mostra travessões, para o herói não saltar de altura.
 */
export default function FaixaEstatisticas({ totalTemas }: { totalTemas: number }) {
  const { progresso, total, aproveitamento, pronto } = useProgresso();

  const celulas = [
    { valor: pronto ? String(progresso.ofensiva.dias) : '—', rotulo: 'dias de ofensiva' },
    {
      valor: pronto ? `${progresso.temasConcluidos.length} / ${totalTemas}` : `— / ${totalTemas}`,
      rotulo: 'temas concluídos',
    },
    { valor: pronto && total ? `${aproveitamento}%` : '—', rotulo: 'acertos no banco' },
  ];

  return (
    <div
      className="relative grid border-t backdrop-blur-[6px]"
      style={{
        borderTopColor: 'rgb(var(--c-ivory) / 0.4)',
        background: 'rgb(var(--c-surface) / 0.55)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      }}
    >
      {celulas.map(({ valor, rotulo }, i) => (
        <div
          key={rotulo}
          className="px-6 py-5 text-center"
          style={
            i < celulas.length - 1
              ? { borderRight: '1px solid rgb(var(--c-ivory) / 0.25)' }
              : undefined
          }
        >
          <div className="font-display text-[40px] leading-[1.1] text-ivoryWarm tnum">{valor}</div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--c-n300))]">{rotulo}</div>
        </div>
      ))}
    </div>
  );
}
