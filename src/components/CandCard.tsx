'use client';
import type { CSSProperties } from 'react';
import Avatar from './Avatar';

export default function CandCard({
  name,
  idx,
  selected,
  onClick,
  disabled,
}: {
  name: string;
  idx: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`cand ${selected ? 'sel' : ''}`}
      style={{ '--i': idx } as CSSProperties}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <Avatar name={name} idx={idx} size={52} />
      <span className="cand-name">{name}</span>
      <span className="cand-check" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}
