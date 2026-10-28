import type { ReactNode } from 'react';

export default function StaticPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <article className="wrap prose-page">
      <header className="enter">
        <h1 className="h1">{title}</h1>
        {intro && <p className="lead">{intro}</p>}
      </header>
      <div className="prose enter" style={{ '--i': 2 } as React.CSSProperties}>
        {children}
      </div>
    </article>
  );
}
