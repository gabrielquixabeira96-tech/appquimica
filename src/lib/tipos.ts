export type Prioridade = 'critica' | 'alta' | 'media' | 'baixa';

export interface Tema {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  prioridade: Prioridade;
  horas: number;
  tags: string[];
}

export interface Eixo {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  cor: string;
  temas: Tema[];
}

export interface Curriculo {
  versao: number;
  titulo: string;
  eixos: Eixo[];
}

/** Metadados declarados no frontmatter de content/temas/<slug>.mdx */
export interface TemaFrontmatter {
  titulo?: string;
  objetivos?: string[];
  formulas?: { nome: string; latex: string; quando?: string }[];
  videos?: { titulo: string; url: string; fonte?: string; duracao?: string }[];
  materiais?: { titulo: string; arquivo: string; tipo?: string }[];
  flashcards?: { frente: string; verso: string }[];
  pegadinhas?: string[];
  /** YAML sem aspas (2026-09-20) é lido como Date; com aspas, como string. */
  atualizado?: string | Date;
}

export type Letra = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Questao {
  id: string;
  eixo: string;
  tema: string;
  subtema?: string;
  ano?: number | string;
  banca?: string;
  dificuldade?: 'facil' | 'media' | 'dificil';
  enunciado: string;
  imagem?: string;
  alternativas: { letra: Letra; texto: string }[];
  gabarito: Letra;
  comentario?: string;
  comentarioAlternativas?: Partial<Record<Letra, string>>;
  tags?: string[];
  fonte?: string;
}

export type Provider = 'gemini' | 'openai' | 'anthropic';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
