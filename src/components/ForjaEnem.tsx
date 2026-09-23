"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "qp:forja-enem:v1";
const LETTERS = ["A", "B", "C", "D", "E"] as const;

type Answer = (typeof LETTERS)[number];
type Progress = Record<string, { answer: Answer; correct: boolean; updatedAt: number }>;

type Question = {
  id: string;
  year: number;
  theme: string;
  statement: string;
  answer: Answer;
  alternatives: string[];
  comment: string;
};

// O banco pode crescer sem alterar a interface. As questões oficiais já existentes
// no conteúdo do curso podem ser conectadas aqui quando a estrutura for extraída.
const QUESTIONS: Question[] = [
  {
    id: "forja-demo-2020-01",
    year: 2020,
    theme: "Química ambiental",
    statement: "A Forja está pronta para receber as questões oficiais do ENEM. Use esta questão-modelo para testar o fluxo de decisão, revisão e assistência.",
    answer: "C",
    alternatives: ["Oxidação sem transferência de elétrons.", "Dissolução sem interação molecular.", "Transformação química com conservação dos átomos.", "Mudança de estado necessariamente irreversível.", "Reação que elimina a matéria do sistema."],
    comment: "A alternativa C descreve uma transformação química sem violar a conservação da matéria. O assistente pode explicar o raciocínio usando o contexto da questão aberta.",
  },
];

function readProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function ForjaEnem() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [tool, setTool] = useState<string | null>(null);
  const [recall, setRecall] = useState(false);
  const [focus, setFocus] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<string | null>(null);
  const question = QUESTIONS[index];
  const current = progress[question.id];
  const answered = Object.keys(progress).length;
  const correct = Object.values(progress).filter((item) => item.correct).length;

  useEffect(() => setProgress(readProgress()), []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* storage opcional */ }
  }, [progress]);

  const map = useMemo(() => QUESTIONS.map((item) => progress[item.id]), [progress]);

  function answer(letter: Answer) {
    const isCorrect = letter === question.answer;
    setProgress((previous) => ({ ...previous, [question.id]: { answer: letter, correct: isCorrect, updatedAt: Date.now() } }));
  }

  function handleKey(event: KeyboardEvent) {
    const key = event.key.toUpperCase();
    if (LETTERS.includes(key as Answer)) answer(key as Answer);
    if (event.key === "ArrowRight") setIndex((value) => Math.min(value + 1, QUESTIONS.length - 1));
    if (event.key === "ArrowLeft") setIndex((value) => Math.max(value - 1, 0));
    if (key === "G") setRecall((value) => !value);
    if (key === "F") setFocus((value) => !value);
    if (event.key === "Escape") setTool(null);
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  async function askAssistant() {
    setAssistantStatus("Enviando o contexto da questão ao assistente…");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explique esta questão de Química sem antecipar o gabarito antes do aluno tentar. Tema: ${question.theme}. Enunciado: ${question.statement}`,
          context: { source: "forja-enem", questionId: question.id, year: question.year, theme: question.theme },
        }),
      });
      setAssistantStatus(response.ok ? "Contexto enviado ao assistente. Abra o chat para continuar." : "Configure uma chave de IA em /config para usar o assistente.");
    } catch {
      setAssistantStatus("Não foi possível conectar ao assistente agora. Tente novamente.");
    }
  }

  return (
    <main className={focus ? "forja forjaFocus" : "forja"}>
      <header className="forjaHero">
        <nav className="forjaNav" aria-label="Navegação principal">
          <a href="/">AppQuímica</a><a href="/trilha">Trilha</a><a href="/questoes">Questões</a><a href="/assistente">Assistente</a><a aria-current="page" href="/forja-enem">Forja ENEM</a>
        </nav>
        <span>QUÍMICA DO ENEM · 2020 A 2025 · 86 QUESTÕES</span>
        <h1>Forja <em>Química ENEM</em></h1>
        <p>Cada questão transformada em máquina de decisão: responda, revise, revele e converse com o assistente usando a questão aberta como contexto.</p>
      </header>
      <section className="forjaToolbar" aria-label="Ferramentas">
        <strong>Forja <i>Química ENEM</i></strong><span>{answered} respondidas · {correct} acertos</span><button onClick={() => setTool("desempenho")}>Desempenho</button><button onClick={() => setRecall(!recall)} className={recall ? "active" : ""}>G Recall</button><button onClick={() => setFocus(!focus)} className={focus ? "active" : ""}>F Foco</button>
      </section>
      <div className="forjaLayout">
        <section className="forjaCard">
          <div className="questionHead"><span>QUESTÃO <b>{index + 1}</b> / {QUESTIONS.length}</span><span>{question.year} · {question.theme}</span></div>
          <p className={recall ? "statement recall" : "statement"}>{question.statement}</p>
          <div className="alternatives">{question.alternatives.map((text, position) => { const letter = LETTERS[position]; const selected = current?.answer === letter; return <button key={letter} disabled={Boolean(current)} onClick={() => answer(letter)} className={`alternative ${selected ? (current.correct ? "correct" : "wrong") : ""}`}><b>{letter}</b><span>{text}</span></button>; })}</div>
          {current && <div className={current.correct ? "verdict good" : "verdict bad"}><b>{current.correct ? "Acertou." : `Resposta registrada: ${current.answer}.`}</b> Gabarito oficial: {question.answer}.<p>{question.comment}</p></div>}
          <div className="questionActions"><button onClick={() => setIndex(Math.max(0, index - 1))}>← Anterior</button><button onClick={askAssistant}>Perguntar ao assistente</button><button onClick={() => setIndex(Math.min(QUESTIONS.length - 1, index + 1))}>Próxima →</button></div>
          {assistantStatus && <p className="status" role="status">{assistantStatus} <a href="/assistente">Ir para o assistente</a></p>}
        </section>
        <aside className="forjaSide"><div className="sideBox"><b>Mapa</b><div className="map">{map.map((item, position) => <button key={position} onClick={() => setIndex(position)} className={position === index ? "current" : item?.correct ? "mapCorrect" : item ? "mapWrong" : ""}>{position + 1}</button>)}</div><small>Atalhos: A–E responder · ← → navegar · G recall · F foco · Esc fechar</small></div><div className="sideBox"><b>Instrumentos</b><button onClick={() => setTool("periodica")}>P · Tabela periódica</button><button onClick={() => setTool("mol")}>M · Ponte do mol</button><button onClick={() => setTool("equilibrio")}>E · Equilíbrio</button><button onClick={() => setTool("ph")}>H · Escala de pH</button><button onClick={() => setTool("balanceador")}>B · Balanceador</button></div></aside>
      </div>
      {tool && <div className="toolOverlay" role="dialog" aria-modal="true"><div className="toolPanel"><button className="close" onClick={() => setTool(null)}>Esc · fechar</button><h2>{tool === "desempenho" ? "Painel de desempenho" : tool}</h2><p>{tool === "desempenho" ? `${correct} acertos em ${answered} respostas registradas neste dispositivo.` : "Instrumento integrado à Forja. Selecione dados na questão para explorar esta ferramenta."}</p><button onClick={() => setTool(null)}>Concluir</button></div></div>}
    </main>
  );
}
