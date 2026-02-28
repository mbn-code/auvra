import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

    const { data: { user } } = await supabaseAdmin.auth.getUser();

    if (!isAdmin || !user || !ALLOWED_UIDS.includes(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

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
