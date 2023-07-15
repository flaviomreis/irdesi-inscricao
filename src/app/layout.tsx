import "./globals.css";
import type { Metadata } from "next";
import { Amaranth, Inter } from "next/font/google";

const appFont = Amaranth({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Irdesi - Pré-Inscrição",
  description: "Pré-Inscrição para o Curso EaD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={appFont.className}>{children}</body>
    </html>
  );
}
