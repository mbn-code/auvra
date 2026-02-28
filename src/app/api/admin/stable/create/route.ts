import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_session")?.value === "authenticated";

    const { data: { user } } = await supabaseAdmin.auth.getUser();

    if (!isAdmin || !user || !ALLOWED_UIDS.includes(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      brand, 
      listing_price, 
      member_price, 
      source_cost, 
      stock_level, 
      images, 
      category 
    } = body;

    const { data, error } = await supabaseAdmin
      .from("pulse_inventory")
      .insert({
        vinted_id: `stable_${Date.now()}`, // Placeholder for unique constraint
        title,
        brand,
        listing_price: parseFloat(listing_price),
        member_price: member_price ? parseFloat(member_price) : null,
        source_price: parseFloat(source_cost),
        potential_profit: parseFloat(listing_price) - parseFloat(source_cost),
        stock_level: parseInt(stock_level),
        images,
        category,
        is_stable: true,
        status: 'available',
        is_auto_approved: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Stable Create Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
