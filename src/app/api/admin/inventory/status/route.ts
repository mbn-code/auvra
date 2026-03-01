import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

// Permitted status values the admin UI is allowed to set.
// Prevents the client from forcing arbitrary status strings into the DB.
const ALLOWED_STATUSES = new Set([
  "available",
  "pending_review",
  "archived",
  "sold",
]);

export async function PATCH(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json().catch(() => ({}));

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }
    if (!status || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(", ")}` },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("pulse_inventory")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Inventory Status Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk-approve all pending_review items — called by "Approve All" button.
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin
      .from("pulse_inventory")
      .update({ status: "available" })
      .eq("status", "pending_review");

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Inventory Approve All Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
