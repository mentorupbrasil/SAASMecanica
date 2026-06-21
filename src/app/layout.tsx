import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAASMecanica — Gestão de Oficina Mecânica",
  description:
    "Sistema SaaS completo para gestão de oficinas mecânicas: OS, orçamentos, estoque, financeiro e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
