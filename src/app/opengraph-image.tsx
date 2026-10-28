import { ImageResponse } from 'next/og';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';

export const alt = 'Secret friend polls';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          color: '#fff8e1',
          background: 'linear-gradient(135deg,#0a0b2e 0%,#3a0f55 55%,#c1203a 100%)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: '#ffd966' }}>{APP_NAME}</div>
        <div style={{ display: 'flex', fontSize: 98, fontWeight: 800, lineHeight: 1.04, marginTop: 24 }}>{APP_TAGLINE}</div>
        <div style={{ display: 'flex', fontSize: 38, marginTop: 30 }}>Secret votes. Animated cards. Karwa Chauth ready.</div>
      </div>
    ),
    { ...size },
  );
}
