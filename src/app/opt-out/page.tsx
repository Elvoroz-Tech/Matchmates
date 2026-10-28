import type { Metadata } from 'next';
import OptOutForm from '@/components/OptOutForm';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = { title: 'Opt out', description: 'Ask to be removed from a poll.', alternates: { canonical: '/opt-out' } };

export default function Page() {
  return (
    <StaticPage title="Opt out" intro="Listed in a poll and not into it? Tell us and we will take it down.">
      <p>Paste the poll link (or the 10-character ID at the end of it). We will review and remove your name or the whole poll.</p>
      <OptOutForm />
    </StaticPage>
  );
}
