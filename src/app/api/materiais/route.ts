import { listarMateriais } from '@/lib/conteudo';

export const runtime = 'nodejs';

/** Usado na tela de Configurações para mostrar o que o assistente enxerga. */
export async function GET() {
  const materiais = listarMateriais();
  return Response.json({
    total: materiais.length,
    indexaveis: materiais.filter((m) => ['.md', '.mdx', '.txt', '.json', '.csv'].includes(m.ext)).length,
    materiais,
  });
}
