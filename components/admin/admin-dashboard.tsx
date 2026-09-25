"use client";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Home, ShoppingCart, Package, Users, Shield, Trophy, ListOrdered, Swords, Activity, Newspaper, Image as ImageIcon, Briefcase, FileText, Settings, MessageSquare } from "lucide-react";
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
import { TeamsTab } from "./tabs/TeamsTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { StatsTab } from "./tabs/StatsTab";
import { TableTab } from "./tabs/TableTab";
import { CompetitionsTab } from "./tabs/CompetitionsTab";
import { api, AdminUser, OverviewMetrics, AnyRecord } from "./tabs/shared";

const tabs = ["Overview", "Orders", "Products", "Players", "Teams", "Tournaments", "Table", "Matches", "Stats", "News", "Media", "Sponsors", "Documents", "Settings", "Messages", "Users"] as const;
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
          Teams: "teams",
          Tournaments: "competitions",
          Table: "league-table",
          Matches: "matches",
          Stats: "stats",
          News: "news",
          Media: "media",
          Sponsors: "sponsors",
          Documents: "documents",
          Settings: "settings",
          Messages: "contact-messages",
          Users: "users",
        };
        // Special cases
        if (t === "Stats") {
          const [statsData, playersData] = await Promise.all([
            api("/api/admin/stats"),
            api("/api/admin/players")
          ]);
          setData({ stats: statsData.stats, players: playersData.players });
        } else if (t === "Tournaments" || t === "Teams") {
          const [compsData, teamsData] = await Promise.all([
            api("/api/admin/competitions"),
            api("/api/admin/teams")
          ]);
          setData({ competitions: compsData.competitions, teams: teamsData.teams });
        } else {
          setData(await api(`/api/admin/${map[t]}`));
        }
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="flex h-screen bg-neutral-50 overflow-hidden text-black font-sans">
      <Toaster position="top-right" richColors />
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 shrink-0">
          <div className="flex justify-between items-center lg:hidden mb-6">
            <h1 className="text-xl font-black">Admin</h1>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-white/50 hover:text-white">✕</button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[.25em] text-red-500">Solmart FC</p>
          <h2 className="mt-1 text-2xl font-black">Dashboard</h2>
          <div className="mt-6 pt-6 border-t border-white/10 text-sm">
            <strong className="block truncate">{admin.firstName || admin.email}</strong>
            <span className="text-xs text-white/50">{admin.role}</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
          {tabs.map((t) => {
            const icons: any = {
              Overview: <Home size={18} />,
              Orders: <ShoppingCart size={18} />,
              Products: <Package size={18} />,
              Players: <Users size={18} />,
              Teams: <Shield size={18} />,
              Tournaments: <Trophy size={18} />,
              Table: <ListOrdered size={18} />,
              Matches: <Swords size={18} />,
              Stats: <Activity size={18} />,
              News: <Newspaper size={18} />,
              Media: <ImageIcon size={18} />,
              Sponsors: <Briefcase size={18} />,
              Documents: <FileText size={18} />,
              Settings: <Settings size={18} />,
              Messages: <MessageSquare size={18} />,
              Users: <Users size={18} />
            };

            return (
              <button
                key={t}
                onClick={() => { setTab(t); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  tab === t ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {icons[t]} {t}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b px-5 lg:px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-black/50 hover:text-black lg:hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <h2 className="text-xl font-black">{tab}</h2>
          </div>
          {loading && <div className="flex items-center gap-2 text-xs font-bold text-black/50"><div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> Loading</div>}
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8 bg-zinc-50/50">
          <div className="mx-auto max-w-6xl">
            {tab === "Overview" ? (
              <OverviewTab metrics={overview} />
            ) : tab === "Orders" ? (
              <OrdersTab rows={data.orders || []} mutate={mutate} />
            ) : tab === "Products" ? (
              <ProductsTab rows={data.products || []} mutate={mutate} />
            ) : tab === "Players" ? (
              <PlayersTab rows={data.players || []} teams={data.teams || []} mutate={mutate} />
            ) : tab === "Teams" ? (
              <TeamsTab rows={data.teams || []} competitions={data.competitions || []} mutate={mutate} />
            ) : tab === "Tournaments" ? (
              <CompetitionsTab rows={data.competitions || []} teams={data.teams || []} mutate={mutate} />
            ) : tab === "Table" ? (
              <TableTab data={data as any} refresh={load} />
            ) : tab === "Matches" ? (
              <MatchesTab rows={data.matches || []} teams={data.teams || []} competitions={data.competitions || []} mutate={mutate} />
            ) : tab === "Stats" ? (
              <StatsTab rows={data.stats || []} players={data.players || []} mutate={mutate} />
            ) : tab === "News" ? (
              <NewsTab rows={data.articles || []} categories={data.categories || []} mutate={mutate} />
            ) : tab === "Media" ? (
              <MediaTab galleries={data.galleries || []} videos={data.videos || []} mutate={mutate} />
            ) : tab === "Sponsors" ? (
              <SponsorsTab rows={data.sponsors || []} mutate={mutate} />
            ) : tab === "Documents" ? (
              <DocumentsTab rows={data.documents || []} mutate={mutate} />
            ) : tab === "Settings" ? (
              <SettingsTab rows={data.settings || []} mutate={mutate} />
            ) : tab === "Messages" ? (
              <MessagesTab rows={data.messages || []} mutate={mutate} />
            ) : (
              <UsersTab rows={data.users || []} mutate={mutate} admin={admin} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
