'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Letra, Provider } from './tipos';

/* ─────────── acesso seguro ao localStorage (SSR-safe) ─────────── */

function ler<T>(chave: string, padrao: T): T {
  if (typeof window === 'undefined') return padrao;
  try {
    const raw = window.localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    window.dispatchEvent(new CustomEvent('qp:storage', { detail: chave }));
  } catch {
    /* modo privado / cota cheia — a plataforma segue funcionando */
  }
}

/** Estado persistido no navegador, com hidratação segura (evita mismatch de SSR). */
export function usePersistido<T>(chave: string, padrao: T) {
  const [valor, setValor] = useState<T>(padrao);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setValor(ler(chave, padrao));
    setPronto(true);
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === chave) setValor(ler(chave, padrao));
    };
    window.addEventListener('qp:storage', onChange);
    return () => window.removeEventListener('qp:storage', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const atualizar = useCallback(
    (novo: T | ((anterior: T) => T)) => {
      setValor((anterior) => {
        const resultado = typeof novo === 'function' ? (novo as (a: T) => T)(anterior) : novo;
        gravar(chave, resultado);
        return resultado;
      });
    },
    [chave],
  );

  return [valor, atualizar, pronto] as const;
}

/* ───────────────────────── progresso de estudo ───────────────────────── */

export interface RespostaRegistrada {
  questaoId: string;
  tema: string;
  marcada: Letra;
  correta: boolean;
  em: number;
}

export interface Progresso {
  temasConcluidos: string[];
  respostas: RespostaRegistrada[];
  favoritas: string[];
  ofensiva: { dias: number; ultimoDia: string };
}

const PADRAO: Progresso = { temasConcluidos: [], respostas: [], favoritas: [], ofensiva: { dias: 0, ultimoDia: '' } };

export function useProgresso() {
  const [progresso, setProgresso, pronto] = usePersistido<Progresso>('qp:progresso', PADRAO);

  const registrarResposta = useCallback(
    (r: RespostaRegistrada) => {
      setProgresso((p) => {
        const hoje = new Date().toISOString().slice(0, 10);
        const ontem = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        const ofensiva =
          p.ofensiva.ultimoDia === hoje
            ? p.ofensiva
            : { dias: p.ofensiva.ultimoDia === ontem ? p.ofensiva.dias + 1 : 1, ultimoDia: hoje };
        return { ...p, respostas: [...p.respostas.filter((x) => x.questaoId !== r.questaoId), r], ofensiva };
      });
    },
    [setProgresso],
  );

  const alternarTema = useCallback(
    (slug: string) =>
      setProgresso((p) => ({
        ...p,
        temasConcluidos: p.temasConcluidos.includes(slug)
          ? p.temasConcluidos.filter((s) => s !== slug)
          : [...p.temasConcluidos, slug],
      })),
    [setProgresso],
  );

  const alternarFavorita = useCallback(
    (id: string) =>
      setProgresso((p) => ({
        ...p,
        favoritas: p.favoritas.includes(id) ? p.favoritas.filter((x) => x !== id) : [...p.favoritas, id],
      })),
    [setProgresso],
  );

  const limpar = useCallback(() => setProgresso(PADRAO), [setProgresso]);

  const acertos = progresso.respostas.filter((r) => r.correta).length;
  const total = progresso.respostas.length;

  const desempenhoPorTema = (slug: string) => {
    const rs = progresso.respostas.filter((r) => r.tema === slug);
    return { total: rs.length, acertos: rs.filter((r) => r.correta).length };
  };

  return {
    progresso,
    pronto,
    acertos,
    total,
    aproveitamento: total ? Math.round((acertos / total) * 100) : 0,
    registrarResposta,
    alternarTema,
    alternarFavorita,
    desempenhoPorTema,
    limpar,
  };
}

/* ───────────────────────── configuração da IA ───────────────────────── */

export interface ConfigIA {
  provider: Provider;
  modelo: string;
  chaves: Partial<Record<Provider, string>>;
}

export const CONFIG_PADRAO: ConfigIA = {
  provider: (process.env.NEXT_PUBLIC_DEFAULT_PROVIDER as Provider) || 'gemini',
  modelo: '',
  chaves: {},
};

export function useConfigIA() {
  return usePersistido<ConfigIA>('qp:config-ia', CONFIG_PADRAO);
}
