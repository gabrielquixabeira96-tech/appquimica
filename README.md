# Plataforma de Química — ENEM e Vestibulares

Estrutura completa e funcional de um curso de química: trilha de conteúdos, página por tema,
banco de questões, simulado cronometrado e assistente de IA que responde lendo **os seus**
materiais. O conteúdo (teoria, questões, PDFs) entra depois — a casa já está pronta e mobiliada.

```
Next.js 16 · React 19 · TypeScript · Tailwind · MDX + KaTeX · sem banco de dados
```

---

## 1. Rodar em 3 comandos

```bash
npm install
cp .env.example .env.local     # opcional — dá para usar sem nenhuma chave
npm run dev                    # http://localhost:3000
```

Build de produção: `npm run build && npm start`. Requer Node 20.9 ou superior.

## 2. Deploy

**Vercel (recomendado):** suba o repositório no GitHub → *Import Project* na Vercel → deploy.
Nenhuma variável de ambiente é obrigatória. Se quiser que o assistente funcione sem o aluno
colar chave, adicione em *Settings → Environment Variables* uma destas:
`GOOGLE_API_KEY`, `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` (nunca com prefixo `NEXT_PUBLIC_`).

Qualquer host com Node 20.9+ também serve (`npm run build && npm start`).

> O conteúdo é lido do disco, então **publicar conteúdo novo é publicar de novo**: um `git push`
> dispara o build e o site já sai com o tema ou a questão que você acabou de escrever.

---

## 3. Mapa do projeto

```
content/                      ← TUDO que você edita no dia a dia
├─ curriculo.json             estrutura do curso: eixos → temas (id, slug, prioridade, tags)
├─ temas/<slug>.mdx           teoria de cada tema (frontmatter + MDX com componentes)
├─ questoes/*.json            banco de questões (vários arquivos, todos são somados)
└─ materiais/                 PDFs, resumos, listas → base de conhecimento do assistente

src/
├─ app/
│  ├─ page.tsx                home com painel de progresso
│  ├─ trilha/                 mapa dos 5 eixos, com marcação de concluído
│  ├─ temas/[slug]/           página do tema: teoria + fórmulas + flashcards + questões
│  ├─ questoes/               banco com filtros, favoritas e lista de revisão
│  ├─ simulado/               prova cronometrada + relatório por tema
│  ├─ assistente/             chat em tela cheia
│  ├─ config/                 chave de API, provedor, modelo, exportar progresso
│  └─ api/chat/route.ts       proxy de streaming para Gemini / OpenAI / Anthropic
├─ components/                UI (todos em português, um arquivo por peça)
│  └─ mdx/                    os blocos didáticos usados na teoria
└─ lib/
   ├─ conteudo.ts             leitura de content/ no servidor
   ├─ progresso.ts            progresso do aluno em localStorage
   ├─ markdown.ts             markdown + LaTeX das respostas do assistente
   ├─ configIA.ts             provedor, chave e modelo no navegador do aluno
   └─ ai/                     provedores (streaming), persona e montagem de contexto (RAG)
```

---

## 4. Como inserir conteúdo

### 4.1 Teoria de um tema

```bash
npm run novo:tema -- estequiometria     # cria content/temas/estequiometria.mdx já com o esqueleto
npm run novo:tema -- --todos            # cria o esqueleto de todos os temas de uma vez
npm run novo:tema                       # lista os slugs disponíveis
```

O arquivo tem duas partes. O **frontmatter** alimenta a barra lateral:

```yaml
---
titulo: Estequiometria
objetivos: ["Converter massa em mol", "…"]
formulas:
  - nome: Quantidade de matéria
    latex: "n = \\frac{m}{M}"
    quando: a questão dá massa e pede mol
pegadinhas: ["Usar massa direto na proporção da equação"]
videos:    [{ titulo: "Aula 1", url: "https://youtu.be/…", duracao: "12min" }]
materiais: [{ titulo: "Lista 3 comentada", arquivo: "/materiais/lista-3.pdf" }]
flashcards: [{ frente: "…", verso: "…" }]
atualizado: "2026-09-21"
---
```

Todos os campos são opcionais: uma seção da barra lateral só aparece se o campo dela existir.

E o **corpo em MDX**, onde você escreve normalmente e usa os blocos didáticos:

| Componente | Para quê |
|---|---|
| `<Objetivos>` | o que o aluno vai saber fazer |
| `<Alerta tipo="dica \| atencao \| info \| erro">` | destaque colorido |
| `<Formula nome="" quando="">` | fórmula com legenda de uso |
| `<Exemplo titulo="">` | questão resolvida |
| `<PassoAPasso>` + `<Passo titulo="">` | resolução numerada |
| `<Detalhe titulo="">` | aprofundamento recolhível |
| `<Flashcard frente="" verso="">` | card de memorização |
| `<Video url="" titulo="">` | embed de YouTube (sem cookies) |
| `<Colunas>` | duas colunas lado a lado |

Matemática em LaTeX: `$n = m/M$` na linha, `$$…$$` em bloco. Fórmulas químicas: `$\mathrm{H_2SO_4}$`.
Veja `content/temas/estequiometria.mdx` — ele é o **modelo de formatação** e usa todos os blocos.

### 4.2 Questões

Crie qualquer arquivo `.json` dentro de `content/questoes/` (um por prova, por ano ou por eixo —
todos são somados automaticamente):

