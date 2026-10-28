import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';
import { APP_NAME, COMPANY_NAME, CONTACT_EMAIL, QUIZ_TTL_DAYS } from '@/lib/config';

export const metadata: Metadata = { title: 'Terms', description: 'Terms of use.', alternates: { canonical: '/terms' } };

export default function Page() {
  return (
    <StaticPage title="Terms of use" intro={`By using ${APP_NAME} you agree to these terms. ${APP_NAME} is a product of ${COMPANY_NAME}.`}>
      <h2>Entertainment only</h2>
      <p>Polls are for fun. Results are opinions of friends, not advice about any real relationship decision.</p>
      <h2>Your content</h2>
      <p>You are responsible for the names you enter and must follow our <a href="/rules">rules</a>. You confirm everyone listed is an adult and would be comfortable being included.</p>
      <h2>Availability</h2>
      <p>The service is provided as is. Polls expire after {QUIZ_TTL_DAYS} days and may be removed earlier if they break the rules. Votes cannot be changed once cast.</p>
      <h2>Acceptable use</h2>
      <p>Do not abuse, scrape, overload or attack the service. We may rate-limit or block activity that looks automated.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </StaticPage>
  );
}
