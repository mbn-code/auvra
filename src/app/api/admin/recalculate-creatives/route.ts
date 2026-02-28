import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    let isAuthorized = false;
    
    if (adminSecret === process.env.CRON_SECRET && process.env.CRON_SECRET) {
      isAuthorized = true;
    } else {
      const isAdmin = await verifyAdmin();
      if (isAdmin) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabaseAdmin.rpc('recalculate_creative_rankings');

    if (error) {
      console.error("[Rankings RPC] Error:", error);
      return NextResponse.json({ error: "Failed to recalculate rankings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Rankings recalculated successfully" });
  } catch (error: any) {
    console.error("[Rankings Route] Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
