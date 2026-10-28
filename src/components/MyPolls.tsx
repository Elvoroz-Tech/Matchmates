'use client';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { clearHistory, getHistory, type HistoryItem } from '@/lib/client/device';

export default function MyPolls() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    setItems(getHistory().slice(0, 4));
  }, []);
  if (!items.length) return null;
  return (
    <section className="section tight">
      <div className="wrap wrap-wide">
        <div className="mypolls glass card">
          <div className="row between">
            <h2 className="h3">Your polls</h2>
            <button
              className="link-btn"
              onClick={() => {
                clearHistory();
                setItems([]);
              }}
            >
              Clear list
            </button>
          </div>
          <p className="tiny muted">Saved only in this browser. Never uploaded.</p>
          <div className="mypolls-list">
            {items.map((it, i) => (
              <Link key={it.id} href={`/q/${it.id}`} className="mypoll" style={{ '--i': i } as CSSProperties}>
                <span className="mypoll-emoji">{it.role === 'creator' ? '👑' : '🗳️'}</span>
                <span className="mypoll-name">{it.subjectName}</span>
                <span className="mypoll-role">{it.role === 'creator' ? 'You made this' : 'You voted'}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
