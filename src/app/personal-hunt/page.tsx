import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";
import HuntTerminal from "./HuntTerminal";

export default async function PersonalHuntPage() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const { data: items } = await supabaseAdmin
    .from("pulse_inventory")
    .select("*")
    .order("created_at", { ascending: false });

  return <HuntTerminal initialItems={items || []} />;
}
