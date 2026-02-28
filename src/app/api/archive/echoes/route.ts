import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * NEURAL ECHOES API
 * Finds visually similar items in the archive using pgvector.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");
  const count = parseInt(searchParams.get("count") || "5");

  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  try {
    console.log(`[Echoes API] Fetching for product: ${productId}`);
    
    const { data: echoes, error } = await supabaseAdmin.rpc("find_neural_echoes", {
      source_product_id: productId,
      match_count: count
    });

    if (error) {
      console.error("[Echoes API] RPC Error:", error);
      throw error;
    }

    console.log(`[Echoes API] Found ${echoes?.length || 0} items`);
    return NextResponse.json({ echoes: echoes || [] });
  } catch (error: any) {
    console.error("[Echoes API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
