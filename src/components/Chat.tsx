'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
      <div
        className="flex items-baseline gap-3 border-b px-5 py-3 text-[13px] text-[rgb(var(--c-n400))]"
        style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.3)' }}
      >
        <span className="text-[rgb(var(--c-n300))]">✳</span>
        <span>
          {PROVEDORES[config.provider].nome}
          {tituloTema ? ` · contexto: ${tituloTema}` : ' · contexto: curso inteiro'}
        </span>
        {mensagens.length > 0 && (
          <button
            onClick={() => setMensagens([])}
            className="ml-auto border-b border-transparent hover:border-[rgb(var(--c-n300))] hover:text-ivory"
          >
            limpar
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
        {mensagens.length === 0 && !parcial && (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
              Pergunte qualquer coisa de química. O assistente responde usando os materiais que estão em{' '}
              <code className="font-mono text-[13px]">content/materiais/</code> e a teoria dos temas.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="card px-4 py-3 text-left text-[15px] leading-[1.5] text-[rgb(var(--c-n200))] transition-colors hover:border-[rgb(var(--c-n300))] hover:text-ivory"
                >
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
        {carregando && !parcial && (
          <p className="text-[13px] italic text-[rgb(var(--c-n500))]">O assistente está lendo os materiais…</p>
        )}

        {erro && (
          <div className="card p-4 text-[15px] text-err" style={{ borderColor: 'rgb(var(--c-err) / 0.5)' }}>
            {erro}{' '}
            <Link href="/config" className="underline decoration-1 underline-offset-4">
              Abrir configurações
            </Link>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {!temChave && (
        <p
          className="border-t px-5 py-2.5 text-[13px] text-[rgb(var(--c-n400))]"
          style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.16)' }}
        >
          Nenhuma chave de API salva neste navegador —{' '}
          <Link href="/config" className="underline decoration-1 underline-offset-4 hover:text-ivory">
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
        className="flex items-end gap-3 border-t p-4"
        style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.3)' }}
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
          placeholder="Pergunte sobre qualquer tema do curso…"
          aria-label="Sua pergunta"
          className="input max-h-40 flex-1 resize-none"
        />
        {carregando ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className="btn btn-sm">
            Parar
          </button>
        ) : (
          <button type="submit" disabled={!entrada.trim()} className="btn btn-primary btn-sm">
            Enviar
          </button>
        )}
      </form>
    </div>
  );
}

function Balao({ papel, conteudo, digitando }: { papel: 'user' | 'assistant'; conteudo: string; digitando?: boolean }) {
  const meu = papel === 'user';
  return (
    <div className={meu ? 'msg-a' : 'msg-t'}>
      <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-ivoryWarm">{meu ? 'Você' : 'Assistente'}</div>
      {meu ? (
        conteudo
      ) : (
        <div
          className="[&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{
            __html: renderizarMarkdown(conteudo) + (digitando ? '<span class="animate-pulse">▍</span>' : ''),
          }}
        />
      )}
    </div>
  );
}
