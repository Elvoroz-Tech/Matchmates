import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Background from '@/components/Background';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/Toast';
import Analytics from '@/components/Analytics';
import { APP_NAME, APP_TAGLINE, GSC_VERIFICATION, SITE_URL } from '@/lib/config';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const DESC = `Make a secret poll for your single friend. Everyone votes, nobody peeks, results unlock only after you vote. Karwa Chauth ready, with shareable animated cards.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${APP_NAME}: ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description: DESC,
  applicationName: APP_NAME,
  keywords: ['karwa chauth', 'karwa chauth poll', 'friend poll', 'who should she marry', 'secret vote', 'matchmaking quiz', 'shareable cards', 'gen z'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: APP_NAME, title: `${APP_NAME}: ${APP_TAGLINE}`, description: DESC, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: `${APP_NAME}: ${APP_TAGLINE}`, description: DESC },
  verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0613',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Background />
        <ToastProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
