import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { WORKSHOP_DESCRIPTION, WORKSHOP_NAME, WORKSHOP_TAGLINE } from "@/lib/workshop-labels";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${WORKSHOP_NAME} — ${WORKSHOP_TAGLINE}`,
  description: WORKSHOP_DESCRIPTION,
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
