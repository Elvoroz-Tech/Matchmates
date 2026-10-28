'use client';
import { useEffect, useState } from 'react';
import { FESTIVAL_DATETIME, FESTIVAL_NAME } from '@/lib/config';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(FESTIVAL_DATETIME).getTime();
  if (now === null || Number.isNaN(target)) return <div className="eyebrow">🌙 {FESTIVAL_NAME} special</div>;
  const diff = target - now;
  if (diff < -86_400_000) return <div className="eyebrow">✨ Made for every festival and friend group</div>;
  if (diff <= 0) return <div className="eyebrow live">🌙 {FESTIVAL_NAME} is here. Chand dikha?</div>;

  const s = Math.floor(diff / 1000);
  const tiles: [string, number][] = [
    ['days', Math.floor(s / 86400)],
    ['hrs', Math.floor((s % 86400) / 3600)],
    ['min', Math.floor((s % 3600) / 60)],
    ['sec', s % 60],
  ];
  return (
    <div className="countdown" aria-label={`${FESTIVAL_NAME} moonrise countdown`}>
      <span className="eyebrow">🌙 {FESTIVAL_NAME} moonrise in</span>
      <div className="cd-tiles">
        {tiles.map(([label, v]) => (
          <div key={label} className="cd-tile">
            <b key={v}>{pad(v)}</b>
            <i>{label}</i>
          </div>
        ))}
      </div>
    </div>
  );
}
