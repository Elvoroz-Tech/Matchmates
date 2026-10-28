import Link from 'next/link';
import Logo from './Logo';
import { APP_NAME, APP_TAGLINE, COMPANY_NAME, CONTACT_EMAIL } from '@/lib/config';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap wrap-wide footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <Logo />
            <span>{APP_NAME}</span>
          </div>
          <p className="muted">{APP_TAGLINE}</p>
          <a className="footer-mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/rules">Rules</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/opt-out">Opt out</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className="footer-legal muted">
          🛡️ Cards are generated on your device. Polls auto-delete. <br />© {year} {COMPANY_NAME}. {APP_NAME} is a {COMPANY_NAME} product.
        </p>
      </div>
    </footer>
  );
}
