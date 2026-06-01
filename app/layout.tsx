import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Ideias para o SI",
  description: "Plataforma de ideias de melhoria do Sistema Interno",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        {/* Evita flash ao carregar: lê tema do localStorage antes do React pintar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--bg)] text-[var(--fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
