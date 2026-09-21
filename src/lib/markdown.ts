import katex from 'katex';

/**
 * Renderizador leve de Markdown + LaTeX para as respostas do assistente.
 * (A teoria dos temas usa MDX completo; aqui o objetivo é ser rápido e sem dependências.)
 */
export function renderizarMarkdown(texto: string): string {
  const formulas: string[] = [];

  // 1) Extrai a matemática ANTES de mexer no resto.
  let s = texto
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => guardar(formulas, tex, true))
    .replace(/\$([^$\n]+?)\$/g, (_, tex) => guardar(formulas, tex, false));

  // 2) Escapa HTML do texto do modelo.
  s = s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

  // 3) Blocos de código.
  const blocos: string[] = [];
  s = s.replace(/```[a-z]*\n([\s\S]*?)```/g, (_, code) => {
    blocos.push(`<pre class="rounded-xl bg-surface2 p-3 overflow-x-auto text-xs"><code>${code}</code></pre>`);
    return `@@BLOCO${blocos.length - 1}@@`;
  });

  // 4) Markdown essencial.
  s = s
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-base font-bold mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 class="font-display text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\s*(\d+)\. (.+)$/gm, '<li value="$1">$2</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="list-disc pl-5 space-y-1 my-2">${m}</ul>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-surface2 px-1 py-0.5 font-mono text-[0.85em]">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand underline">$1</a>')
    .replace(/\n{2,}/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br/>');

  s = `<p class="my-2">${s}</p>`;
  s = s.replace(/@@BLOCO(\d+)@@/g, (_, i) => blocos[Number(i)]);
  s = s.replace(/@@MATH(\d+)@@/g, (_, i) => formulas[Number(i)]);
  return s;
}

function guardar(lista: string[], tex: string, display: boolean): string {
  let html: string;
  try {
    html = katex.renderToString(tex.trim(), { displayMode: display, throwOnError: false, output: 'html' });
  } catch {
    html = `<code>${tex}</code>`;
  }
  lista.push(display ? `<div class="my-3 overflow-x-auto">${html}</div>` : html);
  return `@@MATH${lista.length - 1}@@`;
}
