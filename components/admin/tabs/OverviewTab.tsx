import { OverviewMetrics, cardClass } from "./shared";

export function OverviewTab({ metrics }: { metrics: OverviewMetrics | null }) {
  if (!metrics) return <div className={cardClass}>No metrics loaded.</div>;
  const cards = [
    ["Users", metrics.users],
    ["Active products", metrics.activeProducts],
    ["Active players", metrics.activePlayers],
    ["Upcoming matches", metrics.upcomingMatches],
    ["Orders", metrics.orders],
    ["New messages", metrics.pendingContacts],
    ["Recognized revenue", `KES ${metrics.revenue}`],
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div className={cardClass} key={String(l)}>
            <p className="text-xs font-black uppercase tracking-widest text-black/45">{l}</p>
            <p className="mt-3 text-3xl font-black">{v}</p>
          </div>
        ))}
      </div>
      <div className={`${cardClass} mt-5`}>
        <h2 className="text-xl font-black">Admin control centre</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60">
          Maintain live club information from here. Uploaded images are validated and stored through the Vercel Blob layer. M-Pesa remains deferred.
        </p>
      </div>
    </div>
  );
}
