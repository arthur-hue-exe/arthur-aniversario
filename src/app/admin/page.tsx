import { redirect } from "next/navigation";

import { hasAdminSession } from "@/lib/auth";
import { listAdminGuests } from "@/lib/guest-service";

import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const guests = await listAdminGuests();

  return <AdminDashboard initialGuests={guests} />;
}
