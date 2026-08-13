import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const displayFont = Lora({ variable: "--font-display", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Katelynn Fit",
  description: "A private beginner fitness companion for strength, rowing, treadmill workouts, and healthy progress.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Katelynn Fit" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fff7fb" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body></html>;
}
