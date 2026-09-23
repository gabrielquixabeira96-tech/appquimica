# AppQuímica — Forja ENEM

A aplicação agora inclui a rota dedicada `/forja-enem`, com entrada de navegação **Forja ENEM** e uma implementação React/TypeScript do laboratório de questões.

## Estrutura extraída

O código da aplicação deve ficar versionado em `src/`, enquanto conteúdo fica em `content/`. A rota nova está em `src/app/forja-enem/page.tsx` e a interface em `src/components/ForjaEnem.tsx`. O arquivo HTML original permanece como referência visual e fonte de migração.

## Forja ENEM

- Atalhos: `A–E` respondem, `←/→` navegam, `G` alterna recall, `F` alterna foco e `Esc` fecha ferramentas.
- Progresso, respostas e acertos são persistidos em `localStorage` sob `qp:forja-enem:v1`.
- O mapa, revisão, painel de desempenho e instrumentos P/M/E/H/B estão integrados à aba.
- **Perguntar ao assistente** envia o enunciado, tema, ano e identificador da questão para `/api/chat`, preservando o proxy multi-provedor existente.
- A navegação mantém links para Trilha, Questões, Assistente e Forja ENEM.

## Build e deploy

Execute localmente:

```bash
npm install
npm run build
npm start
```

O deploy recomendado é a Vercel: importe `gabrielquixabeira96-tech/appquimica`, mantenha as variáveis `GOOGLE_API_KEY`, `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` apenas no ambiente da Vercel e publique o branch `main`. Um push posterior dispara o redeploy automático quando a integração Git estiver habilitada.

> O build/deploy precisa ser executado no ambiente conectado à Vercel. Este commit prepara a rota e a integração, mas não expõe nem altera chaves secretas.
