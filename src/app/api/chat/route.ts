import { NextRequest } from 'next/server';
import { ENV_KEY, PROVEDORES, streamResposta } from '@/lib/ai/provedores';
import { SYSTEM_PROMPT, montarContexto } from '@/lib/ai/contexto';
import type { ChatMessage, Provider } from '@/lib/tipos';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    provider?: Provider;
    apiKey?: string;
    modelo?: string;
    mensagens?: ChatMessage[];
    temaSlug?: string;
    contextoPagina?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ erro: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const provider = (body.provider ?? 'gemini') as Provider;
  if (!PROVEDORES[provider]) return Response.json({ erro: `Provedor desconhecido: ${provider}` }, { status: 400 });

  // A chave do aluno (enviada pelo navegador) tem prioridade; senão cai na do servidor.
  const apiKey = (body.apiKey || process.env[ENV_KEY[provider]] || '').trim();
  if (!apiKey) {
    return Response.json(
      { erro: `Nenhuma chave de API configurada para ${PROVEDORES[provider].nome}. Vá em Configurações e cole a sua chave.` },
      { status: 401 },
    );
  }

  const mensagens = (body.mensagens ?? []).filter((m) => m?.content?.trim()).slice(-16);
  if (!mensagens.length) return Response.json({ erro: 'Envie ao menos uma mensagem.' }, { status: 400 });

  const ultima = mensagens[mensagens.length - 1].content;
  const { contexto, fontes } = montarContexto(ultima, body.temaSlug);

  // Onde o aluno está na plataforma. Vem do navegador, então entra truncado e
  // dentro do bloco de contexto — que o prompt já manda tratar como material de
  // estudo, nunca como instrução.
  const pagina = (body.contextoPagina ?? '').trim().slice(0, 600);
  const blocoPagina = pagina ? `\n\n### ONDE O ALUNO ESTÁ AGORA\n${pagina}` : '';

  const system = `${SYSTEM_PROMPT}\n\n===== CONTEXTO DO CURSO =====\n${contexto}${blocoPagina}\n===== FIM DO CONTEXTO =====`;

  try {
    const stream = await streamResposta({
      provider,
      apiKey,
      modelo: body.modelo || PROVEDORES[provider].modeloPadrao,
      system,
      mensagens,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Fontes': encodeURIComponent(JSON.stringify(fontes)),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha desconhecida ao chamar o provedor.';
    return Response.json({ erro: msg }, { status: 502 });
  }
}
