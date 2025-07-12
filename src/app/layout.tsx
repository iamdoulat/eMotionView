
import type {Metadata, Viewport} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { MobileNavbar } from '@/components/layout/mobile-navbar';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});


export const metadata: Metadata = {
  title: 'eMotionView',
  description: 'AI-Powered Product Recommendations',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: "#4B0082",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", poppins.variable)} suppressHydrationWarning>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNavbar />
        <Toaster />
      </body>
    </html>
  );
}
