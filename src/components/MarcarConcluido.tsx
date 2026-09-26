'use client';

import { Check, Circle } from 'lucide-react';
import clsx from 'clsx';
import { useProgresso } from '@/lib/progresso';

export default function MarcarConcluido({ slug }: { slug: string }) {
  const { progresso, alternarTema, pronto } = useProgresso();
  const feito = progresso.temasConcluidos.includes(slug);
  if (!pronto) return <span className="btn opacity-0">carregando</span>;

  return (
    <button onClick={() => alternarTema(slug)} className={clsx('btn no-print', feito && 'btn-primary')}>
      {feito ? <Check size={16} /> : <Circle size={14} />}
      {feito ? 'Tema concluído' : 'Marcar como concluído'}
    </button>
  );
}
