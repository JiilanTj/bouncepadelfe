import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers";
import "./globals.css";
import "../styles/thermal-print.css";
import "../styles/landing.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BouncePadel - Backoffice",
  description: "Padel Management System Backoffice",
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
        <QueryProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
