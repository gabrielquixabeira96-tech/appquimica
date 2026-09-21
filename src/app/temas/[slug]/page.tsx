import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import katex from 'katex';
import { ArrowLeft, ArrowRight, Download, PlayCircle, Sigma, AlertTriangle } from 'lucide-react';
import { getQuestoesDoTema, getTeoria, getTema, getTodosTemas, getVizinhos } from '@/lib/conteudo';
import { componentesMdx } from '@/components/mdx';
import { Flashcard } from '@/components/ComponentesMdx';
import QuestoesDoTema from '@/components/QuestoesDoTema';
import MarcarConcluido from '@/components/MarcarConcluido';

export function generateStaticParams() {
  return getTodosTemas().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tema = getTema(slug);
  if (!tema) return { title: 'Tema não encontrado' };
  return { title: tema.titulo, description: tema.resumo };
}

export default async function TemaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tema = getTema(slug);
  if (!tema) notFound();

  const { frontmatter, mdx, existe } = getTeoria(slug);
  const questoes = getQuestoesDoTema(slug);
  const { anterior, proximo } = getVizinhos(slug);

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* cabeçalho */}
      <header className="mb-8 surgir">
        <nav className="label mb-3 flex items-center gap-2">
          <Link href="/trilha" className="hover:text-ink">
            Trilha
          </Link>
          <span>/</span>
          <span style={{ color: tema.eixo.cor }}>{tema.eixo.titulo}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="titulo-pagina">
              <span className="mr-3 font-mono text-xl text-muted">{tema.id}</span>
              {frontmatter.titulo ?? tema.titulo}
            </h1>
            <hr className="regra-ouro my-5" />
            <p className="mt-2 max-w-2xl text-muted">{tema.resumo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tema.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <MarcarConcluido slug={slug} />
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        {/* conteúdo */}
        <div className="min-w-0 space-y-12">
          <section id="teoria">
            {existe ? (
              <div className="prosa">
                <MDXRemote
                  source={mdx}
                  components={componentesMdx}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm, remarkMath],
                      rehypePlugins: [rehypeKatex, rehypeSlug],
                    },
                  }}
                />
              </div>
            ) : (
              <div className="card p-8">
                <p className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
                  <AlertTriangle size={18} className="text-warn" /> Teoria ainda não publicada
                </p>
                <p className="text-sm text-muted">
                  Crie o arquivo <code className="font-mono">content/temas/{slug}.mdx</code> (ou rode{' '}
                  <code className="font-mono">npm run novo:tema {slug}</code>) e o conteúdo aparece aqui automaticamente.
                  Enquanto isso, o assistente já responde dúvidas deste tema.
                </p>
              </div>
            )}
          </section>

          {questoes.length > 0 && (
            <section id="questoes" className="scroll-mt-24">
              <h2 className="titulo-secao mb-1 text-2xl">Questões deste tema</h2>
              <p className="mb-5 text-sm text-muted">{questoes.length} questões · responda e veja o gabarito comentado.</p>
              <QuestoesDoTema questoes={questoes} tema={{ titulo: tema.titulo, slug }} />
            </section>
          )}

          {/* navegação */}
          <nav className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
            {anterior ? (
              <Link href={`/temas/${anterior.slug}`} className="btn">
                <ArrowLeft size={16} /> {anterior.titulo}
              </Link>
            ) : (
              <span />
            )}
            {proximo && (
              <Link href={`/temas/${proximo.slug}`} className="btn btn-primary">
                {proximo.titulo} <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </div>

        {/* lateral */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {frontmatter.objetivos?.length ? (
            <Bloco titulo="Você vai conseguir">
              <ul className="space-y-1.5 text-sm">
                {frontmatter.objetivos.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="text-brand">→</span> {o}
                  </li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {frontmatter.formulas?.length ? (
            <Bloco titulo="Fórmulas do tema" Icone={Sigma}>
              <ul className="space-y-3">
                {frontmatter.formulas.map((f) => (
                  <li key={f.nome}>
                    <p className="text-xs font-medium">{f.nome}</p>
                    <div
                      className="my-1 overflow-x-auto text-sm"
                      dangerouslySetInnerHTML={{
                        __html: katex.renderToString(f.latex, { throwOnError: false, output: 'html' }),
                      }}
                    />
                    {f.quando && <p className="text-xs text-muted">{f.quando}</p>}
                  </li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {frontmatter.pegadinhas?.length ? (
            <Bloco titulo="Pegadinhas clássicas" Icone={AlertTriangle}>
              <ul className="space-y-2 text-sm text-muted">
                {frontmatter.pegadinhas.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {frontmatter.videos?.length ? (
            <Bloco titulo="Videoaulas" Icone={PlayCircle}>
              <ul className="space-y-2 text-sm">
                {frontmatter.videos.map((v) => (
                  <li key={v.url}>
                    <a href={v.url} target="_blank" rel="noreferrer" className="hover:text-brand">
                      {v.titulo}
                    </a>
                    <span className="block text-xs text-muted">
                      {[v.fonte, v.duracao].filter(Boolean).join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {frontmatter.materiais?.length ? (
            <Bloco titulo="Materiais" Icone={Download}>
              <ul className="space-y-2 text-sm">
                {frontmatter.materiais.map((m) => (
                  <li key={m.arquivo}>
                    <a href={m.arquivo} target="_blank" rel="noreferrer" className="hover:text-brand">
                      {m.titulo}
                    </a>
                    {m.tipo && <span className="block text-xs text-muted">{m.tipo}</span>}
                  </li>
                ))}
              </ul>
            </Bloco>
          ) : null}

          {frontmatter.flashcards?.length ? (
            <Bloco titulo="Flashcards">
              <div className="space-y-2">
                {frontmatter.flashcards.map((f) => (
                  <Flashcard key={f.frente} frente={f.frente} verso={f.verso} />
                ))}
              </div>
            </Bloco>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function Bloco({ titulo, Icone, children }: { titulo: string; Icone?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="label mb-3 flex items-center gap-1.5">
        {Icone && <Icone size={12} />} {titulo}
      </p>
      {children}
    </div>
  );
}
