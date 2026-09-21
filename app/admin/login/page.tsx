import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { AdminLogin } from "@/components/admin/admin-login";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await requireRole("ADMIN");
  if (admin) redirect("/admin");
  return <AdminLogin />;
}
