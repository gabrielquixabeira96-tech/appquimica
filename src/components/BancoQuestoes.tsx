'use client';

import { useMemo, useState } from 'react';
import { Search, Filter, Shuffle, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import QuestaoCard from './QuestaoCard';
import { useProgresso } from '@/lib/progresso';
import type { Curriculo, Questao } from '@/lib/tipos';

type Aba = 'todas' | 'nao-respondidas' | 'erradas' | 'favoritas';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'nao-respondidas', rotulo: 'Não respondidas' },
  { id: 'erradas', rotulo: 'Erradas (revisar)' },
  { id: 'favoritas', rotulo: 'Favoritas' },
];

export default function BancoQuestoes({ questoes, curriculo }: { questoes: Questao[]; curriculo: Curriculo }) {
  const { progresso, registrarResposta, alternarFavorita, pronto } = useProgresso();
  const [busca, setBusca] = useState('');
  const [eixo, setEixo] = useState('');
  const [tema, setTema] = useState('');
  const [ano, setAno] = useState('');
  const [aba, setAba] = useState<Aba>('todas');
  const [ordem, setOrdem] = useState(0);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const mapaTemas = useMemo(() => {
    const m = new Map<string, { titulo: string; slug: string; eixo: string }>();
    curriculo.eixos.forEach((e) => e.temas.forEach((t) => m.set(t.slug, { titulo: t.titulo, slug: t.slug, eixo: e.slug })));
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
      if (aba === 'favoritas' && !progresso.favoritas.includes(q.id)) return false;
      if (aba === 'nao-respondidas' && respostas.has(q.id)) return false;
      if (aba === 'erradas' && respostas.get(q.id)?.correta !== false) return false;
      if (termo) {
        const alvo = `${q.enunciado} ${q.tags?.join(' ') ?? ''} ${infoTema?.titulo ?? ''} ${q.alternativas.map((a) => a.texto).join(' ')}`;
        if (!alvo.toLowerCase().includes(termo)) return false;
      }
      return true;
    });
    if (ordem) lista = [...lista].sort(() => Math.random() - 0.5);
    return lista;
  }, [questoes, busca, eixo, tema, ano, aba, ordem, mapaTemas, progresso.favoritas, respostas]);

  const visiveis = filtradas.slice(0, pagina * POR_PAGINA);
  const temasDoEixo = eixo ? (curriculo.eixos.find((e) => e.slug === eixo)?.temas ?? []) : curriculo.eixos.flatMap((e) => e.temas);

  function limpar() {
    setBusca('');
    setEixo('');
    setTema('');
    setAno('');
    setAba('todas');
    setPagina(1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
      {/* filtros */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter size={15} /> Filtros
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar no enunciado…"
              className="input pl-9"
            />
          </div>

          <div>
            <label className="label mb-1 block">Eixo</label>
            <select
              value={eixo}
              onChange={(e) => {
                setEixo(e.target.value);
                setTema('');
                setPagina(1);
              }}
              className="input"
            >
              <option value="">Todos os eixos</option>
              {curriculo.eixos.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.id}. {e.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label mb-1 block">Tema</label>
            <select
              value={tema}
              onChange={(e) => {
                setTema(e.target.value);
                setPagina(1);
              }}
              className="input"
            >
              <option value="">Todos os temas</option>
              {temasDoEixo.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.id} {t.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label mb-1 block">Ano</label>
            <select value={ano} onChange={(e) => { setAno(e.target.value); setPagina(1); }} className="input">
              <option value="">Todos</option>
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setOrdem((o) => o + 1)} className="btn flex-1 text-xs">
              <Shuffle size={14} /> Embaralhar
            </button>
            <button onClick={limpar} className="btn text-xs">
              <RotateCcw size={14} />
            </button>
          </div>

          {pronto && (
            <p className="border-t border-line pt-3 text-xs text-muted">
              {progresso.respostas.length} respondidas ·{' '}
              {progresso.respostas.filter((r) => r.correta).length} certas ·{' '}
              {progresso.favoritas.length} favoritas
            </p>
          )}
        </div>
      </aside>

      {/* lista */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAba(a.id);
                setPagina(1);
              }}
              className={clsx('rounded-full border px-3 py-1.5 text-xs font-medium', aba === a.id ? 'border-brand bg-brand text-brandInk' : 'border-line text-muted hover:text-ink')}
            >
              {a.rotulo}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted">{filtradas.length} questões</span>
        </div>

        {visiveis.length === 0 && (
          <div className="card p-10 text-center text-sm text-muted">
            Nenhuma questão com esses filtros.
            <br />
            Adicione arquivos JSON em <code className="font-mono">content/questoes/</code> para popular o banco.
          </div>
        )}

        {visiveis.map((q, i) => {
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
        })}

        {visiveis.length < filtradas.length && (
          <button onClick={() => setPagina((p) => p + 1)} className="btn w-full">
            Carregar mais ({filtradas.length - visiveis.length} restantes)
          </button>
        )}
      </div>
    </div>
  );
}
