import Link from 'next/link';

export default function Rodape() {
  return (
    <footer className="border-t border-line no-print">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Plataforma de Química · conteúdo autoral ·{' '}
          <Link href="/config" className="underline hover:text-ink">
            configurar assistente
          </Link>
        </p>
        <p className="label">Seu progresso fica salvo neste navegador</p>
      </div>
    </footer>
  );
}
