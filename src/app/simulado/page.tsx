import type { Metadata } from 'next';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import SimuladoCliente from '@/components/SimuladoCliente';

export const metadata: Metadata = {
  title: 'Simulado',
  description: 'Monte um simulado cronometrado de Química e receba um relatório de desempenho por tema.',
};

export default function SimuladoPage() {
  // O componente traz a própria moldura: cada fase do simulado tem a sua.
  return <SimuladoCliente questoes={getQuestoes()} curriculo={getCurriculo()} />;
}
