import type { Metadata } from 'next';
import { getCurriculo, getQuestoes, getTeoria } from '@/lib/conteudo';
import TrilhaCliente from '@/components/TrilhaCliente';

export const metadata: Metadata = {
  title: 'Trilha de conteúdos',
  description: 'Todos os temas de Química para ENEM e vestibulares na ordem recomendada de estudo.',
};

export default function TrilhaPage() {
  const curriculo = getCurriculo();
  const questoes = getQuestoes();

  const dados = curriculo.eixos.map((eixo) => ({
    ...eixo,
    temas: eixo.temas.map((tema) => ({
      ...tema,
      questoes: questoes.filter((q) => q.tema === tema.slug).length,
      temTeoria: getTeoria(tema.slug).existe,
    })),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 surgir">
        <h1 className="titulo-pagina">Trilha de conteúdos</h1>
        <hr className="regra-ouro my-5" />
        <p className="mt-2 max-w-2xl text-muted">
          A ordem abaixo é a recomendada: cada eixo usa o anterior. Marque o tema como concluído quando terminar a teoria
          <em> e </em> acertar pelo menos 70% das questões dele.
        </p>
      </header>
      <TrilhaCliente eixos={dados} />
    </div>
  );
}
