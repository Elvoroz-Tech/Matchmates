import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap center-page">
      <div className="glass card center enter">
        <div className="big-emoji">🌑</div>
        <h1 className="h2">This poll is gone</h1>
        <p className="muted">It expired, was deleted by its creator, or the link has a typo.</p>
        <Link href="/create" className="btn btn-primary btn-lg btn-block">
          Start a new poll
        </Link>
      </div>
    </div>
  );
}
