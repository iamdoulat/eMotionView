
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { MobileNavbar } from '@/components/layout/mobile-navbar';
import { VisitorTracker } from '@/components/visitor-tracker';
import { doc, getDoc } from '@/lib/db';
import { db } from '@/lib/db';
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
    const [settingsSnap, trackingSnap] = await Promise.all([
      getDoc(doc(db, 'settings/general')),
      getDoc(doc(db, 'settings/tracking')),
    ]);
    if (settingsSnap.exists()) {
      settings = { ...defaultSettings, ...settingsSnap.data() };
    }
    if (trackingSnap.exists()) {
      trackingSettings = { ...defaultTrackingSettings, ...trackingSnap.data() };
    }
  } catch (error) {
    console.warn("Could not fetch layout settings. Using default values.", error);
  }

  return (
    <html lang="en" className={cn("h-full", inter.variable, spaceGrotesk.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){};if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){for(var i=0;i<r.length;i++){r[i].update();}});}})();`,
          }}
        />
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
          <main className="flex-1 pb-6 md:pb-0">
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
