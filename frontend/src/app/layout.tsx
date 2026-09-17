import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'Pharmacology for All — Référentiel Pharmaceutique',
  description: 'Plateforme médicale intelligente et accessible à tous',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" data-theme="light">
      <head>
        <meta name="theme-color" content="#f0fdf4" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#0f5a2e', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px', fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0f5a2e' } },
            error:   { style: { background: '#dc2626' } },
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
