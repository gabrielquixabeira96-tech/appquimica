import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, FolderOpen, ShieldCheck } from 'lucide-react';
import Chat from '@/components/Chat';
import { listarMateriais } from '@/lib/conteudo';

export const metadata: Metadata = {
  title: 'Assistente de Química',
  description: 'Tire dúvidas de química com um assistente que lê os materiais do próprio curso.',
};

export default function AssistentePage() {
  const materiais = listarMateriais();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 surgir">
        <h1 className="titulo-pagina">Assistente de Química</h1>
        <hr className="regra-ouro my-5" />
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="card overflow-hidden">
        <Chat altura="h-[calc(100vh-14rem)]" />
      </div>

      <aside className="space-y-4">
        <div className="card card-interativo p-4">
          <p className="label mb-2 flex items-center gap-1.5">
            <Bot size={12} /> Como ele responde
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Prioriza os materiais e a teoria publicados no curso.</li>
            <li>• Explica do conceito base até o ponto cobrado na prova.</li>
            <li>• Mostra as contas passo a passo, com unidades.</li>
            <li>• Avisa quando a resposta veio de fora dos materiais.</li>
          </ul>
        </div>

        <div className="card card-interativo p-4">
          <p className="label mb-2 flex items-center gap-1.5">
            <FolderOpen size={12} /> Materiais indexados ({materiais.length})
          </p>
          {materiais.length === 0 ? (
            <p className="text-sm text-muted">
              Coloque PDFs, resumos e listas em <code className="font-mono text-xs">content/materiais/</code>. Arquivos
              .md, .txt, .csv e .json entram no contexto do assistente.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto text-xs text-muted">
              {materiais.map((m) => (
                <li key={m.caminho} className="truncate font-mono">
                  {m.caminho} <span className="opacity-60">({m.tamanhoKb}kb)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card card-interativo p-4">
          <p className="label mb-2 flex items-center gap-1.5">
            <ShieldCheck size={12} /> Sua chave de API
          </p>
          <p className="text-sm text-muted">
            Fica salva apenas neste navegador e é usada só para falar com o provedor escolhido.{' '}
            <Link href="/config" className="text-brand underline">
              Gerenciar
            </Link>
            .
          </p>
        </div>
      </aside>
      </div>
    </div>
  );
}
