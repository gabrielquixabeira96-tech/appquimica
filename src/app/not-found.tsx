import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center surgir">
      <p className="label">404</p>
      <h1 className="titulo-pagina">Essa página não existe</h1>
      <hr className="regra-ouro my-1" />
      <p className="text-muted">
        Se você esperava um tema aqui, confira o slug em <code className="font-mono text-sm">content/curriculo.json</code>.
      </p>
      <Link href="/trilha" className="btn btn-primary">
        Voltar para a trilha
      </Link>
    </div>
  );
}
