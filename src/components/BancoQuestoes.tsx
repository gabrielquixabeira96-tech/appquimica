'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import QuestaoCard from './QuestaoCard';
import { useProgresso } from '@/lib/progresso';
import type { Curriculo, Questao } from '@/lib/tipos';

type Aba = 'todas' | 'nao-respondidas' | 'erradas' | 'favoritas';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'nao-respondidas', rotulo: 'Não respondidas' },
  { id: 'erradas', rotulo: 'A revisar' },
  { id: 'favoritas', rotulo: '★ Favoritas' },
];

const DIFICULDADES: { id: string; rotulo: string }[] = [
  { id: '', rotulo: 'Todas' },
  { id: 'facil', rotulo: 'Fáceis' },
  { id: 'media', rotulo: 'Médias' },
  { id: 'dificil', rotulo: 'Difíceis' },
];

const POR_PAGINA = 10;

export default function BancoQuestoes({ questoes, curriculo }: { questoes: Questao[]; curriculo: Curriculo }) {
  const { progresso, registrarResposta, alternarFavorita, pronto } = useProgresso();
  const [busca, setBusca] = useState('');
  const [eixo, setEixo] = useState('');
  const [tema, setTema] = useState('');
  const [ano, setAno] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [aba, setAba] = useState<Aba>('todas');
  const [ordem, setOrdem] = useState(0);
  const [pagina, setPagina] = useState(1);

  const mapaTemas = useMemo(() => {
    const m = new Map<string, { titulo: string; slug: string; eixo: string }>();
    curriculo.eixos.forEach((e) =>
      e.temas.forEach((t) => m.set(t.slug, { titulo: t.titulo, slug: t.slug, eixo: e.slug })),
    );
    return m;
  }, [curriculo]);

  const anos = useMemo(
    () => [...new Set(questoes.map((q) => String(q.ano ?? '')).filter(Boolean))].sort().reverse(),
    [questoes],
  );

  const respostas = useMemo(() => new Map(progresso.respostas.map((r) => [r.questaoId, r])), [progresso.respostas]);

  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    let lista = questoes.filter((q) => {
      const infoTema = mapaTemas.get(q.tema);
      if (eixo && infoTema?.eixo !== eixo) return false;
      if (tema && q.tema !== tema) return false;
      if (ano && String(q.ano) !== ano) return false;
      if (dificuldade && q.dificuldade !== dificuldade) return false;
      if (aba === 'favoritas' && !progresso.favoritas.includes(q.id)) return false;
      if (aba === 'nao-respondidas' && respostas.has(q.id)) return false;
      if (aba === 'erradas' && respostas.get(q.id)?.correta !== false) return false;
      if (termo) {
        const alvo = `${q.enunciado} ${q.tags?.join(' ') ?? ''} ${infoTema?.titulo ?? ''} ${q.alternativas
          .map((a) => a.texto)
          .join(' ')}`;
        if (!alvo.toLowerCase().includes(termo)) return false;
      }
      return true;
    });
    if (ordem) lista = [...lista].sort(() => Math.random() - 0.5);
    return lista;
  }, [questoes, busca, eixo, tema, ano, dificuldade, aba, ordem, mapaTemas, progresso.favoritas, respostas]);

  const visiveis = filtradas.slice(0, pagina * POR_PAGINA);
  const temasDoEixo = eixo
    ? (curriculo.eixos.find((e) => e.slug === eixo)?.temas ?? [])
    : curriculo.eixos.flatMap((e) => e.temas);

  function limpar() {
    setBusca('');
    setEixo('');
    setTema('');
    setAno('');
    setDificuldade('');
    setAba('todas');
    setPagina(1);
  }

  return (
    <>
      {/* ── a régua de filtros: hairlines em cima e embaixo ── */}
      <div
        className="relative mt-8 border-y py-4"
        style={{ borderColor: 'rgb(var(--c-ivory) / 0.3)' }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="text-xs uppercase tracking-[0.14em] text-[rgb(var(--c-n400))]">Lista</span>
          <div className="flex flex-wrap">
            {ABAS.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setAba(a.id);
                  setPagina(1);
                }}
                className={clsx('seg-b', aba === a.id && 'seg-on')}
              >
                {a.rotulo}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[13px] text-[rgb(var(--c-n400))] tnum">
            {filtradas.length} {filtradas.length === 1 ? 'questão' : 'questões'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="text-xs uppercase tracking-[0.14em] text-[rgb(var(--c-n400))]">Dificuldade</span>
          <div className="flex">
            {DIFICULDADES.map((d) => (
              <button
                key={d.id || 'todas'}
                onClick={() => {
                  setDificuldade(d.id);
                  setPagina(1);
                }}
                className={clsx('seg-b', dificuldade === d.id && 'seg-on')}
              >
                {d.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar no enunciado…"
            aria-label="Buscar no enunciado"
            className="input sm:col-span-2 lg:col-span-1"
          />

          <select
            value={eixo}
            onChange={(e) => {
              setEixo(e.target.value);
              setTema('');
              setPagina(1);
            }}
            aria-label="Filtrar por ala"
            className="input"
          >
            <option value="">Todas as alas</option>
            {curriculo.eixos.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.titulo}
              </option>
            ))}
          </select>

          <select
            value={tema}
            onChange={(e) => {
              setTema(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por tema"
            className="input"
          >
            <option value="">Todos os temas</option>
            {temasDoEixo.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.titulo}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => {
              setAno(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por ano"
            className="input"
          >
            <option value="">Todos os anos</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setOrdem((o) => o + 1)} className="btn btn-sm">
            Embaralhar
          </button>
          <button onClick={limpar} className="btn btn-sm">
            Limpar filtros
          </button>
          {pronto && (
            <span className="ml-auto text-[13px] text-[rgb(var(--c-n400))] tnum">
              {progresso.respostas.length} respondidas · {progresso.respostas.filter((r) => r.correta).length} certas ·{' '}
              {progresso.favoritas.length} favoritas
            </span>
          )}
        </div>
      </div>

      {/* ── o acervo ── */}
      {visiveis.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-[15px] text-[rgb(var(--c-n400))]">
          Nenhuma questão com esses filtros.
          <br />
          Adicione arquivos JSON em <code className="font-mono">content/questoes/</code> para popular o banco.
        </div>
      ) : (
        visiveis.map((q, i) => {
          const r = respostas.get(q.id);
          return (
            <QuestaoCard
              key={q.id}
              questao={q}
              numero={i + 1}
              marcada={r?.marcada ?? null}
              revelada={Boolean(r)}
              favorita={progresso.favoritas.includes(q.id)}
              linkTema={mapaTemas.get(q.tema) ?? null}
              onFavoritar={() => alternarFavorita(q.id)}
              onResponder={(letra, correta) =>
                registrarResposta({ questaoId: q.id, tema: q.tema, marcada: letra, correta, em: Date.now() })
              }
            />
          );
        })
      )}

      {visiveis.length < filtradas.length && (
        <button onClick={() => setPagina((p) => p + 1)} className="btn mt-8 w-full">
          Carregar mais ({filtradas.length - visiveis.length} restantes)
        </button>
      )}
    </>
  );
}
