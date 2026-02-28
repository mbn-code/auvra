import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * NEURAL INJECTIONS API
 * Returns the latest 10 items added to the archive for the "Story" bar.
 */
export async function GET(req: NextRequest) {
  try {
    const { data: items, error } = await supabaseAdmin
      .from("pulse_inventory")
      .select("id, title, images, brand, created_at")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[Injections API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
