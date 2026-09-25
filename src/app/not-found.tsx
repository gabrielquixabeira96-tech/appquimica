import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templo/colunata.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.12, filter: 'sepia(0.2)' }}
      />
      <main className="relative mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="ghost -top-4 left-1/2 -translate-x-1/2 text-[220px]">404</div>
        <p className="kick relative">Ala inexistente</p>
        <h1 className="relative font-display text-[clamp(36px,6vw,58px)] font-normal text-ivory">
          Essa página não existe
        </h1>
        <p className="relative leading-[1.65] text-[rgb(var(--c-n300))]">
          Se você esperava um tema aqui, confira o slug em{' '}
          <code className="font-mono">content/curriculo.json</code>.
        </p>
        <Link href="/trilha" className="btn btn-primary relative mt-2">
          Voltar para a trilha
        </Link>
      </main>
    </section>
  );
}
