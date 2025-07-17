
import type {Metadata, Viewport} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { MobileNavbar } from '@/components/layout/mobile-navbar';
import { VisitorTracker } from '@/components/visitor-tracker';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


export const metadata: Metadata = {
  title: 'eMotionView',
  description: 'AI-Powered Product Recommendations',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: "#4B0082",
};

const defaultSettings = {
    logo: 'https://placehold.co/150x50.png',
    companyName: 'eMotionView',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = defaultSettings;
  try {
    const settingsSnap = await getDoc(doc(db, 'settings/general'));
    if (settingsSnap.exists()) {
        settings = { ...defaultSettings, ...settingsSnap.data() };
    }
  } catch (error) {
    console.warn("Could not fetch general settings. Using default values.", error);
  }

  return (
    <html lang="en" className={cn("h-full", inter.variable, spaceGrotesk.variable)} suppressHydrationWarning>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Header logoUrl={settings.logo} companyName={settings.companyName} />
        <main className="flex-1 pb-16 md:pb-0">
          <VisitorTracker>{children}</VisitorTracker>
        </main>
        <Footer />
        <MobileNavbar />
        <Toaster />
      </body>
    </html>
  );
}
