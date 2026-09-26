import type { ChatMessage, Provider } from '../tipos';

export interface ProvedorInfo {
  id: Provider;
  nome: string;
  modeloPadrao: string;
  modelos: string[];
  ondePegarChave: string;
  prefixoChave: string;
}

export const PROVEDORES: Record<Provider, ProvedorInfo> = {
  gemini: {
    id: 'gemini',
    nome: 'Google Gemini',
    modeloPadrao: 'gemini-2.0-flash',
    modelos: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'],
    ondePegarChave: 'https://aistudio.google.com/app/apikey',
    prefixoChave: 'AIza',
  },
  openai: {
    id: 'openai',
    nome: 'OpenAI',
    modeloPadrao: 'gpt-4o-mini',
    modelos: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    ondePegarChave: 'https://platform.openai.com/api-keys',
    prefixoChave: 'sk-',
  },
  anthropic: {
    id: 'anthropic',
    nome: 'Anthropic Claude',
    modeloPadrao: 'claude-sonnet-4-5',
    modelos: ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-opus-4-1'],
    ondePegarChave: 'https://console.anthropic.com/settings/keys',
    prefixoChave: 'sk-ant-',
  },
};

export const ENV_KEY: Record<Provider, string> = {
  gemini: 'GOOGLE_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

interface ArgsStream {
  provider: Provider;
  apiKey: string;
  modelo: string;
  system: string;
  mensagens: ChatMessage[];
}

/**
 * Normaliza os três provedores em um único ReadableStream de TEXTO puro.
 * O cliente só precisa ler chunks e concatenar — sem saber de quem veio.
 */
export async function streamResposta({ provider, apiKey, modelo, system, mensagens }: ArgsStream): Promise<ReadableStream<Uint8Array>> {
  if (provider === 'gemini') return streamGemini(apiKey, modelo, system, mensagens);
  if (provider === 'openai') return streamOpenAI(apiKey, modelo, system, mensagens);
  return streamAnthropic(apiKey, modelo, system, mensagens);
}

/* ─────────────────────── util de SSE ─────────────────────── */

function sseParaTexto(
  upstream: ReadableStream<Uint8Array>,
  extrair: (json: any) => string | undefined,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const linhas = buffer.split('\n');
          buffer = linhas.pop() ?? '';
          for (const linha of linhas) {
            const l = linha.trim();
            if (!l.startsWith('data:')) continue;
            const payload = l.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const texto = extrair(JSON.parse(payload));
              if (texto) controller.enqueue(encoder.encode(texto));
            } catch {
              /* chunk parcial — ignora */
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

async function checarErro(r: Response, provedor: string) {
  if (r.ok && r.body) return;
  const detalhe = await r.text().catch(() => '');
  throw new Error(`${provedor} respondeu ${r.status}. ${detalhe.slice(0, 400)}`);
}

/* ─────────────────────────── Gemini ───────────────────────── */

async function streamGemini(apiKey: string, modelo: string, system: string, mensagens: ChatMessage[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:streamGenerateContent?alt=sse`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: mensagens.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    }),
  });
  await checarErro(r, 'Gemini');
  return sseParaTexto(r.body!, (j) => j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? undefined);
}

/* ─────────────────────────── OpenAI ───────────────────────── */

async function streamOpenAI(apiKey: string, modelo: string, system: string, mensagens: ChatMessage[]) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: modelo,
      stream: true,
      temperature: 0.3,
      messages: [{ role: 'system', content: system }, ...mensagens],
    }),
  });
  await checarErro(r, 'OpenAI');
  return sseParaTexto(r.body!, (j) => j?.choices?.[0]?.delta?.content ?? undefined);
}

/* ────────────────────────── Anthropic ─────────────────────── */

async function streamAnthropic(apiKey: string, modelo: string, system: string, mensagens: ChatMessage[]) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 4096,
      temperature: 0.3,
      system,
      stream: true,
      messages: mensagens,
    }),
  });
  await checarErro(r, 'Anthropic');
  return sseParaTexto(r.body!, (j) => (j?.type === 'content_block_delta' ? j?.delta?.text : undefined));
}
