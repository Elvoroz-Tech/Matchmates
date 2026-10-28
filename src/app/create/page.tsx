import type { Metadata } from 'next';
import CreateWizard from '@/components/CreateWizard';

export const metadata: Metadata = {
  title: 'Start a poll',
  description: 'Create a secret-vote poll for your friend in under a minute.',
  alternates: { canonical: '/create' },
};

export default function CreatePage() {
  return <CreateWizard />;
}
