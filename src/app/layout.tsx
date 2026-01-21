import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vesta",
  description: "Access hedge fund-level quantitative strategies powered by deep learning. Volatility forecasting, regime detection, and adaptive risk controls - now for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
