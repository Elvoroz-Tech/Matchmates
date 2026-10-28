import type { Metadata } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { APP_NAME, QUIZ_TTL_DAYS } from '@/lib/config';

export const metadata: Metadata = { title: 'How it works', description: 'Create a secret poll, share it, vote to reveal, and make animated cards.', alternates: { canonical: '/how-it-works' } };

export default function Page() {
  return (
    <StaticPage title="How it works" intro={`${APP_NAME} turns “who should they end up with?” into a sealed, shareable squad vote.`}>
      <h2>1. Create</h2>
      <p>Pick a vibe (Karwa Chauth, shaadi or just fun), enter your friend&apos;s name and whether they are a girl or a boy. We line up the opposite gender as contenders. Add 2 to 8 names, then cast your own vote.</p>
      <h2>2. Share</h2>
      <p>You get a private link. Send it on WhatsApp, Instagram, Snapchat, Telegram or anywhere else. The share sheet can send an animated card straight to Stories.</p>
      <h2>3. Vote to reveal</h2>
      <p>Everyone who opens the link picks one contender. Until they vote, they cannot see anyone else&apos;s picks. After they vote, results unlock. Votes are final, with no changes and no take-backs.</p>
      <h2>4. Flex the card</h2>
      <p>Choose from four designs (Chand, Sindoor, Aurora, Pop) and three animations (Rise, Spotlight, Shuffle). Save as an image, GIF or video. Everything is rendered on your own device.</p>
      <h2>Good to know</h2>
      <ul>
        <li>No account or sign-up.</li>
        <li>Polls and votes delete themselves after {QUIZ_TTL_DAYS} days.</li>
        <li>Creators can delete a poll any time from the device that made it.</li>
        <li>One vote per device per poll, with network limits to stop spam.</li>
      </ul>
      <p>
        Ready? <Link href="/create">Start a poll</Link>. Read the <Link href="/rules">rules</Link> and our <Link href="/privacy">privacy approach</Link>.
      </p>
    </StaticPage>
  );
}
