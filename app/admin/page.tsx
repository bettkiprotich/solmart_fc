import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireRole("ADMIN");
  if (!admin) redirect("/admin/login");
  return <AdminDashboard admin={admin} />;
}
