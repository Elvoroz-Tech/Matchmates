import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/lib/config';
import { getDb } from '@/lib/server/mongo';
import { getQuizMeta } from '@/lib/server/quiz';

export const dynamic = 'force-dynamic';
export const alt = 'Secret friend poll';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = 'Who should they end up with?';
  let count = 0;
  try {
    const meta = await getQuizMeta(await getDb(), id);
    if (meta) {
      count = meta.candidates.length;
      title = meta.occasion === 'karwa' ? `Who's ${meta.subjectName}'s Karwa Chauth partner?` : `Who should ${meta.subjectName} end up with?`;
    }
  } catch {
    /* generic fallback */
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#fff8e1',
          background: 'linear-gradient(135deg,#0a0b2e 0%,#3a0f55 55%,#c1203a 100%)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{APP_NAME}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 86, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 38, marginTop: 28, color: '#ffd966' }}>
            {count ? `${count} secret contenders · votes stay sealed until you vote` : 'Votes stay sealed until you vote'}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#ffd966' }}>Tap to cast your secret vote</div>
      </div>
    ),
    { ...size },
  );
}
