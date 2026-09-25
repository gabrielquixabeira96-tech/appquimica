import Link from 'next/link';

export default function Rodape() {
  return (
    <footer
      className="no-print mt-10 border-t bg-surface"
      style={{ borderTopColor: 'rgb(var(--c-ivory) / 0.3)' }}
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-baseline gap-4 px-4 py-7 text-[13px] text-[rgb(var(--c-n400))] sm:px-6">
        <span className="font-display text-[17px] text-ivory">
          Q<span className="text-[rgb(var(--c-n300))]">v</span>ímica
        </span>
        <span>Plataforma de Química — ENEM e Vestibulares</span>
        <Link href="/config" className="underline decoration-1 underline-offset-4 hover:text-ivory">
          configurar assistente
        </Link>
        <span className="sm:ml-auto">Seu progresso fica salvo neste navegador</span>
      </div>
    </footer>
  );
}
