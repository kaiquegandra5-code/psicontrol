import type { Metadata } from "next";
import { Inter, Geist } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Psiorganizer — Gestão clínica para psicólogos",
    template: "%s | Psiorganizer",
  },
  description:
    "Plataforma completa para psicólogos autônomos gerenciarem pacientes, prontuários, agenda e documentos clínicos.",
  keywords: [
    "psicologia",
    "prontuário eletrônico",
    "agendamento",
    "gestão clínica",
    "psicólogo",
  ],
  authors: [{ name: "Psiorganizer" }],
  creator: "Psiorganizer",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Psiorganizer",
    description: "Gestão clínica para psicólogos",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${Inter.variable} ${Geist.variable} font-sans antialiased bg-background text-on-background`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
