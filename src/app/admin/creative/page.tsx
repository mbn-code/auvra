import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";
import CreativeDashboardClient from "./CreativeDashboardClient";

export const dynamic = 'force-dynamic';

export default async function CreativeDashboard() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  // Fetch rankings
  const { data: rankings } = await supabaseAdmin
    .from('creative_rankings')
    .select(`
      *,
      creative_nodes (
        id,
        thumbnail_url,
        platform,
        format,
        duration_sec,
        posted_at
      )
    `)
    .order('rank', { ascending: true })
    .limit(20);

  // Fetch aggregated stats for the top-level numbers
  const { data: stats } = await supabaseAdmin
    .from('creative_scores')
    .select('views, drags, checkouts, purchases');

  const totalViews = stats?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
  const totalRevenue = stats?.reduce((acc, curr) => acc + ((curr.purchases || 0) * 85), 0) || 0; // Rough estimate if revenue column isn't perfectly populated yet

  return (
    <CreativeDashboardClient 
      rankings={rankings || []} 
      totalViews={totalViews}
      totalRevenue={totalRevenue}
    />
  );
}
