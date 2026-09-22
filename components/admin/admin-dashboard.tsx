"use client";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { OverviewTab } from "./tabs/OverviewTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { PlayersTab } from "./tabs/PlayersTab";
import { MatchesTab } from "./tabs/MatchesTab";
import { NewsTab } from "./tabs/NewsTab";
import { MediaTab } from "./tabs/MediaTab";
import { SponsorsTab } from "./tabs/SponsorsTab";
import { SettingsTab, MessagesTab } from "./tabs/SettingsTab";
import { UsersTab } from "./tabs/UsersTab";
import { api, AdminUser, OverviewMetrics, AnyRecord } from "./tabs/shared";

const tabs = ["Overview", "Orders", "Products", "Players", "Matches", "News", "Media", "Sponsors", "Settings", "Messages", "Users"] as const;
type Tab = typeof tabs[number];

export function AdminDashboard({ admin }: { admin: AdminUser }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [data, setData] = useState<AnyRecord>({});
  const [loading, setLoading] = useState(false);

  const load = async (t: Tab = tab) => {
    setLoading(true);
    try {
      if (t === "Overview") setOverview((await api("/api/admin/overview")).metrics);
      else {
        const map: any = {
          Orders: "orders",
          Products: "products",
          Players: "players",
          Matches: "matches",
          News: "news",
          Media: "media",
          Sponsors: "sponsors",
          Settings: "settings",
          Messages: "contact-messages",
          Users: "users",
        };
        setData(await api(`/api/admin/${map[t]}`));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("Overview");
  }, []);

  useEffect(() => {
    if (tab !== "Overview") load(tab);
  }, [tab]);

  // Use this for saving data and refreshing the current tab silently
  async function mutate(path?: string, method?: string, body?: any) {
    setLoading(true);
    try {
      if (path && method) {
        await api(path, { method, body: JSON.stringify(body) });
      }
      await load(tab); // Re-fetch the current tab
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save.");
      throw e; // Rethrow to let the tab handle specific UI state if needed
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <Toaster position="top-right" richColors />
      <div className="border-b border-black/10 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-red-500">Solmart FC</p>
              <h1 className="mt-2 text-3xl font-black">Club Admin</h1>
              <p className="mt-1 text-sm text-white/60">Content, squad, fixtures, commerce and customer operations.</p>
            </div>
            <div className="text-right text-sm">
              <strong>{admin.firstName || admin.email}</strong>
              <div className="text-white/50">{admin.role}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                tab === t ? "bg-red-600 text-white" : "border border-black/10 bg-white text-black/70 hover:bg-black/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        {loading && <p className="mt-4 text-sm text-black/50">Loading…</p>}
        
        <div className="mt-6">
          {tab === "Overview" ? (
            <OverviewTab metrics={overview} />
          ) : tab === "Orders" ? (
            <OrdersTab rows={data.orders || []} mutate={mutate} />
          ) : tab === "Products" ? (
            <ProductsTab rows={data.products || []} mutate={mutate} />
          ) : tab === "Players" ? (
            <PlayersTab rows={data.players || []} teams={data.teams || []} mutate={mutate} />
          ) : tab === "Matches" ? (
            <MatchesTab rows={data.matches || []} teams={data.teams || []} competitions={data.competitions || []} mutate={mutate} />
          ) : tab === "News" ? (
            <NewsTab rows={data.articles || []} categories={data.categories || []} mutate={mutate} />
          ) : tab === "Media" ? (
            <MediaTab galleries={data.galleries || []} videos={data.videos || []} mutate={mutate} />
          ) : tab === "Sponsors" ? (
            <SponsorsTab rows={data.sponsors || []} mutate={mutate} />
          ) : tab === "Settings" ? (
            <SettingsTab rows={data.settings || []} mutate={mutate} />
          ) : tab === "Messages" ? (
            <MessagesTab rows={data.messages || []} mutate={mutate} />
          ) : (
            <UsersTab rows={data.users || []} mutate={mutate} admin={admin} />
          )}
        </div>
      </div>
    </main>
  );
}
