import type { Metadata } from 'next';
import ConfigCliente from '@/components/ConfigCliente';

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Conecte sua chave de API, escolha o provedor do assistente e gerencie seu progresso.',
};

export default function ConfigPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black tracking-tight">Configurações</h1>
        <p className="mt-2 text-muted">Chave de API do assistente, provedor, modelo e seus dados de estudo.</p>
      </header>
      <ConfigCliente />
    </div>
  );
}
