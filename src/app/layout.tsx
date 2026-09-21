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
  themeColor: '#151412',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Tema único e escuro: a classe 'dark' é fixa, então não há script de
    // anti-flash nem alternância — o mármore é o único chão da plataforma.
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg">
        <Cabecalho />
        <main className="flex-1">{children}</main>
        <Rodape />
        <BotaoAssistente />
      </body>
    </html>
  );
}
