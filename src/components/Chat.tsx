'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Square, Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useConfigIA, usePersistido } from '@/lib/progresso';
import { PROVEDORES } from '@/lib/ai/provedores';
import { renderizarMarkdown } from '@/lib/markdown';
import type { ChatMessage } from '@/lib/tipos';

const SUGESTOES = [
  'Explique ligação de hidrogênio começando do zero',
  'Como identifico o reagente limitante em 3 passos?',
  'Qual a diferença prática entre Kc e Kp?',
  'Me dê um mapa mental de funções orgânicas',
];

export default function Chat({
  temaSlug,
  tituloTema,
  altura = 'h-[70vh]',
}: {
  temaSlug?: string;
  tituloTema?: string;
  altura?: string;
}) {
  const [config] = useConfigIA();
  const chaveHistorico = temaSlug ? `qp:chat:${temaSlug}` : 'qp:chat:geral';
  const [mensagens, setMensagens] = usePersistido<ChatMessage[]>(chaveHistorico, []);
  const [entrada, setEntrada] = useState('');
  const [parcial, setParcial] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensagens, parcial]);

  async function enviar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    const historico = [...mensagens, { role: 'user' as const, content: pergunta }];
    setMensagens(historico);
    setEntrada('');
    setErro(null);
    setCarregando(true);
    setParcial('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.chaves[config.provider] ?? '',
          modelo: config.modelo || undefined,
          mensagens: historico,
          temaSlug,
        }),
      });

      if (!resposta.ok || !resposta.body) {
        const { erro: msg } = await resposta.json().catch(() => ({ erro: 'Falha na requisição.' }));
        throw new Error(msg);
      }

      const reader = resposta.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setParcial(acumulado);
      }
      setMensagens([...historico, { role: 'assistant', content: acumulado }]);
      setParcial('');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setErro((e as Error).message);
      if (parcial) setMensagens([...historico, { role: 'assistant', content: parcial }]);
      setParcial('');
    } finally {
      setCarregando(false);
      abortRef.current = null;
    }
  }

  const temChave = Boolean(config.chaves[config.provider]);

  return (
    <div className={clsx('flex flex-col', altura)}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-muted">
        <Sparkles size={14} className="text-brand" />
        <span>
          {PROVEDORES[config.provider].nome}
          {tituloTema ? ` · contexto: ${tituloTema}` : ' · contexto: curso inteiro'}
        </span>
        {mensagens.length > 0 && (
          <button onClick={() => setMensagens([])} className="ml-auto flex items-center gap-1 hover:text-ink">
            <Trash2 size={13} /> limpar
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {mensagens.length === 0 && !parcial && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Pergunte qualquer coisa de química. O assistente responde usando os materiais que estão em{' '}
              <code className="font-mono text-xs">content/materiais/</code> e a teoria dos temas.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGESTOES.map((s) => (
                <button key={s} onClick={() => enviar(s)} className="card px-3 py-2.5 text-left text-sm hover:border-brand">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m, i) => (
          <Balao key={i} papel={m.role} conteudo={m.content} />
        ))}
        {parcial && <Balao papel="assistant" conteudo={parcial} digitando />}
        {carregando && !parcial && <p className="text-sm text-muted">pensando…</p>}

        {erro && (
          <div className="flex items-start gap-2 rounded-xl border border-err/40 bg-err/10 p-3 text-sm text-err">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              {erro}{' '}
              <Link href="/config" className="underline">
                Abrir configurações
              </Link>
            </span>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {!temChave && (
        <p className="border-t border-line bg-surface2 px-4 py-2 text-xs text-muted">
          Nenhuma chave de API salva neste navegador —{' '}
          <Link href="/config" className="underline">
            configure em 30 segundos
          </Link>
          . (Se o servidor já tiver chave própria, pode ignorar.)
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(entrada);
        }}
        className="flex items-end gap-2 border-t border-line p-3"
      >
        <textarea
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar(entrada);
            }
          }}
          rows={1}
          placeholder="Escreva sua dúvida…  (Enter envia, Shift+Enter quebra linha)"
          className="input max-h-40 flex-1 resize-none"
        />
        {carregando ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className="btn px-3" aria-label="Parar">
            <Square size={16} />
          </button>
        ) : (
          <button type="submit" disabled={!entrada.trim()} className="btn btn-primary px-3" aria-label="Enviar">
            <Send size={16} />
          </button>
        )}
      </form>
    </div>
  );
}

function Balao({ papel, conteudo, digitando }: { papel: 'user' | 'assistant'; conteudo: string; digitando?: boolean }) {
  if (papel === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-brandInk">{conteudo}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface2 text-brand">
        <Sparkles size={14} />
      </span>
      <div
        className="min-w-0 flex-1 text-sm leading-relaxed [&_p:first-child]:mt-0"
        dangerouslySetInnerHTML={{ __html: renderizarMarkdown(conteudo) + (digitando ? '<span class="animate-pulse">▍</span>' : '') }}
      />
    </div>
  );
}
