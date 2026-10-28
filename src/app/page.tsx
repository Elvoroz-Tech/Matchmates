import Link from 'next/link';
import type { CSSProperties } from 'react';
import Countdown from '@/components/Countdown';
import HeroCard from '@/components/HeroCard';
import MyPolls from '@/components/MyPolls';
import PrivacyShield from '@/components/PrivacyShield';
import Reveal from '@/components/Reveal';
import { APP_NAME, COMPANY_NAME, QUIZ_TTL_DAYS } from '@/lib/config';

const STEPS = [
  { e: '✍️', t: 'Name the contenders', d: 'Tell us your friend and add the people in the running. Takes 30 seconds.' },
  { e: '🔒', t: 'Cast your sealed vote', d: 'Your own pick is hidden from everyone until they vote too.' },
  { e: '🚀', t: 'Blast the link', d: 'WhatsApp, Instagram, Snapchat, Telegram. One tap each.' },
  { e: '🎉', t: 'Vote to reveal', d: 'Friends see the squad results only after they lock their vote. No take-backs.' },
];

const FEATS = [
  { e: '🙈', t: 'No peeking', d: 'Results are sealed on the server until you vote. Not even the creator can sneak a look early.', span: 'wide' },
  { e: '🎨', t: '4 designs, 3 animations', d: 'Chand, Sindoor, Aurora and Pop, each with Rise, Spotlight and Shuffle.' },
  { e: '🎬', t: 'Image, GIF or video', d: 'Download exactly what you see, made right on your phone.' },
  { e: '📲', t: 'One-tap sharing', d: 'The share sheet sends the card straight to Stories and chats.', span: 'wide' },
  { e: '👑', t: 'Squad verdicts', d: 'Landslide, neck and neck or total chaos. Every result gets a label.' },
  { e: '⏳', t: 'Self-deleting', d: `Polls vanish after ${QUIZ_TTL_DAYS} days. Delete sooner any time.` },
];

const MARQUEE = ['🔒 sealed votes', '🌙 Karwa Chauth ready', '🎬 GIF + video cards', '🛡️ no sign-up', '👑 squad verdicts', '📲 one-tap share'];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap wrap-wide hero-grid">
          <div className="hero-copy">
            <div className="enter" style={{ '--i': 0 } as CSSProperties}>
              <Countdown />
            </div>
            <h1 className="display enter" style={{ '--i': 1 } as CSSProperties}>
              Let your squad pick <span className="grad-text">their person.</span>
            </h1>
            <p className="lead enter" style={{ '--i': 2 } as CSSProperties}>
              Make a secret poll for your single friend. Everyone votes, nobody peeks, and the results unlock only after you vote. Then flex it with an animated card.
            </p>
            <div className="hero-cta enter" style={{ '--i': 3 } as CSSProperties}>
              <Link href="/create" className="btn btn-primary btn-lg shimmer">
                Start a poll 🚀
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost btn-lg">
                How it works
              </Link>
            </div>
            <p className="tiny muted enter" style={{ '--i': 4 } as CSSProperties}>
              Free. No sign-up. Cards are made on your device.
            </p>
          </div>
          <div className="enter" style={{ '--i': 2 } as CSSProperties}>
            <HeroCard />
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      <MyPolls />

      <section className="section">
        <div className="wrap wrap-wide">
          <Reveal>
            <h2 className="h2">From “who is she texting?” to a verdict in four taps</h2>
          </Reveal>
          <ol className="steps-grid">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <Reveal i={i}>
                  <div className="glass card step-card">
                    <span className="step-emoji">{s.e}</span>
                    <h3>{s.t}</h3>
                    <p className="muted">{s.d}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap-wide">
          <Reveal>
            <h2 className="h2">Built to be screenshotted</h2>
          </Reveal>
          <div className="bento">
            {FEATS.map((f, i) => (
              <Reveal key={f.t} i={i} className={f.span === 'wide' ? 'bento-wide' : ''}>
                <div className="glass card feat">
                  <span className="feat-emoji">{f.e}</span>
                  <h3>{f.t}</h3>
                  <p className="muted">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PrivacyShield />

      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="final-cta">
              <h2 className="h1">Chand will rise. The squad votes first. 🌙</h2>
              <p className="lead">Start your {APP_NAME} poll before the moon does.</p>
              <Link href="/create" className="btn btn-primary btn-lg btn-block shimmer">
                Start a poll 🚀
              </Link>
              <p className="tiny muted">Made by {COMPANY_NAME}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
