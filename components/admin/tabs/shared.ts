export type AdminUser = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };
export type OverviewMetrics = { users: number; activeProducts: number; activePlayers: number; upcomingMatches: number; orders: number; pendingContacts: number; revenue: string };
export type AnyRecord = Record<string, any>;

export const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500";
export const cardClass = "rounded-2xl border border-black/10 bg-white p-5 shadow-sm";

export function slugPreview(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0, 180) || "your-slug";
}

export async function api(path: string, options?: RequestInit) {
  const r = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export async function upload(file: File, folder: "players" | "products" | "galleries" | "teams") {
  const f = new FormData();
  f.append("file", file);
  f.append("folder", folder);
  const r = await fetch("/api/admin/uploads", { method: "POST", body: f });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Image upload failed.");
  return d.url as string;
}

export async function uploadVideo(file: File) {
  const f = new FormData();
  f.append("file", file);
  f.append("folder", "videos");
  const r = await fetch("/api/admin/uploads", { method: "POST", body: f });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Video upload failed.");
  return d.url as string;
}
