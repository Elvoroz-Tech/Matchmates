import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = { title: 'Rules', description: 'Keep polls fun, kind and safe.', alternates: { canonical: '/rules' } };

export default function Page() {
  return (
    <StaticPage title="Rules" intro={`${APP_NAME} is for playful, kind polls between friends. Keep it that way.`}>
      <h2>Do</h2>
      <ul>
        <li>Use first names or nicknames only.</li>
        <li>Make sure your friend and every contender is an adult (18+) who would find this fun.</li>
        <li>Respect it when someone asks to be removed.</li>
      </ul>
      <h2>Don&apos;t</h2>
      <ul>
        <li>Add anyone under 18.</li>
        <li>Use it to bully, shame, harass or target anyone.</li>
        <li>Add surnames, phone numbers, addresses, social handles or other personal details.</li>
        <li>Use hateful, sexual or abusive names and nicknames.</li>
        <li>Try to bypass vote limits, automate votes or probe the service.</li>
      </ul>
      <h2>What happens if rules are broken</h2>
      <p>We may delete polls without notice and block abusive networks. Use the <a href="/opt-out">opt-out page</a> or contact us to report a poll.</p>
    </StaticPage>
  );
}
