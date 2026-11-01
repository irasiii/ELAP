export default function Loading() {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>…</span>
    </div>
  );
}
