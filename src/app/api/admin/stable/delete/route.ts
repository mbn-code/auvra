import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

    const { data: { user } } = await supabaseAdmin.auth.getUser();

    if (!isAdmin || !user || !ALLOWED_UIDS.includes(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Soft delete by setting status to 'archived' and removing is_stable
    const { error } = await supabaseAdmin
      .from("pulse_inventory")
      .update({ status: 'archived', is_stable: false })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Stable Delete Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
