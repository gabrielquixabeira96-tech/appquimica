import Link from 'next/link';
import { ArrowRight, Bot, ListChecks, Timer, BookOpen } from 'lucide-react';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import PainelProgresso from '@/components/PainelProgresso';
import CartaoEixo from '@/components/CartaoEixo';

export default function Home() {
  const curriculo = getCurriculo();
  const questoes = getQuestoes();
  const totalTemas = curriculo.eixos.reduce((s, e) => s + e.temas.length, 0);

  return (
    <>
      {/* hero */}
      <section className="border-b border-line bg-surface/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="space-y-6">
            <span className="chip">
              {totalTemas} temas · {questoes.length} questões · assistente de IA
            </span>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Química do jeito que a prova cobra —<br />
              <span className="text-brand">organizada do zero ao gabarito.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Cada tema tem teoria progressiva, fórmulas comentadas, vídeos, materiais para baixar, flashcards e as questões
              reais que já caíram. Travou? O assistente responde lendo os próprios materiais do curso.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/trilha" className="btn btn-primary">
                Começar pela trilha <ArrowRight size={16} />
              </Link>
              <Link href="/questoes" className="btn">
                Ir direto às questões
              </Link>
            </div>
          </div>

          <PainelProgresso curriculo={curriculo} totalQuestoes={questoes.length} />
        </div>
      </section>

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
