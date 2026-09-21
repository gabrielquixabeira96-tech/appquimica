#!/usr/bin/env node
/**
 * Converte uma planilha de questões em JSON no formato do banco.
 *
 *   npm run importar:xlsx -- caminho/planilha.xlsx [nome-da-saida]
 *
 * Colunas esperadas (a ordem não importa, o nome sim):
 *   Tema | Subtema | Detalhes/Tags | Questão | Ano | Enunciado (Resumo) | Alternativas | Gabarito Sugerido
 *
 * "Alternativas" deve trazer uma alternativa por linha, começando com "A)", "B)", ...
 * O vínculo com o tema da plataforma é feito pelo NÚMERO do subtema (ex.: "2.1") contra content/curriculo.json;
 * se não houver número, tenta casar pelo título.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const XLSX = createRequire(import.meta.url)('xlsx');

const [, , entrada, nomeSaida = 'importadas'] = process.argv;
if (!entrada) {
  console.error('Uso: npm run importar:xlsx -- planilha.xlsx [nome-da-saida]');
  process.exit(1);
}

const raiz = process.cwd();
const curriculo = JSON.parse(fs.readFileSync(path.join(raiz, 'content/curriculo.json'), 'utf8'));

const porId = new Map();
const porTitulo = new Map();
const normalizar = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

for (const eixo of curriculo.eixos) {
  for (const tema of eixo.temas) {
    porId.set(tema.id, { slug: tema.slug, eixo: eixo.slug });
    porTitulo.set(normalizar(tema.titulo), { slug: tema.slug, eixo: eixo.slug });
  }
}

function resolverTema(subtema, tema) {
  const id = String(subtema ?? '').match(/^\s*(\d+\.\d+)/)?.[1];
  if (id && porId.has(id)) return porId.get(id);
  const titulo = normalizar(String(subtema ?? '').replace(/^\s*\d+\.\d+\s*/, ''));
  if (porTitulo.has(titulo)) return porTitulo.get(titulo);
  for (const [chave, valor] of porTitulo) if (titulo && (chave.includes(titulo) || titulo.includes(chave))) return valor;
  console.warn(`  ! sem tema correspondente: "${subtema}" (${tema}) — marcado como "sem-tema"`);
  return { slug: 'sem-tema', eixo: '' };
}

function parsearAlternativas(bruto) {
  const linhas = String(bruto ?? '')
    .split(/\n|(?=\s[A-E]\))/)
    .map((l) => l.trim())
    .filter(Boolean);
  const alternativas = [];
  for (const linha of linhas) {
    const m = linha.match(/^([A-E])[)\].:-]\s*(.+)$/s);
    if (m) alternativas.push({ letra: m[1], texto: m[2].trim() });
    else if (alternativas.length) alternativas[alternativas.length - 1].texto += ' ' + linha;
  }
  return alternativas;
}

const wb = XLSX.readFile(entrada);
const linhas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

const questoes = [];
for (const [i, linha] of linhas.entries()) {
  const enunciado = String(linha['Enunciado (Resumo)'] ?? linha['Enunciado'] ?? '').trim();
  const alternativas = parsearAlternativas(linha['Alternativas']);
  const gabarito = String(linha['Gabarito Sugerido'] ?? linha['Gabarito'] ?? '').trim().toUpperCase().slice(0, 1);
  if (!enunciado || alternativas.length < 2 || !'ABCDE'.includes(gabarito)) {
    console.warn(`  ! linha ${i + 2} ignorada (enunciado, alternativas ou gabarito ausentes)`);
    continue;
  }
  const { slug, eixo } = resolverTema(linha['Subtema'], linha['Tema']);
  questoes.push({
    id: `${nomeSaida}-${String(linha['Questão'] ?? i + 1).replace(/\W+/g, '')}`,
    eixo,
    tema: slug,
    subtema: String(linha['Subtema'] ?? '').trim() || undefined,
    ano: Number(linha['Ano']) || String(linha['Ano'] ?? '') || undefined,
    banca: String(linha['Banca'] ?? 'ENEM').trim() || undefined,
    dificuldade: String(linha['Dificuldade'] ?? '').trim().toLowerCase() || undefined,
    enunciado,
    alternativas,
    gabarito,
    comentario: String(linha['Comentário'] ?? linha['Comentario'] ?? '').trim() || undefined,
    tags: String(linha['Detalhes/Tags'] ?? '')
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean),
    fonte: String(linha['Fonte'] ?? '').trim() || undefined,
  });
}

const destino = path.join(raiz, 'content/questoes', `${nomeSaida}.json`);
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(questoes, null, 2) + '\n', 'utf8');
console.log(`✓ ${questoes.length} questões gravadas em content/questoes/${nomeSaida}.json`);
