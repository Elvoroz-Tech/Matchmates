// All of this lives ONLY in the visitor's own browser storage.
const P = 'vq:';
let mem: string | null = null;

export function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getDeviceToken(): string {
  try {
    let t = localStorage.getItem(P + 'device');
    if (!t || !/^[a-f0-9]{32,64}$/.test(t)) {
      t = randomHex(24);
      localStorage.setItem(P + 'device', t);
    }
    return t;
  } catch {
    if (!mem) mem = randomHex(24);
    return mem;
  }
}

export interface LocalQuiz {
  pickId?: string;
  pickName?: string;
  nick?: string;
  creatorKey?: string;
  subjectName?: string;
  ts?: number;
}

export function getLocal(id: string): LocalQuiz | null {
  try {
    const raw = localStorage.getItem(`${P}quiz:${id}`);
    return raw ? (JSON.parse(raw) as LocalQuiz) : null;
  } catch {
    return null;
  }
}

export function setLocal(id: string, patch: LocalQuiz) {
  try {
    const cur = getLocal(id) || {};
    localStorage.setItem(`${P}quiz:${id}`, JSON.stringify({ ...cur, ...patch, ts: Date.now() }));
  } catch {
    /* storage unavailable */
  }
}

export function clearLocal(id: string) {
  try {
    localStorage.removeItem(`${P}quiz:${id}`);
    const h = getHistory().filter((x) => x.id !== id);
    localStorage.setItem(P + 'history', JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

export interface HistoryItem {
  id: string;
  subjectName: string;
  role: 'creator' | 'voter';
  ts: number;
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(P + 'history');
    const arr = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addHistory(item: Omit<HistoryItem, 'ts'>) {
  try {
    const list = getHistory().filter((x) => x.id !== item.id);
    list.unshift({ ...item, ts: Date.now() });
    localStorage.setItem(P + 'history', JSON.stringify(list.slice(0, 20)));
  } catch {
    /* ignore */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(P + 'history');
  } catch {
    /* ignore */
  }
}

export interface StudioPrefs {
  design?: string;
  anim?: string;
  format?: string;
}
export function getPrefs(): StudioPrefs {
  try {
    const raw = localStorage.getItem(P + 'prefs');
    return raw ? (JSON.parse(raw) as StudioPrefs) : {};
  } catch {
    return {};
  }
}
export function setPrefs(p: StudioPrefs) {
  try {
    localStorage.setItem(P + 'prefs', JSON.stringify({ ...getPrefs(), ...p }));
  } catch {
    /* ignore */
  }
}
