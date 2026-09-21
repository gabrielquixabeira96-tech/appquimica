import type { Metadata } from 'next';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import SimuladoCliente from '@/components/SimuladoCliente';

export const metadata: Metadata = {
  title: 'Simulado',
  description: 'Monte um simulado cronometrado de Química e receba um relatório de desempenho por tema.',
};

export default function SimuladoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SimuladoCliente questoes={getQuestoes()} curriculo={getCurriculo()} />
    </div>
  );
}
