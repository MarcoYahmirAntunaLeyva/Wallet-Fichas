import type { Metadata } from "next";
import { Lexend, EB_Garamond } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Regnum Casino",
  description: "La mejor plataforma de juegos de casino premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${lexend.variable} ${ebGaramond.variable} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
