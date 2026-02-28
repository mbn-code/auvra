import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import StableDashboardClient from "./StableDashboardClient";

export const dynamic = 'force-dynamic';

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

export default async function StableAdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdmin || !user || !ALLOWED_UIDS.includes(user.id)) {
    redirect("/admin/login");
  }

  const { data: items } = await supabase
    .from("pulse_inventory")
    .select("*")
    .eq("is_stable", true)
    .order("created_at", { ascending: false });

  return <StableDashboardClient initialItems={items || []} />;
}
