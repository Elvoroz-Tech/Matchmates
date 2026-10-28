'use client';
import LiveCard from './LiveCard';
import { SAMPLE_CARD } from '@/lib/sample';

export default function HeroCard() {
  return (
    <div className="hero-card" aria-hidden="false">
      <div className="hero-glow" />
      <div className="hero-frame float-slow">
        <LiveCard data={SAMPLE_CARD} design="chand" anim="rise" format="story" designs={['chand', 'sindoor', 'aurora', 'pop']} scale={0.6} />
      </div>
      <span className="sticker s1">🔒 sealed</span>
      <span className="sticker s2">👑 winner</span>
      <span className="sticker s3">✨ GIF-ready</span>
    </div>
  );
}
