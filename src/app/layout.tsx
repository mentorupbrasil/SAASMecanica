import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
