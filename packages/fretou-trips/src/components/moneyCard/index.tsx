export function MoneyCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white px-5 py-4 shadow-[0_10px_30px_rgba(13,32,86,0.06)]">
      <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-navy">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </article>
  );
}