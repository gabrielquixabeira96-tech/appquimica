import type { Metadata } from 'next';
import ForjaEmbed from '@/components/ForjaEmbed';

export const metadata: Metadata = {
  title: 'Forja',
  description:
    'Cada questão de Química do ENEM de 2020 a 2025 transformada em máquina de decisão: toque num dado sublinhado do enunciado e o gabarito e o comentário se reescrevem. Tabela periódica, ponte do mol, simulador de equilíbrio, escala de pH e balanceador na própria página.',
};

export default function ForjaPage() {
  return <ForjaEmbed />;
}
