'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Avatar from './Avatar';
import CandCard from './CandCard';
import CardStudio from './CardStudio';
import CountUp from './CountUp';
import ShareSheet from './ShareSheet';
import { useToast } from './Toast';
import { APP_NAME, COMPANY_NAME, LIMITS, SITE_HOST } from '@/lib/config';
import { headline, occasionMeta, shareText } from '@/lib/copy';
import { verdict } from '@/lib/verdict';
import type { CardData, CardKind, DesignId } from '@/lib/card/types';
import type { QuizMeta, QuizResults } from '@/lib/types';
import { deleteApi, resultsApi, voteApi } from '@/lib/client/api';
import { addHistory, clearLocal, getDeviceToken, getLocal, setLocal } from '@/lib/client/device';
import { burst } from '@/lib/client/confetti';

type Phase = 'boot' | 'vote' | 'results';
const DEFAULT_DESIGN: Record<string, DesignId> = { karwa: 'chand', shaadi: 'sindoor', fun: 'aurora' };
const clean = (s: string) => s.replace(/[<>\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim();

export default function QuizClient({ meta, isNew }: { meta: QuizMeta; isNew: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('boot');
  const [selected, setSelected] = useState<string | null>(null);
  const [nick, setNick] = useState('');
  const [anon, setAnon] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [creatorKey, setCreatorKey] = useState<string | null>(null);
  const [pickName, setPickName] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const occ = occasionMeta(meta.occasion);
  const url = `${origin}/q/${meta.id}`;
  const host = origin ? origin.replace(/^https?:\/\//, '') : SITE_HOST;

  useEffect(() => {
    setOrigin(window.location.origin);
    const l = getLocal(meta.id);
    setCreatorKey(l?.creatorKey || null);
    setPickName(l?.pickName || null);
    if (l?.nick) setNick(l.nick);
    let alive = true;
    resultsApi(meta.id, getDeviceToken()).then((r) => {
      if (!alive) return;
      if (r.ok) {
        setResults(r.data);
        setPhase('results');
        if (!l?.pickName) {
          /* local record cleared; results still available */
        }
      } else setPhase('vote');
    });
    return () => {
      alive = false;
    };
  }, [meta.id]);

  // quiet live refresh while viewing results
  useEffect(() => {
    if (phase !== 'results') return;
    const id = setInterval(() => {
      if (document.hidden) return;
      resultsApi(meta.id, getDeviceToken()).then((r) => r.ok && setResults(r.data));
    }, 12000);
    return () => clearInterval(id);
  }, [phase, meta.id]);

  const rows = useMemo(() => {
    if (!results) return [];
    return meta.candidates
      .map((c) => {
        const votes = results.tallies[c.id] || 0;
        return { id: c.id, name: c.name, votes, pct: results.total ? Math.round((votes / results.total) * 100) : 0 };
      })
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
  }, [results, meta.candidates]);

  const total = results?.total ?? 0;
  const v = verdict(rows, total);
  const nameOf = useCallback((id: string) => meta.candidates.find((c) => c.id === id)?.name || '?', [meta.candidates]);

  const buildData = useCallback(
    (kind: CardKind): CardData => ({
      kind,
      appName: APP_NAME,
      company: COMPANY_NAME,
      host,
      linkText: `${host}/q/${meta.id}`,
      subjectName: meta.subjectName,
      gender: meta.subjectGender,
      occasion: meta.occasion,
      rows: rows.map((r) => ({ name: r.name, votes: r.votes, pct: r.pct })),
      total,
      contenders: meta.candidates.length,
      pick: pickName || undefined,
      headline: headline(meta.subjectName, meta.occasion),
      verdictLabel: v.label,
      verdictEmoji: v.emoji,
    }),
    [host, meta, rows, total, pickName, v.label, v.emoji],
  );

  const kinds: CardKind[] = useMemo(() => (pickName ? ['result', 'invite', 'pick'] : ['result', 'invite']), [pickName]);

  const submitVote = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setErr('');
    const nickClean = anon ? '' : clean(nick).slice(0, LIMITS.maxNick);
    const res = await voteApi(meta.id, { voterToken: getDeviceToken(), candidateId: selected, nick: nickClean });
    if (res.ok || res.status === 409) {
      let data = res.ok ? res.data : null;
      if (!data) {
        const again = await resultsApi(meta.id, getDeviceToken());
        if (again.ok) data = again.data;
      }
      if (data) {
        const name = nameOf(selected);
        if (res.ok) {
          setLocal(meta.id, { pickId: selected, pickName: name, nick: nickClean, subjectName: meta.subjectName });
          addHistory({ id: meta.id, subjectName: meta.subjectName, role: 'voter' });
          setPickName(name);
        }
        setConfirm(false);
        setBusy(false);
        setResults(data);
        setPhase('results');
        if (res.ok) {
          setRevealing(true);
          navigator.vibrate?.([20, 40, 20]);
          setTimeout(() => {
            setRevealing(false);
            burst();
          }, 1700);
        } else toast('You had already voted. Here are the results.', '🔒');
        return;
      }
    }
    setBusy(false);
    setConfirm(false);
    setErr(res.ok ? 'Could not load results.' : res.error);
  };

  const doDelete = async () => {
    if (!creatorKey) return;
    const r = await deleteApi(meta.id, creatorKey);
    if (r.ok) {
      clearLocal(meta.id);
      toast('Poll deleted for everyone', '🗑️');
      router.push('/');
    } else toast(r.error, '⚠️');
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(meta.expiresAt).getTime() - Date.now()) / 86_400_000));
  const isCreator = !!creatorKey;
  const winner = rows[0];

  return (
    <div className="wrap quiz">
      {phase === 'boot' && (
        <div className="boot">
          <div className="loader" />
          <p className="muted">Opening the sealed envelope…</p>
        </div>
      )}

      {phase === 'vote' && (
        <>
          <section className="stack enter" style={{ '--gap': '20px' } as CSSProperties}>
            <div className="vote-hero">
              <div className="lock-orb" aria-hidden="true">
                <span>🔒</span>
              </div>
              <p className="eyebrow">
                {occ.emoji} {occ.label} poll
              </p>
              <h1 className="h1">{headline(meta.subjectName, meta.occasion)}</h1>
              <p className="lead">
                {meta.voteCount} {meta.voteCount === 1 ? 'friend has' : 'friends have'} voted. Everyone&apos;s picks stay sealed until you vote, and your vote is final.
              </p>
            </div>
            <div className="cand-list">
              {meta.candidates.map((c, i) => (
                <CandCard key={c.id} name={c.name} idx={i} selected={selected === c.id} onClick={() => setSelected(c.id)} />
              ))}
            </div>
            <div className="glass card stack" style={{ '--gap': '14px' } as CSSProperties}>
              <label className="field">
                <span className="label">Your name (friends see it after they vote)</span>
                <input className="input" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={LIMITS.maxNick} placeholder="e.g. Sam" disabled={anon} autoComplete="off" />
              </label>
              <label className="switch-row">
                <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
                <span className="switch" aria-hidden="true" />
                <span>Vote anonymously</span>
              </label>
            </div>
            {err && <div className="alert" role="alert">⚠️ {err}</div>}
            <p className="tiny muted center">🛡️ No sign-up. Your device keeps your keys. This poll auto-deletes in {Math.max(daysLeft, 1)} day{daysLeft === 1 ? '' : 's'}.</p>
          </section>
          <div className="sticky-bar">
            <div className="sticky-row">
              <button className="btn btn-primary btn-lg btn-block" disabled={!selected} onClick={() => setConfirm(true)}>
                {selected ? 'Lock my vote 🔒' : 'Pick someone first 👆'}
              </button>
            </div>
          </div>
        </>
      )}

      {phase === 'results' && results && (
        <section className="stack" style={{ '--gap': '22px' } as CSSProperties}>
          {isNew && isCreator && <div className="live-banner enter">🎉 Your poll is live. Send it to the squad below.</div>}
          <div className="res-hero enter">
            <p className="eyebrow">
              {v.emoji} {v.label}
            </p>
            <h1 className="h1">{total && winner ? `${winner.name} is leading` : 'No votes yet'}</h1>
            <p className="lead">{v.line}</p>
          </div>

          <div className="res-list">
            {rows.map((r, i) => (
              <div key={r.id} className={`res-row ${i === 0 && total > 0 ? 'win' : ''}`} style={{ '--i': i } as CSSProperties}>
                {i === 0 && total > 0 && <span className="crown" aria-hidden="true">👑</span>}
                <Avatar name={r.name} idx={meta.candidates.findIndex((c) => c.id === r.id)} size={46} />
                <div className="res-main">
                  <div className="res-top">
                    <b>{r.name}</b>
                    <span className="res-pct">
                      <CountUp to={r.pct} delay={i * 120} suffix="%" />
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ '--w': `${Math.max(r.pct, r.votes ? 4 : 0)}%`, '--d': `${i * 120}ms` } as CSSProperties} />
                  </div>
                  <small className="muted">
                    {r.votes} vote{r.votes === 1 ? '' : 's'}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-lg btn-block pulse" onClick={() => setShareOpen(true)}>
            Invite more friends 🚀
          </button>

          <details className="glass card voters">
            <summary>Who voted for whom ({results.voters.length})</summary>
            <ul>
              {results.voters.map((vt, i) => (
                <li key={i} style={{ '--i': i } as CSSProperties}>
                  <span>{vt.nick || 'Secret friend 🤫'}</span>
                  <span className="muted">→ {nameOf(vt.candidateId)}</span>
                </li>
              ))}
            </ul>
          </details>

          <div className="stack" style={{ '--gap': '14px' } as CSSProperties}>
            <h2 className="h2">Make it a story 🎬</h2>
            <CardStudio
              buildData={buildData}
              kinds={kinds}
              initialKind={isNew && isCreator ? 'invite' : 'result'}
              defaultDesign={DEFAULT_DESIGN[meta.occasion] || 'aurora'}
              shareUrl={url}
              shareText={shareText(meta.subjectName, meta.occasion)}
              fileBase={`${APP_NAME}-${meta.subjectName}`}
            />
          </div>

          <div className="glass card cta-card">
            <h3 className="h3">Got a friend who needs a squad? 💘</h3>
            <p className="muted">Make your own secret poll in under a minute.</p>
            <Link href="/create" className="btn btn-ghost btn-block">
              Start my poll
            </Link>
          </div>

          {isCreator && (
            <div className="danger-zone">
              {!confirmDelete ? (
                <button className="link-btn danger" onClick={() => setConfirmDelete(true)}>
                  Delete this poll for everyone
                </button>
              ) : (
                <div className="row center">
                  <button className="btn btn-danger btn-sm" onClick={doDelete}>
                    Yes, delete it
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>
                    Keep it
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="tiny muted center">
            ⏳ This poll and its votes delete themselves in {Math.max(daysLeft, 1)} day{daysLeft === 1 ? '' : 's'}.{' '}
            <Link href="/opt-out">Listed here and want out?</Link>
          </p>
        </section>
      )}

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} url={url} text={shareText(meta.subjectName, meta.occasion)} />

      {confirm && (
        <div className="sheet-backdrop" onClick={() => !busy && setConfirm(false)} role="presentation">
          <div className="sheet confirm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="confirm-pick">
              <Avatar name={nameOf(selected || '')} idx={Math.max(0, meta.candidates.findIndex((c) => c.id === selected))} size={72} />
              <h3 className="h2">{nameOf(selected || '')}?</h3>
            </div>
            <p className="muted center">This is final. You cannot change your vote later.</p>
            <button className="btn btn-primary btn-lg btn-block" onClick={submitVote} disabled={busy}>
              {busy ? 'Locking…' : 'Lock it in 🔒'}
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setConfirm(false)} disabled={busy}>
              Go back
            </button>
          </div>
        </div>
      )}

      {revealing && (
        <div className="unseal" role="status">
          <div className="unseal-lock">
            <span className="shackle">🔓</span>
          </div>
          <p>Unsealing everyone&apos;s votes…</p>
        </div>
      )}
    </div>
  );
}
