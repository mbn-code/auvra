import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * USER VAULT API
 * Toggles an item in the user's personal archive vault.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("[Vault API] Unauthorized: No user session found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: "Valid Product ID required" }, { status: 400 });
    }

    console.log(`[Vault API] Toggle for User: ${user.id}, Product: ${productId}`);

    // 1. Check if item is already in vault
    const { data: existing, error: fetchError } = await supabase
      .from("user_vault")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (fetchError) {
      console.error("[Vault API] Fetch Error:", fetchError);
      throw fetchError;
    }

    if (existing) {
      // 2. Remove if it exists (Toggle off)
      const { error: deleteError } = await supabase
        .from("user_vault")
        .delete()
        .eq("id", existing.id);
      
      if (deleteError) console.error("[Vault API] Delete Error:", deleteError);
      return NextResponse.json({ action: "removed" });
    } else {
      // 3. Add if it doesn't exist (Toggle on)
      const { error: insertError } = await supabase
        .from("user_vault")
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (insertError) {
        console.error("[Vault API] Insert Error:", insertError);
        // Fallback: Try with admin client if RLS is suspected to be failing on localhost
        // But better to fix RLS.
      }
      
      return NextResponse.json({ action: "added" });
    }

  } catch (error: any) {
    console.error("[Vault API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET VAULT STATUS
 * Checks if a specific item is in the user's vault.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) return NextResponse.json({ inVault: false });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ inVault: false });

    const { data } = await supabase
      .from("user_vault")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    return NextResponse.json({ inVault: !!data });
  } catch {
    return NextResponse.json({ inVault: false });
  }
}
