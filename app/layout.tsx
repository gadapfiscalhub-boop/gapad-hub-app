import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { RegisterSW } from "@/components/RegisterSW";
import { OfflineBanner } from "@/components/OfflineBanner";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GADAP Field App - Canteiro de Obras",
  description: "Aplicativo PWA headless para mestres de obras e engenharia de campo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GADAP Field",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
        <AppProvider>
          <ProjectProvider>
            <RegisterSW />
            <OfflineBanner />
            <main className="flex-1 w-full flex flex-col">{children}</main>
            <BottomNav />
          </ProjectProvider>
        </AppProvider>
      </body>
    </html>
  );
}
