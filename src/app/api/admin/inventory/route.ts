import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

const ALLOWED_STATUS_FILTERS = new Set(["pending_review", "available", "archived", "sold"]);

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (!status || !ALLOWED_STATUS_FILTERS.has(status)) {
    return NextResponse.json(
      { error: `Invalid or missing status filter. Allowed: ${[...ALLOWED_STATUS_FILTERS].join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("pulse_inventory")
    .select("*")
    .eq("status", status)
    .order("potential_profit", { ascending: false });

  if (error) {
    console.error("[Inventory Fetch Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
