import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ATS Radar | AI Resume Analyzer & Optimizer",
  description: "Stop getting rejected by bots. Analyze your resume against job descriptions, get a match score, and receive actionable feedback powered by AI.",
  
  openGraph: {
    title: "ATS Radar - Is your resume ready?",
    description: "Get a free professional breakdown of your resume's ATS compatibility.",
    url: "https://ats-radar.vercel.app",
    siteName: "ATS Radar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}