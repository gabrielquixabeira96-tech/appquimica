import Link from 'next/link';
import { getCurriculo, getQuestoes } from '@/lib/conteudo';
import { decorar, numeral } from '@/lib/decoracao';
import FaixaEstatisticas from '@/components/templo/FaixaEstatisticas';
import AlasGrade, { type AlaResumo } from '@/components/templo/AlasGrade';
import { BotaoRetomar, SecaoRetomar, type TemaRetomavel } from '@/components/templo/Retomar';

export default function Home() {
  const curriculo = getCurriculo();
  const questoes = getQuestoes();
  const totalTemas = curriculo.eixos.reduce((s, e) => s + e.temas.length, 0);

  const alas: AlaResumo[] = curriculo.eixos.map((eixo, i) => {
    const { simbolo, imagem } = decorar(i);
    return {
      slug: eixo.slug,
      titulo: eixo.titulo,
      num: numeral(i),
      simbolo,
      imagem,
      temas: eixo.temas.map((t) => t.slug),
    };
  });

  const temas: TemaRetomavel[] = curriculo.eixos.flatMap((eixo) =>
    eixo.temas.map((t) => ({
      slug: t.slug,
      titulo: t.titulo,
      resumo: t.resumo,
      questoes: questoes.filter((q) => q.tema === t.slug).length,
      ala: eixo.titulo,
    })),
  );

  return (
    <>
      {/* ───────────────────────── o herói ───────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="kb absolute inset-0 h-full w-full object-cover"
          src="/templo/hero-nike.jpg"
          alt="Vitória alada sob teto de afrescos"
          style={{ filter: 'sepia(0.12) brightness(0.9)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(var(--c-bg) / 0.62) 0%, rgb(var(--c-bg) / 0.28) 42%, rgb(var(--c-bg) / 0.92) 100%)',
          }}
        />

        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="rise flex items-center gap-5">
            <span className="h-px w-14 bg-[rgb(var(--c-ivory-warm))]" />
            <span className="text-xs uppercase tracking-[0.34em] text-ivoryWarm">Plataforma de Química</span>
            <span className="h-px w-14 bg-[rgb(var(--c-ivory-bright))]" />
          </div>

          <h1
            className="rise my-5 max-w-[12ch] font-display text-[clamp(54px,9vw,118px)] font-normal leading-[1.02] text-ivory"
            style={{ animationDelay: '0.15s' }}
          >
            O templo da química.
          </h1>

          <p
            className="rise mb-10 max-w-[52ch] text-[clamp(17px,2vw,21px)] italic leading-[1.6] text-[rgb(var(--c-n200))]"
            style={{ animationDelay: '0.3s' }}
          >
            Do átomo ao ENEM: uma trilha em cinco alas, {questoes.length} questões comentadas, simulado contra o relógio e
            um assistente que estuda os seus próprios materiais.
          </p>

          <div
            className="rise flex flex-wrap justify-center gap-4"
            style={{ animationDelay: '0.45s' }}
          >
            <BotaoRetomar temas={temas} />
            <Link href="/trilha" className="btn">
              Percorrer a trilha
            </Link>
          </div>
        </div>

        <FaixaEstatisticas totalTemas={totalTemas} />
      </section>

      {/* ───────────────────────── as alas ───────────────────────── */}
      <main className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6">
        <div className="mb-7 mt-4 flex items-baseline gap-5">
          <h2 className="font-display text-[clamp(30px,4vw,42px)] font-semibold text-ivory">As cinco alas</h2>
          <span className="hrl flex-1" />
          <Link
            href="/trilha"
            className="shrink-0 border-b border-[rgb(var(--c-n300))] text-[13px] uppercase tracking-[0.12em] text-ivory no-underline hover:text-ivoryBright"
          >
            Ver a trilha
          </Link>
        </div>

        <AlasGrade alas={alas} />
      </main>

      {/* ─────────────────── a faixa de mármore ─────────────────── */}
      <div className="strip" style={{ backgroundImage: "url('/templo/espelho.jpg')" }}>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgb(var(--c-surface) / 0.66)' }}
        >
          <span className="px-6 text-center text-[13px] uppercase tracking-[0.5em] text-ivory">
            Avla · Acervo · Prova · Assistente
          </span>
        </div>
      </div>

      {/* ──────────────── continue de onde parou ──────────────── */}
      <main className="mx-auto max-w-[1160px] px-4 py-14 sm:px-6">
        <SecaoRetomar temas={temas} />
      </main>

      {/* ───────────────────── o colofão ───────────────────── */}
      <section
        className="relative overflow-hidden border-t bg-surface"
        style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.25)' }}
      >
        <div className="ghost -bottom-24 -right-10 text-[340px]">Qm</div>
        <div className="relative mx-auto max-w-[900px] px-6 py-20 text-center">
          <div className="text-[22px] text-[rgb(var(--c-n300))]">✳</div>
          <p className="my-5 font-display text-[clamp(26px,3.4vw,38px)] font-normal italic leading-[1.3] text-ivory">
            “A química é a arquitetura invisível de tudo o que existe — quem a lê, lê o mundo.”
          </p>
          <p className="mb-7 text-xs uppercase tracking-[0.26em] text-[rgb(var(--c-n400))]">
            Pronto para medir o que já domina?
          </p>
          <Link href="/simulado" className="btn btn-primary">
            Iniciar um simulado
          </Link>
        </div>
      </section>
    </>
  );
}
