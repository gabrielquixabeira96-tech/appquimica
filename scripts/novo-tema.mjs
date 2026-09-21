#!/usr/bin/env node
/**
 * Cria o arquivo de teoria de um tema já existente no currículo, com o esqueleto didático padrão.
 *
 *   npm run novo:tema -- estequiometria
 *   npm run novo:tema -- --todos     (cria o esqueleto de TODOS os temas que ainda não têm arquivo)
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const curriculo = JSON.parse(fs.readFileSync(path.join(raiz, 'content/curriculo.json'), 'utf8'));
const temas = curriculo.eixos.flatMap((e) => e.temas.map((t) => ({ ...t, eixo: e.titulo })));

const alvo = process.argv[2];
if (!alvo) {
  console.log('Temas disponíveis:\n' + temas.map((t) => `  ${t.id}  ${t.slug}`).join('\n'));
  process.exit(0);
}

const selecionados = alvo === '--todos' ? temas : temas.filter((t) => t.slug === alvo);
if (!selecionados.length) {
  console.error(`Tema "${alvo}" não existe em content/curriculo.json.`);
  process.exit(1);
}

for (const tema of selecionados) {
  const destino = path.join(raiz, 'content/temas', `${tema.slug}.mdx`);
  if (fs.existsSync(destino)) {
    console.log(`· ${tema.slug}.mdx já existe — pulando`);
    continue;
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, esqueleto(tema), 'utf8');
  console.log(`✓ content/temas/${tema.slug}.mdx`);
}

function esqueleto(tema) {
  return `---
titulo: ${tema.titulo}
objetivos:
  - Explicar ${tema.titulo.toLowerCase()} com suas próprias palavras
  - Resolver as questões clássicas de prova sobre o tema
formulas:
  - nome: Nome da fórmula
    latex: "c = \\\\frac{n}{V}"
    quando: quando usar esta fórmula
pegadinhas:
  - Escreva aqui o erro que todo mundo comete neste tema
videos: []
materiais: []
flashcards:
  - frente: Pergunta curta
    verso: Resposta direta
atualizado: ${new Date().toISOString().slice(0, 10)}
---

## O panorama

Comece pela intuição: que fenômeno é esse, onde ele aparece no mundo real, por que a prova gosta dele.

<Alerta tipo="dica">
Uma frase que economiza tempo na hora da prova.
</Alerta>

## Construindo o conceito

Desenvolva do básico ao formal. Use LaTeX para a matemática: $n = \\frac{m}{M}$, e blocos para o que é central:

<Formula nome="Quantidade de matéria" quando="sempre que a questão der massa e pedir mol">
$$n = \\frac{m}{M}$$
</Formula>

## Como isso cai na prova

<Exemplo titulo="Exemplo resolvido">
**Enunciado.** …

<PassoAPasso>
  <Passo titulo="Identifique o que foi dado">…</Passo>
  <Passo titulo="Escolha a relação">…</Passo>
  <Passo titulo="Faça a conta com as unidades">…</Passo>
</PassoAPasso>

**Resposta.** …
</Exemplo>

<Alerta tipo="erro" titulo="Erro clássico">
O deslize que derruba a maioria dos candidatos neste tema.
</Alerta>

## Fechamento

Três frases que resumem o tema e conectam com o próximo.

<Detalhe titulo="Aprofundamento (opcional para o ENEM)">
Conteúdo que só cai em vestibulares mais exigentes.
</Detalhe>
`;
}
