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
    <main className="relative mx-auto max-w-[860px] overflow-hidden px-4 py-12 sm:px-6">
      <div className="ghost -right-5 top-2 text-[180px]">?</div>

      <div className="kick">Acervo</div>
      <h1 className="my-1 font-display text-[clamp(40px,5vw,56px)] font-normal text-ivory">Banco de questões</h1>
      <p className="mb-7 text-[rgb(var(--c-n400))]">
        {questoes.length} questões catalogadas por tema. Responda e receba o comentário na hora — a estrela guarda a
        questão na sua lista de revisão.
      </p>

      <figure className="plated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/templo/patio.jpg"
          alt="Pátio com fonte e estátuas"
          className="h-[180px] object-cover"
          style={{ objectPosition: 'center 60%' }}
        />
      </figure>

      <BancoQuestoes questoes={questoes} curriculo={curriculo} />
    </main>
  );
}
