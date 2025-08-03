import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import CartProvider from "@/components/providers/CartProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Singlespine - Bridging Diaspora & Family",
  description: "Send gifts to your family and friends in Ghana. Connecting the diaspora during festive seasons and special occasions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Remove suppressHydrationWarning from here
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-white font-sans antialiased",
          inter.variable,
          geistMono.variable
        )}
      >
        <div className="relative flex min-h-dvh flex-col bg-white">
          <Suspense>

            <SessionProvider>
              <CartProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#FC8120',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: {
                        primary: '#FC8120',
                        secondary: 'white',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: 'white',
                      },
                    },
                  }}
                />
              </CartProvider>
            </SessionProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
