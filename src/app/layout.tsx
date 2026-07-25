import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub Educativo | Aprenda Jogando com Inteligência Artificial",
  description: "Desafie seus conhecimentos, crie decks de estudo personalizados com IA e enfrente seus amigos em batalhas educativas.",
  keywords: ["educação", "ia", "flashcards", "quizzes", "gamificação", "estudos", "enem", "concursos"],
  authors: [{ name: "Hub Educativo" }],
  openGraph: {
    title: "Hub Educativo | Aprenda Jogando com IA",
    description: "Desafie seus conhecimentos com quizzes gerados por inteligência artificial.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hub Educativo",
    description: "Aprenda jogando com inteligência artificial.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
