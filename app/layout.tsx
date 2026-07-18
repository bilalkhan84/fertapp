import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PostHogProvider from "@/components/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "FertTrack — Male Fertility Platform",
  description:
    "Understand your semen analysis, follow a 90-day improvement plan, and navigate Ontario fertility care.",
  keywords: ["male fertility", "semen analysis", "Ontario fertility", "sperm health"],
  openGraph: {
    title: "FertTrack — Male Fertility Platform",
    description: "Take control of your fertility health in Ontario.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
