
import type { Metadata, Viewport } from 'next';
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
import { GoogleTagManager } from '@/components/tracking/google-tag-manager';
import { GoogleAnalytics } from '@/components/tracking/google-analytics';
import { FacebookPixel } from '@/components/tracking/facebook-pixel';
import { DataLayerProvider } from '@/components/tracking/data-layer';

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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#4B0082",
};

const defaultSettings = {
  logo: 'https://placehold.co/150x50.png',
  companyName: 'eMotionView',
};

const defaultTrackingSettings = {
  gtmId: '',
  gtmEnabled: false,
  gaId: '',
  gaEnabled: false,
  fbPixelId: '',
  fbPixelEnabled: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = defaultSettings;
  let trackingSettings = defaultTrackingSettings;

  try {
    const settingsSnap = await getDoc(doc(db, 'settings/general'));
    if (settingsSnap.exists()) {
      settings = { ...defaultSettings, ...settingsSnap.data() };
    }
  } catch (error) {
    console.warn("Could not fetch general settings. Using default values.", error);
  }

  try {
    const trackingSnap = await getDoc(doc(db, 'settings/tracking'));
    if (trackingSnap.exists()) {
      trackingSettings = { ...defaultTrackingSettings, ...trackingSnap.data() };
    }
  } catch (error) {
    console.warn("Could not fetch tracking settings. Tracking disabled.", error);
  }

  return (
    <html lang="en" className={cn("h-full", inter.variable, spaceGrotesk.variable)} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        {trackingSettings.gtmEnabled && trackingSettings.gtmId && (
          <GoogleTagManager gtmId={trackingSettings.gtmId} />
        )}

        {/* Google Analytics */}
        {trackingSettings.gaEnabled && trackingSettings.gaId && (
          <GoogleAnalytics gaId={trackingSettings.gaId} />
        )}

        {/* Facebook Pixel */}
        {trackingSettings.fbPixelEnabled && trackingSettings.fbPixelId && (
          <FacebookPixel pixelId={trackingSettings.fbPixelId} />
        )}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <DataLayerProvider>
          <Header logoUrl={settings.logo} companyName={settings.companyName} />
          <main className="flex-1 pb-16 md:pb-0">
            <VisitorTracker>{children}</VisitorTracker>
          </main>
          <Footer />
          <MobileNavbar />
          <Toaster />
        </DataLayerProvider>
      </body>
    </html>
  );
}
