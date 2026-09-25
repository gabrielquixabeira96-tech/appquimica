'use client';

import QuestaoCard from './QuestaoCard';
import { useProgresso } from '@/lib/progresso';
import type { Questao } from '@/lib/tipos';

export default function QuestoesDoTema({ questoes, tema }: { questoes: Questao[]; tema: { titulo: string; slug: string } }) {
  const { progresso, registrarResposta, alternarFavorita } = useProgresso();
  const respostas = new Map(progresso.respostas.map((r) => [r.questaoId, r]));

  return (
    <div className="space-y-4">
      {questoes.map((q, i) => {
        const r = respostas.get(q.id);
        return (
          <QuestaoCard
            key={q.id}
            questao={q}
            numero={i + 1}
            marcada={r?.marcada ?? null}
            revelada={Boolean(r)}
            favorita={progresso.favoritas.includes(q.id)}
            linkTema={null}
            onFavoritar={() => alternarFavorita(q.id)}
            onResponder={(letra, correta) =>
              registrarResposta({ questaoId: q.id, tema: tema.slug, marcada: letra, correta, em: Date.now() })
            }
          />
        );
      })}
    </div>
  );
}
