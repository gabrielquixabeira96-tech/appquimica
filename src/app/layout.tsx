import type { Metadata, Viewport } from 'next';
import './globals.css';
import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import BotaoAssistente from '@/components/BotaoAssistente';

export const metadata: Metadata = {
  title: {
    default: 'Química — ENEM e Vestibulares',
    template: '%s · Química ENEM',
  },
  description:
    'Plataforma de estudo de Química para ENEM e vestibulares: teoria organizada por tema, banco de questões com gabarito comentado e assistente de IA treinado nos materiais do curso.',
  keywords: ['química', 'ENEM', 'vestibular', 'exercícios', 'gabarito comentado'],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0f10' },
  ],
};

// Evita o flash de tema errado na primeira pintura.
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('qp:tema');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Cabecalho />
        <main className="flex-1">{children}</main>
        <Rodape />
        <BotaoAssistente />
      </body>
    </html>
  );
}
