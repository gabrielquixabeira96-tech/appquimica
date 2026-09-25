import type { Metadata } from 'next';
import { getCurriculo, getQuestoes, getTeoria } from '@/lib/conteudo';
import { decorar, numeral } from '@/lib/decoracao';
import TrilhaCliente, { type AlaCompleta } from '@/components/TrilhaCliente';

export const metadata: Metadata = {
  title: 'Trilha de conteúdos',
  description: 'Todos os temas de Química para ENEM e vestibulares na ordem recomendada de estudo.',
};

export default function TrilhaPage() {
  const curriculo = getCurriculo();
  const questoes = getQuestoes();
  const totalTemas = curriculo.eixos.reduce((s, e) => s + e.temas.length, 0);

  const alas: AlaCompleta[] = curriculo.eixos.map((eixo, i) => {
    const { roman } = decorar(i);
    return {
      slug: eixo.slug,
      titulo: eixo.titulo,
      descricao: eixo.descricao,
      roman,
      num: numeral(i),
      temas: eixo.temas.map((tema) => ({
        slug: tema.slug,
        titulo: tema.titulo,
        prioridade: tema.prioridade,
        questoes: questoes.filter((q) => q.tema === tema.slug).length,
        temTeoria: getTeoria(tema.slug).existe,
      })),
    };
  });

  return (
    <>
      {/* o pórtico: a colunata iluminada sobre o gradiente */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="kb absolute inset-0 h-full w-full object-cover"
          src="/templo/colunata.jpg"
          alt="Colunata luminosa de mármore"
          style={{ opacity: 0.5, filter: 'sepia(0.15)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgb(var(--c-bg) / 0.45), rgb(var(--c-bg) / 0.95))' }}
        />
        <div className="relative mx-auto max-w-[980px] px-4 py-16 sm:px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ivoryWarm">
            Cinco alas · {totalTemas} temas
          </div>
          <h1 className="my-2 font-display text-[clamp(44px,6vw,76px)] font-normal text-ivory">A trilha</h1>
          <p className="max-w-[60ch] leading-[1.6] text-[rgb(var(--c-n200))]">
            Marque um tema como concluído na caixa; o nome abre a teoria. As alas se iluminam conforme você avança.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[980px] px-4 pb-14 pt-6 sm:px-6">
        <TrilhaCliente alas={alas} />
      </main>
    </>
  );
}
