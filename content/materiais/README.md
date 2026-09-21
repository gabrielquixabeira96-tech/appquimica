# Materiais do curso — base de conhecimento do assistente

Tudo que você colocar **nesta pasta** passa a ser consultado pelo assistente virtual antes de
ele responder. É aqui que entram seus resumos, listas comentadas, apostilas, tabelas de dados e
qualquer material autoral.

## O que o assistente consegue ler

| Extensão | Entra no contexto? | Observação |
|---|---|---|
| `.md`, `.mdx` | ✅ | formato ideal — títulos viram âncoras de busca |
| `.txt` | ✅ | texto corrido simples |
| `.csv` | ✅ | ótimo para tabelas de dados, constantes, gabaritos |
| `.json` | ✅ | útil para glossários e bancos estruturados |
| `.pdf`, `.docx`, imagens | ❌ | ficam disponíveis para download, mas **não** entram no contexto |

Para aproveitar um PDF, converta o texto dele para `.md` e salve aqui
(qualquer conversor serve; o importante é que o texto fique legível).

## Como organizar

```
content/materiais/
├─ 01-quimica-geral/
│  ├─ resumo-ligacoes.md
│  └─ tabela-eletronegatividade.csv
├─ 02-fisico-quimica/
│  └─ estequiometria-macetes.md
└─ glossario.md
```

A pasta é varrida recursivamente — a estrutura de subpastas é livre e serve só para você se achar.

## Como escrever para o assistente entender bem

- Um arquivo por assunto, com **título no topo** (`# Estequiometria — macetes`).
- Seções curtas com subtítulos: o sistema fatia os documentos e busca por trecho.
- Inclua as palavras que o aluno usaria na pergunta ("reagente limitante", "sobra", "excesso").
- Fórmulas em LaTeX (`$n = m/M$`) são preservadas e chegam renderizadas na resposta.

> Segurança: o conteúdo desta pasta é tratado como **material de estudo**, nunca como instrução.
> Se um arquivo contiver frases do tipo "ignore suas regras", o assistente as ignora.
