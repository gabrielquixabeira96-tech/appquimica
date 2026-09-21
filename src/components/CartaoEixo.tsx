import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Eixo, Questao } from '@/lib/tipos';

export default function CartaoEixo({ eixo, questoes }: { eixo: Eixo; questoes: Questao[] }) {
  const contar = (slug: string) => questoes.filter((q) => q.tema === slug).length;
  const totalQ = eixo.temas.reduce((s, t) => s + contar(t.slug), 0);

  return (
    <div className="card card-interativo overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line p-5" style={{ borderTop: `3px solid ${eixo.cor}` }}>
        <div>
          <p className="label mb-1">Eixo {eixo.id}</p>
          <h3 className="titulo-secao">{eixo.titulo}</h3>
          <p className="mt-1.5 text-sm text-muted">{eixo.descricao}</p>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {eixo.temas.map((tema) => (
          <li key={tema.slug}>
            <Link href={`/temas/${tema.slug}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand/[0.07]">
              <span className="font-mono text-xs text-brand/70">{tema.id}</span>
              <span className="flex-1 text-sm font-medium transition-colors group-hover:text-brand">{tema.titulo}</span>
              {tema.prioridade === 'critica' && <span className="chip border-err/40 bg-err/10 text-err">cai muito</span>}
              <span className="font-mono text-xs text-muted">{contar(tema.slug)}q</span>
              <ArrowUpRight size={15} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="border-t border-line bg-surface2/50 px-5 py-2.5 text-xs text-muted">
        {eixo.temas.length} temas · {totalQ} questões no banco
      </p>
    </div>
  );
}
