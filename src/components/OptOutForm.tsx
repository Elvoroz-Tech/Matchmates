'use client';
import { useState } from 'react';
import { optoutApi } from '@/lib/client/api';

export default function OptOutForm() {
  const [ref, setRef] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    setErr('');
    const r = await optoutApi({ ref, name, contact, reason, website: hp });
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr(r.error);
  };

  if (done)
    return (
      <div className="glass card center pop-in">
        <div className="big-emoji">✅</div>
        <h2 className="h3">Request received</h2>
        <p className="muted">We will review it and remove the name or poll. Add a contact above next time if you want a reply.</p>
      </div>
    );

  return (
    <div className="glass card stack" style={{ '--gap': '16px' } as React.CSSProperties}>
      <label className="field">
        <span className="label">Poll link or ID</span>
        <input className="input" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={300} placeholder="https://…/q/abcdefghjk" />
      </label>
      <label className="field">
        <span className="label">Your name as listed (optional)</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </label>
      <label className="field">
        <span className="label">Email or phone for a reply (optional)</span>
        <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={150} />
      </label>
      <label className="field">
        <span className="label">What should we do? (optional)</span>
        <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={600} />
      </label>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
      {err && <div className="alert" role="alert">⚠️ {err}</div>}
      <button className="btn btn-primary btn-lg btn-block" disabled={busy || ref.trim().length < 3} onClick={submit}>
        {busy ? 'Sending…' : 'Send opt-out request'}
      </button>
    </div>
  );
}
