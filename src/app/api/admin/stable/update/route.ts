import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

// ─────────────────────────────────────────────────────────────────────────────
// Explicit whitelist of fields that the admin UI is permitted to update.
// Any key sent in the request body that is NOT in this set is silently
// dropped before the Supabase call, preventing over-posting attacks
// (e.g. overwriting `embedding`, `stripe_customer_id`, `is_stable`, etc.).
// To allow a new field to be edited, it must be consciously added here.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_UPDATE_FIELDS = new Set([
  "title",
  "brand",
  "category",
  "listing_price",
  "member_price",
  "early_bird_price",
  "early_bird_limit",
  "preorder_price",
  "source_price",
  "potential_profit",
  "stock_level",
  "images",
  "status",
  "pre_order_status",
  "description",
  "condition",
]);

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...rawUpdates } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Build a clean update object from only whitelisted keys.
    const updates: Record<string, unknown> = {};
    for (const key of Object.keys(rawUpdates)) {
      if (ALLOWED_UPDATE_FIELDS.has(key)) {
        updates[key] = rawUpdates[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pulse_inventory")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Stable Update Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
