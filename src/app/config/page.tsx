import type { Metadata } from 'next';
import ConfigCliente from '@/components/ConfigCliente';

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Conecte sua chave de API, escolha o provedor do assistente e gerencie seu progresso.',
};

export default function ConfigPage() {
  return (
    <main className="relative mx-auto max-w-[860px] overflow-hidden px-4 py-12 sm:px-6">
      <div className="ghost -right-4 top-2 text-[180px]">✳</div>
      <div className="kick">A sacristia</div>
      <h1 className="my-1 font-display text-[clamp(40px,5vw,56px)] font-normal text-ivory">Configurações</h1>
      <p className="mb-8 text-[rgb(var(--c-n400))]">
        Chave de API do assistente, provedor, modelo e seus dados de estudo.
      </p>
      <ConfigCliente />
    </main>
  );
}
