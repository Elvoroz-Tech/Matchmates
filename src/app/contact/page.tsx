import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { APP_NAME, COMPANY_NAME, CONTACT_EMAIL } from '@/lib/config';

export const metadata: Metadata = { title: 'Contact', description: `Get in touch with the ${APP_NAME} team.`, alternates: { canonical: '/contact' } };

export default function Page() {
  return (
    <StaticPage title="Contact" intro={`${APP_NAME} is made by ${COMPANY_NAME}. We read every message.`}>
      <p>
        <a className="btn btn-primary btn-lg btn-block" href={`mailto:${CONTACT_EMAIL}`}>
          ✉️ {CONTACT_EMAIL}
        </a>
      </p>
      <h2>Good reasons to write</h2>
      <ul>
        <li>Report a poll that breaks the rules.</li>
        <li>Ask to remove a name or poll (or use the <a href="/opt-out">opt-out form</a>).</li>
        <li>Bugs, ideas, partnerships and press.</li>
      </ul>
      <p>Please include the poll link if your message is about a specific poll.</p>
    </StaticPage>
  );
}
