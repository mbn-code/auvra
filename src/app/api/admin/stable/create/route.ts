import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

// ─────────────────────────────────────────────────────────────────────────────
// Validates and coerces a value to a finite positive number.
// Returns null if the value is missing/undefined.
// Returns a validation error string if present but invalid.
// ─────────────────────────────────────────────────────────────────────────────
function parsePositiveFloat(
  value: unknown,
  field: string
): { value: number; error: null } | { value: null; error: string } {
  if (value === undefined || value === null || value === "") {
    return { value: null, error: `${field} is required` };
  }
  const n = parseFloat(String(value));
  if (!isFinite(n)) {
    return { value: null, error: `${field} must be a valid number` };
  }
  if (n < 0) {
    return { value: null, error: `${field} must be non-negative` };
  }
  return { value: n, error: null };
}

function parsePositiveInt(
  value: unknown,
  field: string,
  required = true
): { value: number; error: null } | { value: null; error: string | null } {
  if (value === undefined || value === null || value === "") {
    if (!required) return { value: 0, error: null };
    return { value: null, error: `${field} is required` };
  }
  const n = parseInt(String(value), 10);
  if (!isFinite(n)) {
    return { value: null, error: `${field} must be a valid integer` };
  }
  if (n < 0) {
    return { value: null, error: `${field} must be non-negative` };
  }
  return { value: n, error: null };
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      brand,
      listing_price,
      member_price,
      early_bird_price,
      early_bird_limit,
      preorder_price,
      source_cost,
      stock_level,
      images,
      category,
    } = body;

    // ── Required field validation ──────────────────────────────────────────
    const errors: string[] = [];

    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.push("title is required");
    }
    if (!brand || typeof brand !== "string" || brand.trim() === "") {
      errors.push("brand is required");
    }
    if (!category || typeof category !== "string" || category.trim() === "") {
      errors.push("category is required");
    }
    if (!Array.isArray(images) || images.length === 0) {
      errors.push("at least one image URL is required");
    }

    const listingPriceResult = parsePositiveFloat(listing_price, "listing_price");
    if (listingPriceResult.error) errors.push(listingPriceResult.error);

    const sourceCostResult = parsePositiveFloat(source_cost, "source_cost");
    if (sourceCostResult.error) errors.push(sourceCostResult.error);

    const stockLevelResult = parsePositiveInt(stock_level, "stock_level");
    if (stockLevelResult.error) errors.push(stockLevelResult.error);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // ── Optional numeric fields ────────────────────────────────────────────
    const memberPriceResult = member_price
      ? parsePositiveFloat(member_price, "member_price")
      : { value: null, error: null };
    if (memberPriceResult.error) {
      return NextResponse.json({ error: memberPriceResult.error }, { status: 400 });
    }

    const earlyBirdPriceResult = early_bird_price
      ? parsePositiveFloat(early_bird_price, "early_bird_price")
      : { value: null, error: null };
    if (earlyBirdPriceResult.error) {
      return NextResponse.json({ error: earlyBirdPriceResult.error }, { status: 400 });
    }

    const earlyBirdLimitResult = parsePositiveInt(early_bird_limit, "early_bird_limit", false);
    if (earlyBirdLimitResult.error) {
      return NextResponse.json({ error: earlyBirdLimitResult.error }, { status: 400 });
    }

    const preorderPriceResult = preorder_price
      ? parsePositiveFloat(preorder_price, "preorder_price")
      : { value: null, error: null };
    if (preorderPriceResult.error) {
      return NextResponse.json({ error: preorderPriceResult.error }, { status: 400 });
    }

    // ── Safe to insert ─────────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin
      .from("pulse_inventory")
      .insert({
        vinted_id: `stable_${Date.now()}`,
        title: title.trim(),
        brand: brand.trim(),
        category: category.trim(),
        listing_price: listingPriceResult.value,
        member_price: memberPriceResult.value,
        early_bird_price: earlyBirdPriceResult.value,
        early_bird_limit: earlyBirdLimitResult.value ?? 0,
        preorder_price: preorderPriceResult.value,
        source_price: sourceCostResult.value,
        potential_profit: listingPriceResult.value! - sourceCostResult.value!,
        stock_level: stockLevelResult.value,
        images,
        is_stable: true,
        status: "available",
        is_auto_approved: true,
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
