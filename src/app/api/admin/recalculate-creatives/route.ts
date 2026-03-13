import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabaseAdmin.rpc('recalculate_creative_rankings');

    if (error) {
      console.error("[Rankings RPC] Error:", error);
      return NextResponse.json({ error: "Failed to recalculate rankings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Rankings recalculated successfully" });
  } catch (error: unknown) {
    console.error("[Rankings Route] Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
