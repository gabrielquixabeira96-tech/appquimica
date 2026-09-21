'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Timer, Play, Flag, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import QuestaoCard from './QuestaoCard';
import { useProgresso } from '@/lib/progresso';
import type { Curriculo, Letra, Questao } from '@/lib/tipos';

type Fase = 'config' | 'prova' | 'relatorio';

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

  function iniciar() {
    const embaralhadas = [...disponiveis].sort(() => Math.random() - 0.5).slice(0, quantidade);
    setSorteadas(embaralhadas);
    setMarcadas({});
    setIndice(0);
    setRestante(minutos * 60);
    setFase('prova');
  }

  function finalizar() {
    sorteadas.forEach((q) => {
      const letra = marcadas[q.id];
      if (letra) registrarResposta({ questaoId: q.id, tema: q.tema, marcada: letra, correta: letra === q.gabarito, em: Date.now() });
    });
    setFase('relatorio');
  }

  /* ───────────────────────── configuração ───────────────────────── */
  if (fase === 'config') {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-black tracking-tight">Simulado cronometrado</h1>
          <p className="mt-2 text-muted">
            Sorteie questões do banco, responda contra o relógio e receba um relatório por tema. O resultado entra no seu
            progresso geral.
          </p>
        </header>

        {questoes.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">
            O banco ainda está vazio. Adicione questões em <code className="font-mono">content/questoes/</code> para
            liberar o simulado.
          </div>
        ) : (
          <div className="card space-y-5 p-6">
            <div>
              <label className="label mb-1 block">Eixo</label>
              <select value={eixo} onChange={(e) => setEixo(e.target.value)} className="input">
                <option value="">Todos os eixos ({questoes.length} questões)</option>
                {curriculo.eixos.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.id}. {e.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Questões: {Math.min(quantidade, disponiveis.length)}</label>
                <input
                  type="range"
                  min={5}
                  max={Math.max(5, Math.min(45, disponiveis.length))}
                  step={5}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-full accent-[rgb(var(--c-brand))]"
                />
              </div>
              <div>
                <label className="label mb-1 block">Tempo: {minutos} min</label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={minutos}
                  onChange={(e) => setMinutos(Number(e.target.value))}
                  className="w-full accent-[rgb(var(--c-brand))]"
                />
              </div>
            </div>

            <p className="text-xs text-muted">
              Ritmo do ENEM: ~3 min por questão. Com {Math.min(quantidade, disponiveis.length)} questões em {minutos} min
              você terá {(minutos / Math.max(1, Math.min(quantidade, disponiveis.length))).toFixed(1)} min por questão.
            </p>

            <button onClick={iniciar} disabled={!disponiveis.length} className="btn btn-primary w-full">
              <Play size={16} /> Iniciar simulado
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ───────────────────────────── prova ───────────────────────────── */
  if (fase === 'prova') {
    const q = sorteadas[indice];
    const mm = String(Math.floor(restante / 60)).padStart(2, '0');
    const ss = String(restante % 60).padStart(2, '0');

    return (
      <div className="space-y-5">
        <div className="card sticky top-20 z-30 flex items-center gap-4 px-4 py-3">
          <span className={clsx('flex items-center gap-2 font-mono text-lg font-semibold', restante < 60 && 'text-err')}>
            <Timer size={18} /> {mm}:{ss}
          </span>
          <span className="text-sm text-muted">
            {indice + 1} / {sorteadas.length} · {Object.keys(marcadas).length} respondidas
          </span>
          <button onClick={finalizar} className="btn ml-auto text-xs">
            <Flag size={14} /> Finalizar
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {sorteadas.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndice(i)}
              className={clsx(
                'h-8 w-8 rounded-lg border text-xs font-mono',
                i === indice && 'border-brand ring-2 ring-brand/40',
                marcadas[s.id] ? 'bg-brand/15 border-brand/40' : 'border-line',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <QuestaoCard
          key={q.id}
          questao={q}
          numero={indice + 1}
          modo="simulado"
          marcada={marcadas[q.id] ?? null}
          onResponder={(letra) => setMarcadas((m) => ({ ...m, [q.id]: letra }))}
        />

        <div className="flex justify-between">
          <button onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0} className="btn">
            <ChevronLeft size={16} /> Anterior
          </button>
          {indice === sorteadas.length - 1 ? (
            <button onClick={finalizar} className="btn btn-primary">
              <Flag size={16} /> Finalizar
            </button>
          ) : (
            <button onClick={() => setIndice((i) => i + 1)} className="btn btn-primary">
              Próxima <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ──────────────────────────── relatório ────────────────────────── */
  const acertos = sorteadas.filter((q) => marcadas[q.id] === q.gabarito).length;
  const pct = sorteadas.length ? Math.round((acertos / sorteadas.length) * 100) : 0;

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
    <div className="space-y-6">
      <div className="card p-8 text-center">
        <p className="label">Resultado</p>
        <p className="my-2 font-display text-6xl font-black text-brand">{pct}%</p>
        <p className="text-muted">
          {acertos} de {sorteadas.length} questões · {sorteadas.length - Object.keys(marcadas).length} em branco
        </p>
      </div>

      <div className="card p-5">
        <p className="label mb-3">Desempenho por tema (do pior para o melhor)</p>
        <ul className="space-y-2.5">
          {porTema.map(([tema, d]) => {
            const p = Math.round((d.certas / d.total) * 100);
            return (
              <li key={tema}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{tema}</span>
                  <span className="font-mono text-xs text-muted">
                    {d.certas}/{d.total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
                  <div className={clsx('h-full rounded-full', p >= 70 ? 'bg-ok' : p >= 40 ? 'bg-warn' : 'bg-err')} style={{ width: `${p}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => setFase('config')} className="btn btn-primary">
          <RotateCcw size={16} /> Novo simulado
        </button>
        <Link href="/questoes" className="btn">
          Revisar erros no banco
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Gabarito comentado</h2>
        {sorteadas.map((q, i) => (
          <QuestaoCard key={q.id} questao={q} numero={i + 1} modo="simulado" marcada={marcadas[q.id] ?? null} revelada />
        ))}
      </section>
    </div>
  );
}
