'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import QuestaoCard from './QuestaoCard';
import { useProgresso } from '@/lib/progresso';
import { renderizarMarkdown } from '@/lib/markdown';
import type { Curriculo, Letra, Questao } from '@/lib/tipos';

type Fase = 'config' | 'prova' | 'relatorio';

const QUANTIDADES = [5, 10, 15, 20, 30];
const DURACOES = [10, 15, 20, 30, 45, 60];

export default function SimuladoCliente({ questoes, curriculo }: { questoes: Questao[]; curriculo: Curriculo }) {
  const { registrarResposta } = useProgresso();
  const [fase, setFase] = useState<Fase>('config');
  const [quantidade, setQuantidade] = useState(10);
  const [eixo, setEixo] = useState('');
  const [minutos, setMinutos] = useState(20);
  const [sorteadas, setSorteadas] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [marcadas, setMarcadas] = useState<Record<string, Letra>>({});
  const [restante, setRestante] = useState(0);

  const mapaTemas = useMemo(() => {
    const m = new Map<string, { titulo: string; eixo: string }>();
    curriculo.eixos.forEach((e) => e.temas.forEach((t) => m.set(t.slug, { titulo: t.titulo, eixo: e.slug })));
    return m;
  }, [curriculo]);

  const disponiveis = useMemo(
    () => (eixo ? questoes.filter((q) => mapaTemas.get(q.tema)?.eixo === eixo) : questoes),
    [questoes, eixo, mapaTemas],
  );

  // Enquanto a prova corre, o documento entra em modo foco e o assistente
  // flutuante some — é o "sem distrações na tela" prometido na antessala.
  useEffect(() => {
    document.documentElement.classList.toggle('modo-foco', fase === 'prova');
    return () => document.documentElement.classList.remove('modo-foco');
  }, [fase]);

  useEffect(() => {
    if (fase !== 'prova') return;
    const t = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          clearInterval(t);
          setFase('relatorio');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [fase]);

  const quantidadeEfetiva = Math.min(quantidade, disponiveis.length);

  function iniciar() {
    setSorteadas([...disponiveis].sort(() => Math.random() - 0.5).slice(0, quantidadeEfetiva));
    setMarcadas({});
    setIndice(0);
    setRestante(minutos * 60);
    setFase('prova');
    window.scrollTo(0, 0);
  }

  function finalizar() {
    sorteadas.forEach((q) => {
      const letra = marcadas[q.id];
      if (letra)
        registrarResposta({ questaoId: q.id, tema: q.tema, marcada: letra, correta: letra === q.gabarito, em: Date.now() });
    });
    setFase('relatorio');
    window.scrollTo(0, 0);
  }

  /* ─────────────────────────── a antessala ─────────────────────────── */
  if (fase === 'config') {
    return (
      <main className="mx-auto max-w-[1060px] px-4 py-12 sm:px-6">
        <div className="grid items-center gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div>
            <div className="kick">A prova</div>
            <h1 className="my-1 font-display text-[clamp(40px,5vw,56px)] font-normal text-ivory">
              Simulado cronometrado
            </h1>

            {questoes.length === 0 ? (
              <div className="card mt-6 p-8 text-[15px] text-[rgb(var(--c-n400))]">
                O banco ainda está vazio. Adicione questões em <code className="font-mono">content/questoes/</code> para
                liberar o simulado.
              </div>
            ) : (
              <>
                <p className="mb-7 mt-3 text-justify leading-[1.65] text-[rgb(var(--c-n200))]">
                  Questões sorteadas do banco, contra o relógio, em modo foco — sem distrações na tela. Ao final, o
                  relatório mostra os acertos por tema para orientar a revisão.
                </p>

                <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[rgb(var(--c-n400))]">Ala</div>
                <select
                  value={eixo}
                  onChange={(e) => setEixo(e.target.value)}
                  aria-label="Ala do simulado"
                  className="input mb-6"
                >
                  <option value="">Todas as alas ({questoes.length} questões)</option>
                  {curriculo.eixos.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.titulo}
                    </option>
                  ))}
                </select>

                <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[rgb(var(--c-n400))]">Questões</div>
                <div className="mb-6 flex flex-wrap">
                  {QUANTIDADES.filter((n, i) => n <= disponiveis.length || i === 0).map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuantidade(n)}
                      className={clsx('seg-b', quantidade === n && 'seg-on')}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[rgb(var(--c-n400))]">Duração</div>
                <div className="mb-6 flex flex-wrap">
                  {DURACOES.map((m) => (
                    <button key={m} onClick={() => setMinutos(m)} className={clsx('seg-b', minutos === m && 'seg-on')}>
                      {m} min
                    </button>
                  ))}
                </div>

                <p className="mb-7 text-[13px] text-[rgb(var(--c-n400))] tnum">
                  Ritmo do ENEM: ~3 min por questão. Com {quantidadeEfetiva} questões em {minutos} min você terá{' '}
                  {(minutos / Math.max(1, quantidadeEfetiva)).toFixed(1)} min por questão.
                </p>

                <button onClick={iniciar} disabled={!disponiveis.length} className="btn btn-primary">
                  Entrar em modo foco
                </button>
              </>
            )}
          </div>

          <figure className="plated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templo/atleta.jpg" alt="Discóbolo em mármore" />
          </figure>
        </div>
      </main>
    );
  }

  /* ───────────────────────── o modo foco ───────────────────────── */
  if (fase === 'prova') {
    const q = sorteadas[indice];
    const mm = String(Math.floor(restante / 60)).padStart(2, '0');
    const ss = String(restante % 60).padStart(2, '0');
    const tema = mapaTemas.get(q.tema);

    return (
      <section className="min-h-[calc(100vh-58px)] bg-surface">
        <main className="mx-auto max-w-[820px] px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3">
            <div
              className={clsx(
                'font-display text-[clamp(44px,6vw,64px)] leading-none tnum',
                restante < 60 ? 'text-err' : 'text-ivoryWarm',
              )}
              role="timer"
              aria-live="off"
            >
              {mm}:{ss}
            </div>

            <div className="flex items-center gap-2">
              {sorteadas.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndice(i)}
                  aria-label={`Ir para a questão ${i + 1}`}
                  className={clsx('dot', i === indice && 'dot-on', marcadas[s.id] && 'dot-done')}
                />
              ))}
            </div>

            <span className="text-[13px] text-[rgb(var(--c-n400))] tnum">
              Questão {indice + 1} de {sorteadas.length}
            </span>

            <button onClick={finalizar} className="btn btn-sm ml-auto">
              Encerrar e corrigir
            </button>
          </div>

          <div className="hrl my-7" />

          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-ivoryWarm">
            <span>{[q.banca, q.ano].filter(Boolean).join(' · ')}</span>
            <span className="text-[rgb(var(--c-n500))]">/</span>
            <span>{tema?.titulo ?? q.tema}</span>
          </div>

          <div
            className="prosa my-6 text-[17px] leading-[1.65]"
            dangerouslySetInnerHTML={{ __html: renderizarMarkdown(q.enunciado) }}
          />

          {q.imagem && (
            <figure className="plated mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.imagem} alt="Figura da questão" className="max-h-96 object-contain" />
            </figure>
          )}

          <div className="flex flex-col gap-2">
            {q.alternativas.map((alt) => (
              <button
                key={alt.letra}
                onClick={() => setMarcadas((m) => ({ ...m, [q.id]: alt.letra }))}
                className={clsx('alt', marcadas[q.id] === alt.letra && 'alt-sel')}
              >
                <span className="min-w-[18px] font-display text-[17px] font-semibold text-ivoryWarm">{alt.letra}</span>
                <span className="[&_p]:my-0" dangerouslySetInnerHTML={{ __html: renderizarMarkdown(alt.texto) }} />
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0} className="btn">
              ← Anterior
            </button>
            {indice === sorteadas.length - 1 ? (
              <button onClick={finalizar} className="btn btn-primary">
                Encerrar e corrigir
              </button>
            ) : (
              <button onClick={() => setIndice((i) => i + 1)} className="btn btn-primary">
                Próxima →
              </button>
            )}
          </div>
        </main>
      </section>
    );
  }

  /* ─────────────────────────── o relatório ─────────────────────────── */
  const acertos = sorteadas.filter((q) => marcadas[q.id] === q.gabarito).length;

  const porTema = Object.entries(
    sorteadas.reduce<Record<string, { certas: number; total: number }>>((acc, q) => {
      const chave = mapaTemas.get(q.tema)?.titulo ?? q.tema;
      acc[chave] ??= { certas: 0, total: 0 };
      acc[chave].total += 1;
      if (marcadas[q.id] === q.gabarito) acc[chave].certas += 1;
      return acc;
    }, {}),
  ).sort((a, b) => a[1].certas / a[1].total - b[1].certas / b[1].total);

  return (
    <section className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templo/jardim.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.14, filter: 'sepia(0.2)' }}
      />

      <main className="relative mx-auto max-w-[820px] px-4 py-12 sm:px-6">
        <div className="pb-7 text-center">
          <div className="text-[rgb(var(--c-n300))]">✳</div>
          <div className="mt-2 text-xs uppercase tracking-[0.26em] text-ivoryWarm">Relatório do simulado</div>
          <div className="mt-3 font-display text-[clamp(72px,12vw,120px)] font-normal leading-none text-ivory tnum">
            {acertos}
            <span className="text-[0.35em] text-[rgb(var(--c-n500))]"> / {sorteadas.length}</span>
          </div>
          <div className="mt-2 text-sm text-[rgb(var(--c-n400))]">
            questões corretas · {sorteadas.length - Object.keys(marcadas).length} em branco
          </div>
        </div>

        <div className="hrl" />

        {sorteadas.map((q, i) => {
          const marcou = marcadas[q.id];
          const ok = marcou === q.gabarito;
          return (
            <div
              key={q.id}
              className="flex items-center gap-4 border-b py-3.5"
              style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.12)' }}
            >
              <span
                className={clsx(
                  'w-6 text-center text-sm',
                  ok ? 'text-[rgb(var(--c-n300))]' : 'text-[rgb(var(--c-n500))]',
                )}
              >
                {ok ? '✓' : '✕'}
              </span>
              <span className="min-w-0 flex-1 text-ivory">
                <span className="text-[rgb(var(--c-n500))] tnum">{String(i + 1).padStart(2, '0')} </span>
                {mapaTemas.get(q.tema)?.titulo ?? q.tema}
              </span>
              <span className="whitespace-nowrap text-[13px] text-[rgb(var(--c-n400))] tnum">
                {marcou ? `você marcou ${marcou}` : 'em branco'} · gabarito {q.gabarito}
              </span>
            </div>
          );
        })}

        {porTema.length > 1 && (
          <div className="mt-10">
            <div className="kick mb-4">Desempenho por tema — do mais frágil ao mais firme</div>
            {porTema.map(([nome, d]) => {
              const p = Math.round((d.certas / d.total) * 100);
              return (
                <div key={nome} className="mb-4">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-[rgb(var(--c-n200))]">{nome}</span>
                    <span className="text-[13px] text-[rgb(var(--c-n400))] tnum">
                      {d.certas}/{d.total}
                    </span>
                  </div>
                  <div className="trk">
                    <span className="barra" style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={() => setFase('config')} className="btn btn-primary">
            Refazer o simulado
          </button>
          <Link href="/questoes" className="btn">
            Rever no banco de questões
          </Link>
        </div>

        <section className="mt-14">
          <div className="mb-2 flex items-baseline gap-5">
            <h2 className="font-display text-[clamp(28px,3.4vw,36px)] font-semibold text-ivory">Gabarito comentado</h2>
            <span className="hrl flex-1" />
          </div>
          {sorteadas.map((q, i) => (
            <QuestaoCard
              key={q.id}
              questao={q}
              numero={i + 1}
              modo="simulado"
              marcada={marcadas[q.id] ?? null}
              revelada
            />
          ))}
        </section>
      </main>
    </section>
  );
}
