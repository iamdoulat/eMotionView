
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


export async function generateMetadata(): Promise<Metadata> {
  let generalSettings: any = {};
  try {
    const snap = await getDoc(doc(db, 'settings/general'));
    if (snap.exists()) {
      generalSettings = snap.data();
    }
  } catch {}

  const siteTitle = generalSettings.browserTitle || generalSettings.storeName || generalSettings.companyName || 'eMotionView';
  const siteDesc = generalSettings.seoDescription || generalSettings.storeDescription || 'AI-Powered Product Recommendations';
  const keywords = generalSettings.seoKeywords
    ? generalSettings.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : undefined;
  const faviconUrl = generalSettings.favicon || '/favicon.ico';
  const ogImg = generalSettings.ogImage;
  const robots = generalSettings.robotsIndex === false
    ? { index: false, follow: false }
    : { index: true, follow: true };
  let metadataBase: URL | undefined = undefined;
  if (generalSettings.canonicalUrl) {
    try {
      metadataBase = new URL(generalSettings.canonicalUrl);
    } catch {}
  }

  return {
    metadataBase,
    title: {
      default: siteTitle,
      template: `%s ${generalSettings.titleSeparator || '|'} ${generalSettings.storeName || 'eMotionView'}`,
    },
    description: siteDesc,
    keywords,
    robots,
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: faviconUrl, sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      ...(ogImg ? { images: [{ url: ogImg }] } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4B0082",
};

const defaultSettings = {
  logo: 'https://placehold.co/150x50.png',
  companyName: 'eMotionView',
  storeName: 'eMotionView',
  favicon: '/favicon.ico',
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
        {settings.favicon && (
          <link rel="icon" href={settings.favicon} sizes="any" />
        )}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <DataLayerProvider>
          <Header logoUrl={settings.logo} companyName={(settings as any).storeName || settings.companyName} />
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
