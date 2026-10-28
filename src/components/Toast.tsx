'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface T {
  id: number;
  msg: string;
  emoji?: string;
}
const Ctx = createContext<(msg: string, emoji?: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((msg: string, emoji?: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-2), { id, msg, emoji }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="toast">
            {t.emoji && <span className="toast-emoji">{t.emoji}</span>}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
