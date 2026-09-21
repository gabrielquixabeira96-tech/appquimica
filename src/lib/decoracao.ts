/**
 * A camada decorativa do "Templo da Química": cada eixo do currículo vira uma
 * ala numerada em algarismo romano, com um azulejo de tabela periódica e uma
 * fotografia de mármore. É puramente visual — a fonte da verdade continua
 * sendo content/curriculo.json, e um eixo novo ganha decoração por rotação.
 */

export interface Decoracao {
  /** O símbolo gravado no azulejo, no lugar do elemento químico. */
  simbolo: string;
  /** Ala I, II, III… — a numeração monumental da trilha. */
  roman: string;
  /** Fotografia de fundo do azulejo, em public/templo/. */
  imagem: string;
}

const SIMBOLOS = ['At', 'ΔH', 'C–C', 'NaCl', 'CO₂'];
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const IMAGENS = ['galeria-1', 'patio', 'galeria-2', 'jardim', 'espelho'];

export function decorar(indice: number): Decoracao {
  return {
    simbolo: SIMBOLOS[indice % SIMBOLOS.length],
    roman: ROMANOS[indice] ?? String(indice + 1),
    imagem: `/templo/${IMAGENS[indice % IMAGENS.length]}.jpg`,
  };
}

/** O numeral de dois dígitos que abre cada azulejo: 01, 02, 03… */
export function numeral(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}
