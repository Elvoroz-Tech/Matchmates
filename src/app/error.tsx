'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap center-page">
      <div className="glass card center enter">
        <div className="big-emoji">😵</div>
        <h1 className="h2">Something broke</h1>
        <p className="muted">Nothing is lost. Give it another go.</p>
        <button className="btn btn-primary btn-lg btn-block" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
