import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { APP_NAME, COMPANY_NAME, CONTACT_EMAIL, QUIZ_TTL_DAYS } from '@/lib/config';

export const metadata: Metadata = { title: 'Privacy', description: 'What stays on your device and what we store.', alternates: { canonical: '/privacy' } };

export default function Page() {
  return (
    <StaticPage title="Privacy" intro={`${APP_NAME} is built to collect as little as possible. ${COMPANY_NAME} is the operator.`}>
      <h2>What stays on your device</h2>
      <ul>
        <li>Share cards, images, GIFs and videos are generated in your browser and never uploaded.</li>
        <li>Your device token, creator key, poll history and design preferences are kept in your browser storage.</li>
      </ul>
      <h2>What we store</h2>
      <ul>
        <li>The friend&apos;s name, contender names and vote choices of each poll, plus optional nicknames voters choose to show.</li>
        <li>One-way hashes of your device token, creator key and network address. These cannot be turned back into the originals and are used to enforce one vote per device and to limit abuse.</li>
        <li>Opt-out requests you submit.</li>
      </ul>
      <p>Polls and votes are deleted automatically after {QUIZ_TTL_DAYS} days. Rate-limit counters expire within hours.</p>
      <h2>What we do not do</h2>
      <p>No accounts, no sale of data, no advertising profiles, no location. Votes are sealed on the server until the viewer has voted.</p>
      <h2>Analytics</h2>
      <p>If analytics is enabled, it loads only after you accept the banner, and never receives poll content.</p>
      <h2>Your choices</h2>
      <p>Creators can delete a poll from their device. Anyone listed in a poll can use the <a href="/opt-out">opt-out page</a>. For questions, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </StaticPage>
  );
}