```json
[
  {
    "id": "enem-2024-91",
    "tema": "estequiometria",
    "ano": 2024,
    "banca": "ENEM",
    "dificuldade": "media",
    "enunciado": "Texto do enunciado, aceita **markdown** e $LaTeX$.",
    "imagem": "/questoes/enem-2024-91.png",
    "alternativas": [
      { "letra": "A", "texto": "…" },
      { "letra": "B", "texto": "…" }
    ],
    "gabarito": "C",
    "comentario": "Resolução comentada, também em markdown + LaTeX.",
    "comentarioAlternativas": { "A": "por que está errada", "B": "…" },
    "tags": ["reagente limitante"]
  }
]
```

O campo `tema` precisa ser um **slug existente** em `content/curriculo.json` — é ele que liga a
questão à página do tema e ao relatório de desempenho. Um arquivo com JSON inválido é registrado
no log e pulado, sem derrubar o site. Questões sem `id` ganham um gerado, mas vale defini-lo à
mão: é a chave do progresso do aluno.

**Importar de planilha:**

```bash
npm run importar:xlsx -- minha-planilha.xlsx enem-2026
```

Colunas esperadas: `Tema | Subtema | Detalhes/Tags | Questão | Ano | Enunciado (Resumo) | Alternativas | Gabarito Sugerido`,
com uma alternativa por linha na célula (`A) …`). O vínculo com o tema é feito pelo número do
subtema (ex.: `2.1`). Linhas que não puderam ser convertidas — alternativas em figura, gabarito
ausente, subtema desconhecido — são listadas no fim com o número da linha, para cadastro manual
com o campo `imagem`.

Detalhes do formato em `content/questoes/README.md`.

### 4.3 Materiais do assistente

Jogue arquivos em `content/materiais/` (subpastas à vontade). Formatos **lidos** pelo assistente:
`.md`, `.mdx`, `.txt`, `.csv`, `.json`. PDFs e imagens ficam disponíveis para download, mas não
entram no contexto — converta o texto para `.md` se quiser que sejam usados nas respostas.
Detalhes em `content/materiais/README.md`.

### 4.4 Mudar a estrutura do curso

`content/curriculo.json` é a fonte única: adicionar um tema ali cria a rota `/temas/<slug>`,
o item na trilha, o filtro no banco de questões e a entrada no índice que o assistente enxerga.

---

## 5. O assistente virtual

- **Multi-provedor**: Google Gemini, OpenAI e Anthropic, trocáveis em `/config`.
- **Chave do aluno**: fica apenas no `localStorage` do navegador dele e é usada só na chamada ao
  provedor. Como alternativa, uma chave de servidor em `.env.local` atende todo mundo. Sem chave
  nenhuma, o chat responde com erro 401 em português e um link para `/config`.
- **Streaming real** nos três provedores, normalizado em texto puro pela rota `/api/chat` — o
  cliente lê pedaços e concatena, sem saber de onde vieram.
- **Contexto (RAG simples, sem banco vetorial)**: a cada pergunta o servidor monta o índice do
  curso + a teoria do tema aberto + os trechos mais relevantes dos materiais + até 5 questões do
  tema como amostra de como a banca cobra. A busca normaliza acentos, remove stopwords em
  português e fatia os documentos com sobreposição. O contexto é limitado a ~60 mil caracteres.
- **Postura pedagógica** definida em `src/lib/ai/persona.ts`: constrói do conceito até o ponto
  cobrado, mostra as contas passo a passo, avisa quando a resposta saiu dos materiais e não entrega
  gabarito antes de perguntar o que o aluno tentou. Edite esse texto para mudar o "professor".
- O conteúdo dos materiais é tratado como **dado**, nunca como instrução (proteção contra injeção
  de prompt em arquivos).
- O assistente também está em todas as páginas pelo botão flutuante, com atalho **Ctrl/Cmd+K**.
  Aberto dentro de um tema, ele manda o tema como contexto automaticamente.

---

## 6. Progresso do aluno

Tudo no `localStorage` (`qp:progresso`, `qp:config-ia`, `qp:tema`, `qp:chat:*`): temas concluídos,
respostas, acertos por tema, favoritas e ofensiva de dias. Em `/config` dá para **exportar**,
**importar** e **apagar** o progresso em JSON.

O hook `useProgresso` é o único ponto que toca o `localStorage`: ele hidrata em `useEffect`
(nada de storage durante o render), protege toda leitura e escrita com `try/catch` e sincroniza
as abas abertas por evento.

---

## 7. Identidade visual

Tokens em `src/app/globals.css` (`--c-brand`, `--c-accent`, superfícies, linhas) com tema claro e
escuro. **Trocar a cor do curso = trocar `--c-brand` nos dois blocos.** Tipografia: Fraunces
(títulos), Inter (texto), JetBrains Mono (rótulos e metadados), carregadas por `<link>` no layout —
não por `next/font`, que exigiria rede durante o build.

O tema salvo é aplicado por um script inline antes da primeira pintura, então não há flash branco
ao carregar no modo escuro.

---

## 8. E se um dia eu quiser contas de usuário?

Hoje não há banco, login nem backend: o progresso é do navegador. Para migrar:

1. Troque o corpo de `useProgresso` (`src/lib/progresso.ts`) por chamadas ao seu backend —
   a interface que ele devolve (`progresso`, `responder`, `alternarConcluido`, …) já é o contrato
   que todos os componentes usam, então **nenhum componente precisa mudar**.
2. Acrescente autenticação no `layout` e uma rota de sessão.
3. Mova a chave de API do aluno para o servidor, associada à conta, e pare de enviá-la no corpo
   da requisição em `src/components/Chat.tsx`.

O conteúdo (`content/`) continua em arquivos versionados nos dois cenários.
