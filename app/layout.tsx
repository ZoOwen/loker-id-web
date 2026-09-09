import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Loker.id — Agregator Loker Developer Indonesia",
    template: "%s · Loker.id",
  },
  description:
    "Kumpulan lowongan kerja developer di Indonesia dari berbagai sumber, dengan filter stack, gaji, mode kerja, dan level.",
  verification: {
    google: "-ZHb47nlVaRj6rHxnyb90qokZMpxGOg0NZhf35KnVYo",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NuqsAdapter>
          <header className="border-b border-border">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Loker.id
              </Link>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Agregator loker developer Indonesia
              </p>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
              Data diambil dari berbagai sumber lowongan kerja publik.
            </div>
          </footer>
        </NuqsAdapter>
        <Analytics />
      </body>
    </html>
  );
}
