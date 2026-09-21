'use client';

import clsx from 'clsx';
import { useProgresso } from '@/lib/progresso';

export default function MarcarConcluido({ slug }: { slug: string }) {
  const { progresso, alternarTema, pronto } = useProgresso();
  const feito = progresso.temasConcluidos.includes(slug);

  // Reserva o espaço antes da hidratação para o cabeçalho não saltar.
  if (!pronto) return <span className="btn btn-sm invisible">Marcar como concluído</span>;

  return (
    <button onClick={() => alternarTema(slug)} className={clsx('btn btn-sm no-print', feito && 'btn-primary')}>
      {feito ? '✓ Tema concluído' : 'Marcar como concluído'}
    </button>
  );
}
