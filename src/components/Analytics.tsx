'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA_ID } from '@/lib/config';

type Consent = 'unknown' | 'yes' | 'no';

export default function Analytics() {
  const [consent, setConsent] = useState<Consent>('unknown');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('vq:consent');
      setConsent(v === 'yes' ? 'yes' : v === 'no' ? 'no' : 'unknown');
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  if (!GA_ID || !ready) return null;

  const choose = (v: Consent) => {
    setConsent(v);
    try {
      localStorage.setItem('vq:consent', v);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {consent === 'yes' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {consent === 'unknown' && (
        <div className="consent" role="dialog" aria-label="Analytics consent">
          <p>
            🍪 Want to help us improve with anonymous analytics? Your polls and votes are never part of this.
          </p>
          <div className="row">
            <button className="btn btn-ghost btn-sm" onClick={() => choose('no')}>
              No thanks
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => choose('yes')}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
