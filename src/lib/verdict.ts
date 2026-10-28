export interface Verdict {
  label: string;
  emoji: string;
  line: string;
}

export function verdict(rows: { votes: number }[], total: number): Verdict {
  if (total === 0) return { label: 'Waiting for votes', emoji: '⏳', line: 'Be the first to lock a vote.' };
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  const top = sorted[0]?.votes ?? 0;
  const second = sorted[1]?.votes ?? 0;
  const share = top / total;
  if (total < 3) return { label: 'Early days', emoji: '🌱', line: 'Only a few votes so far — more friends can still swing it.' };
  if (top === second) return { label: 'Too close to call', emoji: '⚖️', line: 'A dead heat. The squad needs a tie-breaker.' };
  if (share >= 0.75) return { label: 'Landslide', emoji: '🔥', line: 'The squad has spoken, loudly.' };
  if (share >= 0.5) return { label: 'Clear favourite', emoji: '👑', line: 'A majority is already on the same page.' };
  if (top - second <= 1) return { label: 'Neck and neck', emoji: '😮', line: 'One vote could flip this.' };
  return { label: 'Squad is split', emoji: '🎭', line: 'Opinions are all over the place.' };
}
