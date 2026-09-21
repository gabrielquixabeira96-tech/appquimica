import Link from 'next/link';
import { ArrowRight, Bot, ListChecks, Timer, BookOpen } from 'lucide-react';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import CartaoEixo from '@/components/CartaoEixo';
import AtlasScroll from '@/components/AtlasScroll';

export default function Home() {
  const curriculo = getCurriculo();
  const questoes = getQuestoes();
  return (
    <>
      <AtlasScroll />

      {/* atalhos */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {[
          { href: '/trilha', Icone: BookOpen, titulo: 'Trilha de conteúdos', texto: 'Os 5 eixos na ordem certa de estudo, com o que já concluiu.' },
          { href: '/questoes', Icone: ListChecks, titulo: 'Banco de questões', texto: 'Filtre por tema, ano e dificuldade. Erros viram lista de revisão.' },
          { href: '/simulado', Icone: Timer, titulo: 'Simulado cronometrado', texto: 'Monte uma prova do tamanho que quiser e receba o relatório.' },
          { href: '/assistente', Icone: Bot, titulo: 'Assistente de química', texto: 'Explica, corrige e puxa exemplos dos materiais do curso.' },
        ].map(({ href, Icone, titulo, texto }) => (
          <Link key={href} href={href} className="card group p-5 transition-colors hover:border-brand">
            <Icone size={20} className="mb-3 text-brand" />
            <p className="mb-1 font-display text-base font-bold">{titulo}</p>
            <p className="text-sm text-muted">{texto}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand opacity-0 transition-opacity group-hover:opacity-100">
              abrir <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>

      {/* eixos */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="mb-1 font-display text-2xl font-bold">Os cinco eixos do curso</h2>
        <p className="mb-6 text-muted">Clique em um eixo para ver seus temas.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {curriculo.eixos.map((eixo) => (
            <CartaoEixo key={eixo.slug} eixo={eixo} questoes={questoes} />
          ))}
        </div>
      </section>
    </>
  );
}
