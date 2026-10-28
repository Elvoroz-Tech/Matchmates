'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import Logo from './Logo';
import { APP_NAME, CONTACT_EMAIL } from '@/lib/config';

export const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/rules', label: 'Rules' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/opt-out', label: 'Opt out' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label={`${APP_NAME} home`}>
          <Logo />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/create" className="btn btn-primary btn-sm nav-cta">
          Start a poll
        </Link>
        <button
          className={`burger ${open ? 'open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      <div className={`menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <nav className="menu-inner" aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className="menu-link" style={{ '--i': i } as CSSProperties} tabIndex={open ? 0 : -1}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/create"
            className="btn btn-primary btn-lg btn-block menu-cta"
            style={{ '--i': NAV_LINKS.length } as CSSProperties}
            tabIndex={open ? 0 : -1}
          >
            Start a poll 🚀
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="menu-mail" tabIndex={open ? 0 : -1}>
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </header>
  );
}
