import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

// Statuses the admin UI is permitted to set directly.
// Dispatch and refund have their own dedicated routes that do additional work
// (send emails, issue Stripe refunds) — they are intentionally excluded here.
const ALLOWED_ORDER_STATUSES = new Set([
  "pending_secure",
  "secured",
  "awaiting_manufacturing_allocation",
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
    if (!status || !ALLOWED_ORDER_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${[...ALLOWED_ORDER_STATUSES].join(", ")}` },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Order Status Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
