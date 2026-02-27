import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import HuntTerminal from "./HuntTerminal";

export default async function PersonalHuntPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const { data: items } = await supabaseAdmin
    .from("pulse_inventory")
    .select("*")
    .order("created_at", { ascending: false });

  return <HuntTerminal initialItems={items || []} />;
}
