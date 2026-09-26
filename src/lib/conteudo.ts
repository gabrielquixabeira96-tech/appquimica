import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Curriculo, Eixo, Questao, Tema, TemaFrontmatter } from './tipos';

export const CONTENT_DIR = path.join(process.cwd(), 'content');
const TEMAS_DIR = path.join(CONTENT_DIR, 'temas');
const QUESTOES_DIR = path.join(CONTENT_DIR, 'questoes');
const MATERIAIS_DIR = path.join(CONTENT_DIR, 'materiais');

/* ───────────────────────── currículo ───────────────────────── */

export function getCurriculo(): Curriculo {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'curriculo.json'), 'utf8');
  return JSON.parse(raw) as Curriculo;
}

export function getTodosTemas(): (Tema & { eixo: Eixo })[] {
  return getCurriculo().eixos.flatMap((eixo) => eixo.temas.map((t) => ({ ...t, eixo })));
}

export function getTema(slug: string) {
  return getTodosTemas().find((t) => t.slug === slug) ?? null;
}

export function getVizinhos(slug: string) {
  const lista = getTodosTemas();
  const i = lista.findIndex((t) => t.slug === slug);
  return { anterior: i > 0 ? lista[i - 1] : null, proximo: i >= 0 && i < lista.length - 1 ? lista[i + 1] : null };
}

/* ────────────────────────── teoria MDX ─────────────────────── */

export interface TeoriaTema {
  frontmatter: TemaFrontmatter;
  mdx: string;
  existe: boolean;
}

export function getTeoria(slug: string): TeoriaTema {
  const file = path.join(TEMAS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return { frontmatter: {}, mdx: '', existe: false };
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  return { frontmatter: data as TemaFrontmatter, mdx: content, existe: content.trim().length > 0 };
}

/* ─────────────────────── banco de questões ─────────────────── */

let cacheQuestoes: Questao[] | null = null;

export function getQuestoes(): Questao[] {
  if (cacheQuestoes && process.env.NODE_ENV === 'production') return cacheQuestoes;
  if (!fs.existsSync(QUESTOES_DIR)) return [];
  const arquivos = fs.readdirSync(QUESTOES_DIR).filter((f) => f.endsWith('.json'));
  const todas: Questao[] = [];
  for (const arquivo of arquivos) {
    try {
      const dados = JSON.parse(fs.readFileSync(path.join(QUESTOES_DIR, arquivo), 'utf8'));
      const lista: Questao[] = Array.isArray(dados) ? dados : (dados.questoes ?? []);
      lista.forEach((q, i) => todas.push({ ...q, id: q.id || `${arquivo.replace('.json', '')}-${i + 1}` }));
    } catch (e) {
      console.error(`[questões] ${arquivo} inválido:`, e);
    }
  }
  cacheQuestoes = todas;
  return todas;
}

export function getQuestoesDoTema(slug: string): Questao[] {
  return getQuestoes().filter((q) => q.tema === slug);
}

/* ──────────────── materiais para o assistente (RAG) ────────── */

export interface Material {
  nome: string;
  caminho: string;
  ext: string;
  tamanhoKb: number;
  texto?: string;
}

const EXT_TEXTO = ['.md', '.mdx', '.txt', '.json', '.csv'];

export function listarMateriais(): Material[] {
  if (!fs.existsSync(MATERIAIS_DIR)) return [];
  const out: Material[] = [];
  const andar = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) andar(full);
      else if (!entry.name.startsWith('.') && entry.name !== 'README.md') {
        out.push({
          nome: entry.name,
          caminho: path.relative(MATERIAIS_DIR, full),
          ext: path.extname(entry.name).toLowerCase(),
          tamanhoKb: Math.round(fs.statSync(full).size / 1024),
        });
      }
    }
  };
  andar(MATERIAIS_DIR);
  return out.sort((a, b) => a.caminho.localeCompare(b.caminho));
}

export function lerMaterial(caminhoRelativo: string): string | null {
  const full = path.join(MATERIAIS_DIR, caminhoRelativo);
  if (!full.startsWith(MATERIAIS_DIR) || !fs.existsSync(full)) return null;
  if (!EXT_TEXTO.includes(path.extname(full).toLowerCase())) return null;
  return fs.readFileSync(full, 'utf8');
}
