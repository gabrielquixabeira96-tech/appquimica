import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import katex from 'katex';
import {
  formatarData,
  getCurriculo,
  getQuestoesDoTema,
  getTeoria,
  getTema,
  getTodosTemas,
  getVizinhos,
} from '@/lib/conteudo';
import { decorar } from '@/lib/decoracao';
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

  // A ala a que este tema pertence — dá o algarismo romano da migalha.
  const indiceAla = getCurriculo().eixos.findIndex((e) => e.slug === tema.eixo.slug);
  const { roman } = decorar(Math.max(0, indiceAla));

  const atualizado = formatarData(frontmatter.atualizado);
  // O corpo MDX pode trazer o próprio <Objetivos>; nesse caso o cartão do
  // frontmatter seria a mesma lista duas vezes na mesma tela.
  const objetivosNoCorpo = mdx.includes('<Objetivos');

  return (
    <main className="mx-auto flex max-w-[1160px] flex-wrap gap-10 px-4 py-12 sm:px-6">
      <article className="min-w-0 flex-[2_1_460px]">
        <div className="kick">
          <Link href="/trilha" className="text-inherit no-underline hover:text-ivoryBright">
            Trilha
          </Link>{' '}
          / Ala {roman} · {tema.eixo.titulo}
        </div>

        <h1 className="mb-1 mt-2 font-display text-[clamp(44px,5.4vw,62px)] font-normal leading-[1.05] text-ivory">
          {frontmatter.titulo ?? tema.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-[13px] text-[rgb(var(--c-n400))] tnum">
            {atualizado && `Atualizado em ${atualizado} · `}
            {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'} no banco
          </div>
          <div className="ml-auto">
            <MarcarConcluido slug={slug} />
          </div>
        </div>

        <p className="mt-4 max-w-[62ch] leading-[1.65] text-[rgb(var(--c-n300))]">{tema.resumo}</p>

        {tema.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tema.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}

        {frontmatter.objetivos?.length && !objetivosNoCorpo ? (
          <div className="card my-8 p-5">
            <div className="kick">Objetivos</div>
            <ul className="mt-2 list-disc pl-5 leading-[1.7] text-[rgb(var(--c-n200))]">
              {frontmatter.objetivos.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section id="teoria">
          {existe ? (
            // .capitular põe a letra gravada na abertura, como num livro.
            <div className="prosa capitular">
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
            <div className="card p-7">
              <p className="kick mb-2">Teoria ainda não publicada</p>
              <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
                Crie o arquivo <code className="font-mono">content/temas/{slug}.mdx</code> (ou rode{' '}
                <code className="font-mono">npm run novo:tema {slug}</code>) e o conteúdo aparece aqui automaticamente.
                Enquanto isso, o assistente já responde dúvidas deste tema.
              </p>
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          {questoes.length > 0 && (
            <a href="#questoes" className="btn btn-primary">
              Praticar as questões do tema
            </a>
          )}
          <Link href="/assistente" className="btn">
            Perguntar ao assistente
          </Link>
        </div>

        {questoes.length > 0 && (
          <section id="questoes" className="mt-14 scroll-mt-24">
            <div className="mb-6 flex items-baseline gap-5">
              <h2 className="font-display text-[clamp(28px,3.4vw,36px)] font-semibold text-ivory">
                Questões deste tema
              </h2>
              <span className="hrl flex-1" />
              <span className="shrink-0 text-[13px] text-[rgb(var(--c-n400))] tnum">{questoes.length}</span>
            </div>
            <QuestoesDoTema questoes={questoes} tema={{ titulo: tema.titulo, slug }} />
          </section>
        )}

        <nav
          className="mt-14 flex flex-col gap-3 border-t pt-7 sm:flex-row sm:justify-between"
          style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.2)' }}
        >
          {anterior ? (
            <Link href={`/temas/${anterior.slug}`} className="btn">
              ← {anterior.titulo}
            </Link>
          ) : (
            <span />
          )}
          {proximo && (
            <Link href={`/temas/${proximo.slug}`} className="btn btn-primary">
              {proximo.titulo} →
            </Link>
          )}
        </nav>
      </article>

      <aside className="min-w-0 flex-[1_1_280px] space-y-5 lg:sticky lg:top-24 lg:self-start">
        <figure className="plated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templo/hercules.jpg" alt="Estátua de Hércules junto à coluna" />
        </figure>

        {frontmatter.formulas?.length ? (
          <div className="card p-5">
            <div className="kick">Fórmulas do tema</div>
            {frontmatter.formulas.map((f) => (
              <div
                key={f.nome}
                className="border-b py-3.5 last:border-b-0 last:pb-0"
                style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.12)' }}
              >
                <div
                  className="overflow-x-auto font-display text-[20px] italic text-ivory"
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(f.latex, { throwOnError: false, output: 'html' }),
                  }}
                />
                <div className="mt-1 text-[13px] text-[rgb(var(--c-n400))]">{f.quando ?? f.nome}</div>
              </div>
            ))}
          </div>
        ) : null}

        {frontmatter.pegadinhas?.length ? (
          <div className="card p-5">
            <div className="kick">Pegadinhas</div>
            <ul className="mt-2 list-disc pl-5 text-[15px] leading-[1.7] text-[rgb(var(--c-n200))]">
              {frontmatter.pegadinhas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {frontmatter.flashcards?.length
          ? frontmatter.flashcards.map((f) => <Flashcard key={f.frente} frente={f.frente} verso={f.verso} />)
          : null}

        {frontmatter.videos?.length ? (
          <div className="card p-5">
            <div className="kick">Videoaulas</div>
            <div className="mt-2 flex flex-col gap-2 text-[15px]">
              {frontmatter.videos.map((v) => (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ivory underline decoration-1 underline-offset-4 hover:text-ivoryBright"
                >
                  {v.titulo}
                  {(v.fonte || v.duracao) && (
                    <span className="block text-[13px] text-[rgb(var(--c-n400))] no-underline">
                      {[v.fonte, v.duracao].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {frontmatter.materiais?.length ? (
          <div className="card p-5">
            <div className="kick">Materiais</div>
            <div className="mt-2 flex flex-col gap-2 text-[15px]">
              {frontmatter.materiais.map((m) => (
                <a
                  key={m.arquivo}
                  href={m.arquivo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ivory underline decoration-1 underline-offset-4 hover:text-ivoryBright"
                >
                  {m.titulo}
                  {m.tipo && (
                    <span className="block text-[13px] text-[rgb(var(--c-n400))] no-underline">{m.tipo}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </main>
  );
}
