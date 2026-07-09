import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppButton from "@/components/ui/WhatsAppButton";


const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WAO GPT | AI Business Publication",
  description:
    "Latest artificial intelligence breakthroughs, automated systems, autonomous agents, and strategic analyses for business executives.",

  metadataBase: new URL("https://waogpt.com"),
  
      alternates: {
    canonical: 'https://waogpt.com',
  },

  openGraph: {
    title: "WAO GPT | AI Business Publication",
    description:
      "Latest artificial intelligence breakthroughs, automated systems, autonomous agents, and strategic analyses for business executives.",
    url: "https://waogpt.com",

    siteName: "WAO GPT",    
    images: [
      {
        url: "/66thlogo.png",
        width: 1200,
        height: 630,
        alt: "WAO GPT",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "WAO GPT | AI Business Publication",
    description:
      "Latest artificial intelligence breakthroughs, automated systems, autonomous agents, and strategic analyses for business executives.",
    images: ["/66thlogo.png"],
  },

  icons: {
    icon: "/66thlogo.png",
    apple: "/66thlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-secondary selection:text-primary">
        <Navbar />
        <main className="flex-grow">{children}
      
        </main>
         <WhatsAppButton />
        <Footer />
        <Toaster theme="light" position="bottom-right" closeButton />
      </body>
    </html>
  );
}
