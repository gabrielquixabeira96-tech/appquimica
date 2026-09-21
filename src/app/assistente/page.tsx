import type { Metadata } from 'next';
import Link from 'next/link';
import Chat from '@/components/Chat';
import { listarMateriais } from '@/lib/conteudo';

export const metadata: Metadata = {
  title: 'Assistente de Química',
  description: 'Tire dúvidas de química com um assistente que lê os materiais do próprio curso.',
};

export default function AssistentePage() {
  const materiais = listarMateriais();

  return (
    <>
      {/* o espelho quase apagado por trás da conversa */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/templo/espelho.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.08, filter: 'sepia(0.25)' }}
        />

        <main className="relative mx-auto flex min-h-[calc(100vh-58px)] max-w-[800px] flex-col px-4 py-7 sm:px-6">
          <div
            className="flex flex-wrap items-baseline gap-3 border-b pb-3.5"
            style={{ borderBottomColor: 'rgb(var(--c-ivory) / 0.3)' }}
          >
            <span className="text-[rgb(var(--c-n300))]">✳</span>
            <h1 className="m-0 font-display text-4xl font-normal text-ivory">Assistente</h1>
            <p className="m-0 ml-auto text-[13px] text-[rgb(var(--c-n400))]">
              Lê os seus materiais · Ctrl/Cmd + K
            </p>
          </div>

          <div className="flex-1">
            <Chat altura="h-[calc(100vh-16rem)]" />
          </div>
        </main>
      </section>

      {/* a cartela de referência, abaixo da dobra */}
      <section className="mx-auto max-w-[1160px] px-4 py-14 sm:px-6">
        <div className="mb-7 flex items-baseline gap-5">
          <h2 className="font-display text-[clamp(26px,3vw,34px)] font-semibold text-ivory">Como ele trabalha</h2>
          <span className="hrl flex-1" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="card p-5">
            <p className="kick mb-2">Como ele responde</p>
            <ul className="list-disc pl-5 text-[15px] leading-[1.7] text-[rgb(var(--c-n200))]">
              <li>Prioriza os materiais e a teoria publicados no curso.</li>
              <li>Explica do conceito base até o ponto cobrado na prova.</li>
              <li>Mostra as contas passo a passo, com unidades.</li>
              <li>Avisa quando a resposta veio de fora dos materiais.</li>
            </ul>
          </div>

          <div className="card p-5">
            <p className="kick mb-2">Materiais indexados ({materiais.length})</p>
            {materiais.length === 0 ? (
              <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
                Coloque PDFs, resumos e listas em <code className="font-mono text-[13px]">content/materiais/</code>.
                Arquivos .md, .txt, .csv e .json entram no contexto do assistente.
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto text-[13px] text-[rgb(var(--c-n400))]">
                {materiais.map((m) => (
                  <li key={m.caminho} className="truncate font-mono">
                    {m.caminho} <span className="opacity-60">({m.tamanhoKb}kb)</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <p className="kick mb-2">Sua chave de API</p>
            <p className="text-[15px] leading-[1.65] text-[rgb(var(--c-n300))]">
              Fica salva apenas neste navegador e é usada só para falar com o provedor escolhido.{' '}
              <Link href="/config" className="text-ivory underline decoration-1 underline-offset-4">
                Gerenciar
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
