import { QUIZ_TTL_DAYS } from '@/lib/config';
import Reveal from './Reveal';

const ITEMS = [
  {
    icon: '🖼️',
    title: 'On-device card creation',
    text: 'Share cards, GIFs and videos are rendered entirely in your browser. Your images are never uploaded to our servers.',
  },
  {
    icon: '🙅',
    title: 'No accounts, no profiling',
    text: 'There is no sign-up, email, phone number or location request. We do not build profiles or sell data.',
  },
  {
    icon: '🔐',
    title: 'Server-enforced sealed votes',
    text: 'Results are only released to someone who has already voted. Nobody, including the poll creator, can peek early.',
  },
  {
    icon: '🗝️',
    title: 'Keys stay on your device',
    text: 'Your device token and creator key live in your browser storage. Our database keeps only one-way hashes of them.',
  },
  {
    icon: '⏳',
    title: `Auto-delete in ${QUIZ_TTL_DAYS} days`,
    text: 'Only the names and sealed votes needed for your friends to take part are stored, and they expire automatically.',
  },
  {
    icon: '🗑️',
    title: 'You stay in control',
    text: 'Creators can delete a poll instantly from their device. Anyone listed can use the opt-out page.',
  },
];

export default function PrivacyShield() {
  return (
    <section className="section shield" id="privacy-shield">
      <div className="wrap wrap-wide">
        <Reveal>
          <div className="shield-head">
            <div className="shield-badge" aria-hidden="true">
              <span>🛡️</span>
              <i />
            </div>
            <h2 className="h2">Private by design. Your device does the heavy lifting.</h2>
            <p className="lead">The less we hold, the less can ever leak. Here is exactly what happens with your data.</p>
          </div>
        </Reveal>
        <div className="shield-grid">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} i={i}>
              <div className="glass card shield-card">
                <span className="shield-icon">{it.icon}</span>
                <h3>{it.title}</h3>
                <p className="muted">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
