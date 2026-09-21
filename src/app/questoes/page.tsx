import type { Metadata } from 'next';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import BancoQuestoes from '@/components/BancoQuestoes';

export const metadata: Metadata = {
  title: 'Banco de questões',
  description: 'Questões de Química de ENEM e vestibulares com filtros por tema, ano e gabarito comentado.',
};

export default function QuestoesPage() {
  const questoes = getQuestoes();
  const curriculo = getCurriculo();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 surgir">
        <h1 className="titulo-pagina">Banco de questões</h1>
        <hr className="regra-ouro my-5" />
        <p className="mt-2 max-w-2xl text-muted">
          {questoes.length} questões catalogadas por tema. Responda para ver o gabarito comentado — o que você errar vira
          lista de revisão automaticamente.
        </p>
      </header>
      <BancoQuestoes questoes={questoes} curriculo={curriculo} />
    </div>
  );
}
