export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="logo">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3d81" />
          <stop offset=".6" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ffc233" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#logo-g)" />
      <path d="M30 11a13.5 13.5 0 1 0 6.5 23A11.5 11.5 0 0 1 30 11z" fill="#fff" opacity=".96" />
      <circle cx="34" cy="14" r="2.3" fill="#fff" />
    </svg>
  );
}
