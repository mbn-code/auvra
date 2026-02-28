import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin";
import StableDashboardClient from "./StableDashboardClient";

export const dynamic = 'force-dynamic';

export default async function StableAdminPage() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("pulse_inventory")
    .select("*")
    .eq("is_stable", true)
    .order("created_at", { ascending: false });

  return <StableDashboardClient initialItems={items || []} />;
}
