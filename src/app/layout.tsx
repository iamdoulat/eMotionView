
import type {Metadata} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});


export const metadata: Metadata = {
  title: 'eMotionView',
  description: 'AI-Powered Product Recommendations',
  manifest: '/manifest.json',
  themeColor: "#4B0082",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", poppins.variable)} suppressHydrationWarning>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
