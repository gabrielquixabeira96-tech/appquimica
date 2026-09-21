import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="font-display text-3xl font-black">Essa página não existe</h1>
      <p className="text-muted">
        Se você esperava um tema aqui, confira o slug em <code className="font-mono text-sm">content/curriculo.json</code>.
      </p>
      <Link href="/trilha" className="btn btn-primary">
        Voltar para a trilha
      </Link>
    </div>
  );
}
