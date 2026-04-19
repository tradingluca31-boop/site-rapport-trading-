import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rapport Trading",
  description: "Journal fondamental & preparation hebdomadaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
