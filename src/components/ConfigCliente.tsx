'use client';

import { useEffect, useState } from 'react';
import { Check, ExternalLink, Eye, EyeOff, KeyRound, Loader2, Trash2, Download, Upload, Database } from 'lucide-react';
import clsx from 'clsx';
import { PROVEDORES } from '@/lib/ai/provedores';
import { useConfigIA, useProgresso } from '@/lib/progresso';
import type { Provider } from '@/lib/tipos';

export default function ConfigCliente() {
  const [config, setConfig, pronto] = useConfigIA();
  const { progresso, limpar } = useProgresso();
  const [visivel, setVisivel] = useState(false);
  const [teste, setTeste] = useState<'idle' | 'testando' | 'ok' | 'erro'>('idle');
  const [msgTeste, setMsgTeste] = useState('');
  const [materiais, setMateriais] = useState<{ total: number; indexaveis: number } | null>(null);

  const provedor = PROVEDORES[config.provider];
  const chave = config.chaves[config.provider] ?? '';

  useEffect(() => {
    fetch('/api/materiais')
      .then((r) => r.json())
      .then(setMateriais)
      .catch(() => {});
  }, []);

  async function testar() {
    setTeste('testando');
    setMsgTeste('');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: chave,
          modelo: config.modelo || undefined,
          mensagens: [{ role: 'user', content: 'Responda apenas: conectado.' }],
        }),
      });
      if (!r.ok) {
        const { erro } = await r.json().catch(() => ({ erro: 'Falha desconhecida.' }));
        throw new Error(erro);
      }
      await r.text();
      setTeste('ok');
    } catch (e) {
      setTeste('erro');
      setMsgTeste((e as Error).message);
    }
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(progresso, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `progresso-quimica-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importar(arquivo: File) {
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        localStorage.setItem('qp:progresso', String(leitor.result));
        window.dispatchEvent(new CustomEvent('qp:storage', { detail: 'qp:progresso' }));
        alert('Progresso importado.');
      } catch {
        alert('Arquivo inválido.');
      }
    };
    leitor.readAsText(arquivo);
  }

  if (!pronto) return <div className="card h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      {/* provedor */}
      <section className="card p-6">
        <p className="label mb-3 flex items-center gap-1.5">
          <KeyRound size={12} /> Assistente de IA
        </p>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {(Object.keys(PROVEDORES) as Provider[]).map((id) => (
            <button
              key={id}
              onClick={() => {
                setConfig({ ...config, provider: id, modelo: '' });
                setTeste('idle');
              }}
              className={clsx(
                'card px-4 py-3 text-left text-sm transition-colors',
                config.provider === id
                  ? 'border-[rgb(var(--c-n300))] bg-[rgb(var(--c-ivory)/0.1)]'
                  : 'hover:border-[rgb(var(--c-n300))]',
              )}
            >
              <span className="block font-display text-lg text-ivory">{PROVEDORES[id].nome}</span>
              <span className="block text-xs text-[rgb(var(--c-n400))]">
                {config.chaves[id] ? 'chave salva' : 'sem chave'}
              </span>
            </button>
          ))}
        </div>

        <label className="label mb-1 block">Chave de API — {provedor.nome}</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={visivel ? 'text' : 'password'}
              value={chave}
              onChange={(e) => {
                setConfig({ ...config, chaves: { ...config.chaves, [config.provider]: e.target.value.trim() } });
                setTeste('idle');
              }}
              placeholder={`${provedor.prefixoChave}…`}
              className="input pr-10 font-mono text-[13px]"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => setVisivel((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[rgb(var(--c-n400))] hover:text-ivory"
              aria-label="Mostrar chave"
              type="button"
            >
              {visivel ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button onClick={testar} disabled={teste === 'testando'} className="btn btn-sm">
            {teste === 'testando' ? <Loader2 size={15} className="animate-spin" /> : teste === 'ok' ? <Check size={15} /> : null}
            Testar
          </button>
        </div>

        <p className="mt-2.5 text-[13px] leading-[1.6] text-[rgb(var(--c-n400))]">
          A chave fica <strong>somente neste navegador</strong> (localStorage) e é enviada ao provedor apenas quando você
          faz uma pergunta.{' '}
          <a href={provedor.ondePegarChave} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ivory underline decoration-1 underline-offset-4">
            Pegar chave <ExternalLink size={11} />
          </a>
        </p>

        {teste === 'ok' && <p className="mt-2 text-sm text-ivoryWarm">✳ Conexão funcionando.</p>}
        {teste === 'erro' && <p className="mt-2 text-sm text-err">{msgTeste}</p>}

        <div className="mt-4">
          <label className="label mb-1 block">Modelo</label>
          <select value={config.modelo} onChange={(e) => setConfig({ ...config, modelo: e.target.value })} className="input">
            <option value="">Padrão ({provedor.modeloPadrao})</option>
            {provedor.modelos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* materiais */}
      <section className="card p-6">
        <p className="label mb-2 flex items-center gap-1.5">
          <Database size={12} /> Base de conhecimento
        </p>
        {materiais ? (
          <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
            {materiais.total} arquivos em <code className="font-mono text-xs">content/materiais/</code>, dos quais{' '}
            <strong className="text-ivory">{materiais.indexaveis}</strong> são lidos pelo assistente (.md, .mdx, .txt, .csv,
            .json). PDFs e imagens ficam disponíveis para download, mas não entram no contexto — converta para .md se
            quiser que o assistente os use.
          </p>
        ) : (
          <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">Carregando…</p>
        )}
      </section>

      {/* dados */}
      <section className="card p-6">
        <p className="label mb-3">Seus dados de estudo</p>
        <p className="mb-5 text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
          {progresso.temasConcluidos.length} temas concluídos · {progresso.respostas.length} questões respondidas ·{' '}
          {progresso.favoritas.length} favoritas. Tudo fica neste navegador — exporte antes de trocar de computador.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportar} className="btn btn-sm">
            <Download size={15} /> Exportar
          </button>
          <label className="btn btn-sm cursor-pointer">
            <Upload size={15} /> Importar
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])}
            />
          </label>
          <button
            onClick={() => confirm('Apagar todo o progresso deste navegador?') && limpar()}
            className="btn btn-sm !text-err"
          >
            <Trash2 size={15} /> Apagar progresso
          </button>
        </div>
      </section>
    </div>
  );
}
