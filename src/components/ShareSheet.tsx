'use client';
import { useEffect, type CSSProperties } from 'react';
import { useToast } from './Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
  text: string;
  /** shares the current card image through the OS share sheet (Instagram, Snapchat…) */
  onShareImage?: () => void;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ShareSheet({ open, onClose, url, text, onShareImage }: Props) {
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const enc = encodeURIComponent;
  const full = `${text} ${url}`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* cancelled */
      }
    } else if (await copyText(full)) toast('Link copied', '🔗');
  };
  const viaImage = () => {
    if (onShareImage) onShareImage();
    else nativeShare();
  };

  const links: { id: string; label: string; emoji: string; bg: string; href?: string; action?: () => void }[] = [
    { id: 'wa', label: 'WhatsApp', emoji: '💬', bg: '#25D366', href: `https://wa.me/?text=${enc(full)}` },
    { id: 'ig', label: 'Instagram', emoji: '📸', bg: 'linear-gradient(135deg,#feda75,#fa7e1e 30%,#d62976 60%,#962fbf)', action: viaImage },
    { id: 'sc', label: 'Snapchat', emoji: '👻', bg: '#FFFC00', action: viaImage },
    { id: 'tg', label: 'Telegram', emoji: '✈️', bg: '#2AABEE', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { id: 'x', label: 'X', emoji: '𝕏', bg: '#111111', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { id: 'fb', label: 'Facebook', emoji: '👍', bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { id: 'rd', label: 'Reddit', emoji: '👽', bg: '#FF4500', href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}` },
    { id: 'sms', label: 'SMS', emoji: '💌', bg: '#34c759', href: `sms:?&body=${enc(full)}` },
    { id: 'em', label: 'Email', emoji: '✉️', bg: '#6366f1', href: `mailto:?subject=${enc(text)}&body=${enc(url)}` },
    {
      id: 'cp',
      label: 'Copy link',
      emoji: '🔗',
      bg: 'linear-gradient(135deg,#8b5cff,#ff3d81)',
      action: async () => {
        if (await copyText(url)) toast('Link copied', '🔗');
        else toast('Could not copy. Long-press the link instead.', '😅');
      },
    },
    { id: 'more', label: 'More', emoji: '⋯', bg: 'rgba(255,255,255,.16)', action: nativeShare },
  ];

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Share" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 className="h3">Send it to the squad 🚀</h3>
        <p className="tiny muted">Everyone who opens the link votes in secret first.</p>
        <div className="share-grid">
          {links.map((l, i) => {
            const inner = (
              <>
                <span className="share-ico" style={{ background: l.bg, color: l.id === 'sc' ? '#111' : '#fff' }}>
                  {l.emoji}
                </span>
                <span className="share-label">{l.label}</span>
              </>
            );
            const style = { '--i': i } as CSSProperties;
            return l.href ? (
              <a key={l.id} className="share-item" style={style} href={l.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                {inner}
              </a>
            ) : (
              <button
                key={l.id}
                className="share-item"
                style={style}
                onClick={() => {
                  l.action?.();
                  if (l.id !== 'cp') onClose();
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
        <button className="btn btn-ghost btn-block" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
