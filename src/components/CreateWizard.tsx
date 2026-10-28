'use client';
import { useRouter } from 'next/navigation';
import { useState, type CSSProperties } from 'react';
import CandCard from './CandCard';
import { useToast } from './Toast';
import { contenderWord, OCCASIONS } from '@/lib/copy';
import { LIMITS } from '@/lib/config';
import type { Gender, Occasion } from '@/lib/types';
import { createQuizApi } from '@/lib/client/api';
import { addHistory, getDeviceToken, setLocal } from '@/lib/client/device';
import { burst } from '@/lib/client/confetti';

const clean = (s: string) => s.replace(/[<>\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim();
const STEPS = ['Your friend', 'The contenders', 'Your vote'];

export default function CreateWizard() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [occasion, setOccasion] = useState<Occasion>('karwa');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [nick, setNick] = useState('');
  const [anon, setAnon] = useState(false);
  const [cands, setCands] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [pick, setPick] = useState<number | null>(null);
  const [adult, setAdult] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const subject = clean(name);
  const canNext = step === 0 ? subject.length >= 1 && !!gender : step === 1 ? cands.length >= LIMITS.minCandidates : pick !== null && adult;

  const go = (n: number) => {
    setDir(n > step ? 'fwd' : 'back');
    setStep(n);
    setErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const add = () => {
    const v = clean(draft).slice(0, LIMITS.maxName);
    if (!v) return;
    if (cands.length >= LIMITS.maxCandidates) return toast(`Max ${LIMITS.maxCandidates} contenders`, '🛑');
    if (cands.some((c) => c.toLowerCase() === v.toLowerCase())) return toast('Already on the list', '👀');
    setCands([...cands, v]);
    setPick(null);
    setDraft('');
    navigator.vibrate?.(10);
  };
  const remove = (i: number) => {
    setCands(cands.filter((_, k) => k !== i));
    setPick(null);
  };

  const submit = async () => {
    if (busy || pick === null || !gender) return;
    setBusy(true);
    setErr('');
    const res = await createQuizApi({
      subjectName: subject,
      subjectGender: gender,
      occasion,
      candidates: cands,
      nick: anon ? '' : clean(nick).slice(0, LIMITS.maxNick),
      pickIndex: pick,
      voterToken: getDeviceToken(),
      website: hp,
    });
    if (!res.ok) {
      setBusy(false);
      setErr(res.error);
      return;
    }
    const { id, creatorKey, pickId } = res.data;
    setLocal(id, { creatorKey, pickId, pickName: cands[pick], nick: anon ? '' : clean(nick), subjectName: subject });
    addHistory({ id, subjectName: subject, role: 'creator' });
    burst();
    router.push(`/q/${id}?new=1`);
  };

  const word = gender ? contenderWord(gender) : 'people';

  return (
    <div className="wrap wizard">
      <div className="progress" aria-label={`Step ${step + 1} of 3`}>
        {STEPS.map((s, i) => (
          <div key={s} className={`seg ${i <= step ? 'on' : ''} ${i === step ? 'cur' : ''}`}>
            <i />
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div key={step} className={`step ${dir}`}>
        {step === 0 && (
          <div className="stack" style={{ '--gap': '22px' } as CSSProperties}>
            <h1 className="h1">Who are we matchmaking? 👀</h1>
            <div>
              <p className="ctl-label">Vibe</p>
              <div className="occ-grid">
                {OCCASIONS.map((o, i) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`occ ${occasion === o.id ? 'on' : ''}`}
                    style={{ '--i': i } as CSSProperties}
                    onClick={() => setOccasion(o.id)}
                    aria-pressed={occasion === o.id}
                  >
                    <span className="occ-emoji">{o.emoji}</span>
                    <b>{o.label}</b>
                    <small>{o.blurb}</small>
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="label">Your friend&apos;s first name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.maxName} placeholder="e.g. Aanya" autoComplete="off" />
            </label>
            <div>
              <p className="ctl-label">They are a…</p>
              <div className="gender-grid">
                {(['female', 'male'] as Gender[]).map((g) => (
                  <button key={g} type="button" className={`gender ${gender === g ? 'on' : ''}`} onClick={() => setGender(g)} aria-pressed={gender === g}>
                    <span>{g === 'female' ? '👩' : '👨'}</span>
                    {g === 'female' ? 'Girl' : 'Boy'}
                  </button>
                ))}
              </div>
              {gender && <p className="tiny muted pop-in">We will line up {contenderWord(gender)} as the contenders 💘</p>}
            </div>
            <label className="field">
              <span className="label">Your name (shown to friends who vote)</span>
              <input className="input" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={LIMITS.maxNick} placeholder="e.g. Riya" disabled={anon} autoComplete="off" />
            </label>
            <label className="switch-row">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              <span className="switch" aria-hidden="true" />
              <span>Keep me anonymous</span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="stack" style={{ '--gap': '20px' } as CSSProperties}>
            <h1 className="h1">
              Who are the {word} for {subject || 'them'}? 💘
            </h1>
            <p className="lead">Add {LIMITS.minCandidates}–{LIMITS.maxCandidates} names. First names are plenty.</p>
            <div className="add-row">
              <input
                className="input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                maxLength={LIMITS.maxName}
                placeholder="Type a name, hit enter"
                autoComplete="off"
              />
              <button type="button" className="btn btn-primary" onClick={add}>
                Add
              </button>
            </div>
            <div className="chips wrap-chips">
              {cands.map((c, i) => (
                <span key={c} className="chip pop-in" style={{ '--i': i } as CSSProperties}>
                  {c}
                  <button type="button" onClick={() => remove(i)} aria-label={`Remove ${c}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            {cands.length === 0 && <div className="empty">👀 Nobody yet. Add the first contender above.</div>}
            <p className="tiny muted">{cands.length}/{LIMITS.maxCandidates} added</p>
          </div>
        )}

        {step === 2 && (
          <div className="stack" style={{ '--gap': '20px' } as CSSProperties}>
            <h1 className="h1">Now cast your own vote 🔒</h1>
            <p className="lead">Your pick stays sealed from everyone until they vote too. It is final once the poll is live.</p>
            <div className="cand-list">
              {cands.map((c, i) => (
                <CandCard key={c} name={c} idx={i} selected={pick === i} onClick={() => setPick(i)} />
              ))}
            </div>
            <label className="switch-row">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
              <span className="switch" aria-hidden="true" />
              <span>I am 18+ and everyone listed is an adult who would find this fun.</span>
            </label>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
            {err && <div className="alert" role="alert">⚠️ {err}</div>}
          </div>
        )}
      </div>

      <div className="sticky-bar">
        <div className="sticky-row">
          {step > 0 && (
            <button className="btn btn-ghost btn-lg" onClick={() => go(step - 1)} disabled={busy} aria-label="Back">
              ←
            </button>
          )}
          {step < 2 ? (
            <button className="btn btn-primary btn-lg btn-block" disabled={!canNext} onClick={() => go(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" disabled={!canNext || busy} onClick={submit}>
              {busy ? 'Creating…' : 'Launch the poll 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
