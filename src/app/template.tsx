export default function Template({ children }: { children: React.ReactNode }) {
  // fill-mode "backwards" (not "both"): once the entrance animation ends, no transform/filter
  // is left applied to this wrapper. A lingering transform turns the wrapper into the
  // containing block for every `position: fixed` child (share sheet, vote bar), which pushes
  // them to the bottom of the long results page, off-screen.
  return (
    <div className="page-enter" style={{ animationFillMode: 'backwards' }}>
      {children}
    </div>
  );
}