'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LiveCard from './LiveCard';
import ShareSheet from './ShareSheet';
import { useToast } from './Toast';
import { downloadBlob, ensureFonts, renderGif, renderPng, renderVideo } from '@/lib/card/export';
import {
  ANIM_LIST,
  DESIGN_LIST,
  FORMATS,
  type AnimId,
  type CardData,
  type CardKind,
  type DesignId,
  type FormatId,
} from '@/lib/card/types';
import { getPrefs, setPrefs } from '@/lib/client/device';

const KIND_LABEL: Record<CardKind, string> = { invite: 'Invite', result: 'Results', pick: 'My pick' };

interface Props {
  buildData: (kind: CardKind) => CardData;
  kinds: CardKind[];
  initialKind: CardKind;
  defaultDesign: DesignId;
  shareUrl: string;
  shareText: string;
  fileBase: string;
}

type Busy = null | 'png' | 'gif' | 'video' | 'share';

export default function CardStudio({ buildData, kinds, initialKind, defaultDesign, shareUrl, shareText, fileBase }: Props) {
  const toast = useToast();
  const [kind, setKind] = useState<CardKind>(initialKind);
  const [design, setDesign] = useState<DesignId>(defaultDesign);
  const [anim, setAnim] = useState<AnimId>('rise');
  const [format, setFormat] = useState<FormatId>('story');
  const [busy, setBusy] = useState<Busy>(null);
  const [pct, setPct] = useState(0);
  const [sheet, setSheet] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getPrefs();
    if (p.design && DESIGN_LIST.some((d) => d.id === p.design)) setDesign(p.design as DesignId);
    if (p.anim && ANIM_LIST.some((a) => a.id === p.anim)) setAnim(p.anim as AnimId);
    if (p.format === 'story' || p.format === 'square') setFormat(p.format);
  }, []);

  useEffect(() => {
    if (!kinds.includes(kind)) setKind(kinds[0]);
  }, [kinds, kind]);

  const data = useMemo(() => buildData(kind), [buildData, kind]);
  const look = useMemo(() => ({ design, anim, format }), [design, anim, format]);
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
  const base = `${slug(fileBase)}-${kind}`;

  const pickDesign = (d: DesignId) => {
    setDesign(d);
    setPrefs({ design: d });
    navigator.vibrate?.(8);
  };
  const pickAnim = (a: AnimId) => {
    setAnim(a);
    setPrefs({ anim: a });
    navigator.vibrate?.(8);
  };
  const pickFormat = (f: FormatId) => {
    setFormat(f);
    setPrefs({ format: f });
  };

  const run = useCallback(
    async (type: Exclude<Busy, null>, fn: () => Promise<void>) => {
      if (busy) return;
      setBusy(type);
      setPct(0);
      try {
        await ensureFonts();
        await fn();
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Something went wrong.', '😵');
      } finally {
        setBusy(null);
        setPct(0);
      }
    },
    [busy, toast],
  );

  const savePng = () =>
    run('png', async () => {
      const blob = await renderPng(data, look);
      downloadBlob(blob, `${base}.png`);
      toast('Image saved to your device', '🖼️');
    });
  const saveGif = () =>
    run('gif', async () => {
      const blob = await renderGif(data, look, setPct);
      downloadBlob(blob, `${base}.gif`);
      toast('GIF saved to your device', '✨');
    });
  const saveVideo = () =>
    run('video', async () => {
      const { blob, ext } = await renderVideo(data, look, setPct);
      downloadBlob(blob, `${base}.${ext}`);
      toast('Video saved, ready for Stories', '🎬');
    });

  const shareImage = useCallback(
    () =>
      run('share', async () => {
        const blob = await renderPng(data, look);
        const file = new File([blob], `${base}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], text: `${shareText} ${shareUrl}` });
          } catch {
            /* cancelled */
          }
        } else {
          downloadBlob(blob, `${base}.png`);
          toast('Saved! Open your app and add it to your story.', '📲');
          setSheet(true);
        }
      }),
    [run, data, look, base, shareText, shareUrl, toast],
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
  };
  const onLeave = () => {
    if (frameRef.current) frameRef.current.style.transform = '';
  };

  const label = (t: Exclude<Busy, null>, idle: string) => (busy === t ? (t === 'png' || t === 'share' ? 'Working…' : `${Math.round(pct * 100)}%`) : idle);

  return (
    <div className="studio">
      {kinds.length > 1 && (
        <div className="tabs" role="tablist" style={{ ['--n' as string]: kinds.length, ['--k' as string]: kinds.indexOf(kind) }}>
          <i className="tab-ind" />
          {kinds.map((k) => (
            <button key={k} role="tab" aria-selected={k === kind} className={`tab ${k === kind ? 'on' : ''}`} onClick={() => setKind(k)}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      )}

      <div className={`frame-wrap ${format}`}>
        <div className="frame" ref={frameRef} onPointerMove={onMove} onPointerLeave={onLeave}>
          <LiveCard data={data} design={design} anim={anim} format={format} scale={format === 'story' ? 0.667 : 0.667} />
        </div>
      </div>

      <div className="studio-controls">
        <div>
          <p className="ctl-label">Design</p>
          <div className="swatches">
            {DESIGN_LIST.map((d) => (
              <button key={d.id} className={`swatch ${design === d.id ? 'on' : ''}`} onClick={() => pickDesign(d.id)} aria-pressed={design === d.id}>
                <span className="swatch-dot" style={{ background: d.swatch }}>
                  {d.emoji}
                </span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="ctl-label">Animation</p>
          <div className="chips">
            {ANIM_LIST.map((a) => (
              <button key={a.id} className={`chip ${anim === a.id ? 'active' : ''}`} onClick={() => pickAnim(a.id)} aria-pressed={anim === a.id}>
                {a.emoji} {a.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="ctl-label">Size</p>
          <div className="chips">
            {(Object.keys(FORMATS) as FormatId[]).map((f) => (
              <button key={f} className={`chip ${format === f ? 'active' : ''}`} onClick={() => pickFormat(f)} aria-pressed={format === f}>
                {FORMATS[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="studio-actions">
        <button className="btn btn-primary btn-lg btn-block" onClick={shareImage} disabled={!!busy}>
          {busy === 'share' ? 'Getting it ready…' : 'Share this card 🚀'}
        </button>
        <div className="dl-row">
          <button className="btn btn-ghost" onClick={savePng} disabled={!!busy}>
            🖼️ {label('png', 'Image')}
          </button>
          <button className="btn btn-ghost" onClick={saveGif} disabled={!!busy}>
            ✨ {label('gif', 'GIF')}
          </button>
          <button className="btn btn-ghost" onClick={saveVideo} disabled={!!busy}>
            🎬 {label('video', 'Video')}
          </button>
        </div>
        <button className="link-btn center" onClick={() => setSheet(true)}>
          Share the poll link instead
        </button>
        <p className="tiny muted center">🛡️ Made on your device. Nothing is uploaded.</p>
      </div>

      <ShareSheet open={sheet} onClose={() => setSheet(false)} url={shareUrl} text={shareText} onShareImage={shareImage} />
    </div>
  );
}
