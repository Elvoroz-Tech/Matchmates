import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuizClient from '@/components/QuizClient';
import { APP_NAME } from '@/lib/config';
import { headline } from '@/lib/copy';
import { getDb } from '@/lib/server/mongo';
import { getQuizMeta } from '@/lib/server/quiz';
import type { QuizMeta } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

async function load(id: string): Promise<{ meta: QuizMeta | null; error: boolean }> {
  try {
    const db = await getDb();
    return { meta: await getQuizMeta(db, id), error: false };
  } catch (e) {
    console.error('[q page]', e);
    return { meta: null, error: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { meta } = await load(id);
  const title = meta ? headline(meta.subjectName, meta.occasion).replace(/\s*[^\w\s'?!.,:-]+\s*$/u, '') : 'Secret vote';
  return {
    title,
    description: `Vote in secret on ${APP_NAME}. You only see everyone's picks after you vote, and votes are final.`,
    robots: { index: false, follow: false },
  };
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const { meta, error } = await load(id);
  if (error) {
    return (
      <div className="wrap center-page">
        <div className="glass card center">
          <h1 className="h2">We could not load this poll 😵</h1>
          <p className="muted">The service is having a moment. Please try again shortly.</p>
        </div>
      </div>
    );
  }
  if (!meta) notFound();
  return <QuizClient meta={meta} isNew={sp.new === '1'} />;
}
